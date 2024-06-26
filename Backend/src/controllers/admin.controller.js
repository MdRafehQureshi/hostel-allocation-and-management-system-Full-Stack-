import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyOtp } from "../utils/otp.js";
import {db} from "../db/index.js"

const getCurrentAdmin = asyncHandler(async (req, res) => {
    //if admin1 fetch all data from all hostel
    //if admin2 fetch for the assigned hostel

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: { ...req.user } },
                "Admin data fetched successfully"
            )
        );
});

const getAllHostels = asyncHandler(async(req,res)=>{
    try {
        const hostels = await db.query("SELECT * FROM hostel")
        const count = await db.query('SELECT COUNT(*) from hostel')
        if(hostels.rows.length<1){
            throw new ApiError(404,"No hostel found")
        }
        return res.status(200).json(new ApiResponse(200,
            { hostels:hostels.rows,
              count: count.rows[0].count,  
            }
            ,"Hostels data fetched successfully"))
} catch (error) {
    console.log(error)
}
}) 

const getAllRooms = asyncHandler(async(req,res)=>{
    const rooms = await db.query("SELECT * FROM room")
    if(rooms.rows.length<1){
        throw new ApiError(404,"No room found")
    }
    return res.status(200).json(new ApiResponse(200,{
        rooms:rooms.rows
    },"Rooms data fetched successfully"))
}) 

const getAllActiveResidents = asyncHandler(async(req,res)=>{
    let residents = "";
    let count = "";
    if (req.user.role === "admin1") {
        residents = await db.query(
            "SELECT r.* ,s.first_name,s.last_name FROM resident r JOIN student s ON r.student_id=s.student_id WHERE is_active=$1",
            [true]
        );
        count = await db.query(
            "SELECT COUNT(*) FROM resident WHERE is_active=$1",
            [true]
        );
    } else if (req.user.role === "admin2") {
        residents = await db.query(
            "SELECT r.* ,s.first_name,s.last_name FROM resident r JOIN student s ON r.student_id=s.student_id WHERE is_active=$1 AND hostel_id=$2",
            [true, req.user.hostel_id]
        );
        count = await db.query(
            "SELECT COUNT(*) FROM resident WHERE is_active=$1 AND hostel_id=$2",
            [true, req.user.hostel_id]
        );
    }
    if (residents.rows.length < 1) {
        throw new ApiError(400, "No active residents");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                residents:residents.rows,
                count:count.rows[0].count,
                },
                "Data fetched successfully"
            )
        );
})

const getAllActiveApplicants = asyncHandler(async(req,res)=>{
    const applicants = await db.query(`SELECT s.student_id, s.first_name,s.last_name,a.applicant_id,a.application_status
                                     FROM student s 
                                     JOIN applicant a ON s.student_id = a.student_id
                                     WHERE is_active = true `)
    const activeCount = await db.query(`SELECT COUNT(*) FROM applicant WHERE is_active=true`) 
    if(applicants.rows<1){
        throw new ApiError(400,"No active applicants found")
    }
    return res.json(new ApiResponse(200,{
        applicants:applicants.rows,
        activeCount:activeCount.rows[0].count,
    },"Active applicant data fetched successfully"))
})

const updateAdminEmail = asyncHandler(async (req,res)=>{
   try {
     console.log(req.body);
     const {old_email, old_email_otp, new_email, new_email_otp} = req.body
     
     const verifyOldEmail = await db.query("SELECT * FROM otp WHERE email = $1",[old_email])
     console.log("old otp res",verifyOldEmail.rows[0])
     if(verifyOldEmail.rows.length<1){
         throw new ApiError(404,"Could not verify the current email.")
     }
     if(!verifyOldEmail.rows[0].otp){
         throw new ApiError(404,"Please generate OTP for current email.")
     }
     if(!verifyOtp(old_email_otp,verifyOldEmail.rows[0].otp)){
         throw new ApiError(400,"Incorrect OTP")
     }
     if(req.user.email !== old_email ){
         throw new ApiError(400,"Current email is incorrect.")
     }
     await db.query("DELETE FROM otp WHERE email=$1",[old_email])
 
     const verifyNewEmail = await db.query("SELECT * FROM otp WHERE email = $1",[new_email])
 
     if(verifyNewEmail.rows.length<1){
         throw new ApiError(404,`Could not verify  ${new_email}`)
     }
     if(!verifyNewEmail.rows[0].otp){
         throw new ApiError(404,`Please generate OTP for ${new_email}.`)
     }
     if(!verifyOtp(new_email_otp,verifyNewEmail.rows[0].otp)){
         throw new ApiError(400,"Incorrect OTP")
     }
     await db.query("DELETE FROM otp WHERE email=$1",[new_email])
 
     const response = await db.query("UPDATE admin SET email=$1 WHERE email=$2 RETURNING email",[new_email,old_email])
 
     if(response.rows[0].email !== new_email){
         throw new ApiError(400,"Could not update the email")
     }
     return res.status(200).json(new ApiResponse(200,{},"Email updated successfully"))
   } catch (error) {
        console.log(error)
   }
})

const addHostel = asyncHandler(async(req,res)=>{
    if(!(req.body.gender)|| !(req.body.floor_capacity)){
        throw new ApiError(400,"Both fields are required to add hostel")
    }
    const gender = req.body.gender.toLowerCase() 
    const genderPrefix = gender==="male"?"B":"G"
    const totalHostel =  await db.query("Select Count(*) from hostel WHERE hostel_id LIKE $1",[`${genderPrefix}%`]) 
    const newHostelCount = parseInt(totalHostel.rows[0].count,10) + 1
    const newHostelId = `${genderPrefix}${newHostelCount}`
    try {
        await db.query("INSERT INTO hostel(hostel_id,floor_capacity) VALUES($1,$2)",[newHostelId,req.body.floor_capacity])
    } catch (error) {
        console.log("Error in adding hostel",error)
        throw new ApiError(500,"Could not add hostel")
    }
    return res.status(200).json(new ApiResponse(200,{},"Hostel added successfully"))
})

const addRoom = asyncHandler(async (req, res) => {
    const hostelId = req.body.hostel_id;
    if (!hostelId) {
        throw new ApiError(400, "Please select hostel to add rooms.");
    }
    const floorCapacityData = await db.query(
        "SELECT floor_capacity FROM hostel WHERE hostel_id=$1",
        [hostelId]
    );
    if(floorCapacityData.rows.length<1){
        throw new ApiError(404,`Could not find hostel ${hostelId} to add rooms to.`)
    }
    const floorCapacity = floorCapacityData.rows[0].floor_capacity;
    const totalRoomsData = await db.query("SELECT COUNT(*) FROM room WHERE hostel_id=$1",[hostelId]);
    const totalRooms = parseInt(totalRoomsData.rows[0].count,10);
    const roomsInLastFloor = totalRooms % floorCapacity;
    const totalFloors = Math.floor(totalRooms / floorCapacity);
    const newRoomNo =
        (floorCapacity > totalRooms)
            ? totalRooms + 1
            : roomsInLastFloor +
              (totalFloors * 100) + 1;
    const room = await db.query(
        "INSERT INTO room(room_no,hostel_id) VALUES($1,$2) RETURNING room_no",
        [newRoomNo, hostelId]
    );
    if (room.rows.length < 1 || !room.rows[0].room_no) {
        throw new ApiError(500, "Could not add room");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Room successfully added"));
});


const allotRooms = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin1") {
        throw new ApiError(403, "Access denied");
    }

    try {
        // Get the list of applicants who meet the criteria
        const applicants = await db.query(
            `SELECT s.*, a.application_status 
            FROM student s 
            JOIN applicant a ON s.student_id = a.student_id
            WHERE a.application_status IN (1, 3)
              AND (
                ((s.is_disabled = true AND s.degree_of_disability >= 40) OR 
                (LEAST(s.distance1, s.distance2) > 200) OR 
                (s.annual_family_income < 250000)) AND a.is_active=true
              )
            ORDER BY  s.degree_of_disability DESC, LEAST(s.distance1, s.distance2) DESC, s.annual_family_income ASC`
        );

        for (let student of applicants.rows) {
            try {    
            console.log("student", student);    
            await db.query('BEGIN');
            // Check if the course is completed
            const admissionYear = student.admission_year;
            const courseDuration = student.course_duration;
            const currentDate = new Date();
            const courseEndDate = new Date(`06-01-${admissionYear + courseDuration}`);

            if (currentDate > courseEndDate) {
                await db.query("UPDATE applicant SET is_active=false WHERE student_id=$2",[student.student_id])
                await db.query('COMMIT')
                continue;
            }

            // Determine the hostel prefix based on gender
            const gender = student.gender.toLowerCase();
            const hostelPrefix = gender === "male" ? "B" : "G";
            console.log(hostelPrefix);
                // Find a room with availability
                const room = await db.query(
                    `SELECT * FROM room
                     WHERE hostel_id LIKE $1
                     AND (student1 IS NULL OR student2 IS NULL OR student3 IS NULL)
                     LIMIT 1`,
                    [`${hostelPrefix}%`]
                );
    
                if (room.rows.length === 0) {
                    // If no rooms are available, update application status to 3 (rejected)
                    await db.query(
                        `UPDATE applicant 
                        SET application_status = 3 
                        WHERE student_id = $1`,
                        [student.student_id]
                    );

                    await db.query('COMMIT')
                    continue;
                }
    
                const roomNo = room.rows[0].room_no;
                const hostelId = room.rows[0].hostel_id;
                // Allocate the room
                let studentField = "";
                if (room.rows[0].student1 === null) {
                    studentField = "student1";
                } else if (room.rows[0].student2 === null) {
                    studentField = "student2";
                } else if (room.rows[0].student3 === null) {
                    studentField = "student3";
                }
    
                await db.query(
                    `UPDATE room
                    SET ${studentField} = $1
                    WHERE room_no = $2 AND hostel_id =$3`,
                    [student.student_id, roomNo, hostelId]
                );
    
                const residentId = await db.query(
                    `INSERT INTO resident (student_id, hostel_id, room_no, is_active)
                    VALUES ($1, $2, $3, true) RETURNING resident_id`,
                    [student.student_id, room.rows[0].hostel_id, room.rows[0].room_no]
                );

                await db.query(
                    'UPDATE student SET resident_id = $1 WHERE student_id =$2',
                    [residentId.rows[0].resident_id,student.student_id]
                )
    
                await db.query(
                    `UPDATE applicant 
                    SET application_status = 2,
                    is_active = false 
                    WHERE student_id = $1`,
                    [student.student_id]
                );
                await db.query('COMMIT')
            } catch (error) {
                await db.query('ROLLBACK')
                console.log(error)
            }
        }

        return res.status(200).json(new ApiResponse(200, {}, "Room allotment process completed successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Room allotment process failed");
    }
});

const test = asyncHandler(async (req,res)=>{
    const date = new Date()
    try {
       const a= await db.query("select * from applicant where is_active = false")
console.log(a.rows);
        // const floorCapacity = 32
        // const totalRooms = 3
    
        // const roomsInLastFloor = totalRooms % floorCapacity;
        // const totalFloors = Math.floor(totalRooms / floorCapacity);
        // const newRoomNo =
        //     (floorCapacity > totalRooms)
        //         ? totalRooms + 1
        //         : roomsInLastFloor +
        //           (totalFloors * 100) + 1;

        // console.log(newRoomNo);
        // const h = await db.query("Select * from hostel") 
        // console.log(h.rows);
    //     console.log(h.rows.length);
    //    const student = await db.query("Update student set updated_at=$1 where email = $2 returning updated_at",[ date,"mdrafehqureshi786@gmail.com"])
    //    const data = student.rows[0].updated_at
    // const totalRooms =4
    // const floorCapacity =2
    // const roomsInLastFloor = totalRooms%floorCapacity
    // const totalFloors = Math.floor(totalRooms/floorCapacity)
    // // console.log(rem);
    // //    console.log(rem + Math.floor(quo)*100+1);
    //    console.log((floorCapacity>totalRooms)?totalRooms+1:(roomsInLastFloor + (totalFloors *100)+1));
    //    const adyear = 2020
    //    const cd = 4
    //    const d1 = new Date(`06-01-${adyear}`)
    //    const d3 = new Date(`07-01-${adyear + cd}`)
    //    console.log(date.toLocaleDateString());
    //    console.log(d1.getMonth());
    //    console.log((d1.getTime()<date.getTime())&&(date.getTime()<d3.getTime()));
       return res.json({message:"ok"})
} catch (error) {
    console.log(error);
}
})

export {
    getCurrentAdmin,
    updateAdminEmail,
    addHostel,
    addRoom,
    getAllHostels,
    getAllRooms,
    allotRooms,
    getAllActiveResidents,
    getAllActiveApplicants,
    test,
};