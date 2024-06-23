import { db } from "../db/index.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import {
    uploadOnCloudinary,
    deleteUploadedCloudinaryResources,
} from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyOtp } from "../utils/otp.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getCoordinatesOpenCage, haversineDistance } from "../utils/distance.js";
import { log } from "console";


const dirPath = "./public/temp";

const deleteAllFiles = (dirPath) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlinkSync(path.join(dirPath, file));
        }
    });
};

const studentSignUp = asyncHandler(async (req, res) => {
    const { first_name, last_name, student_id, email, password, otp } =
        req.body;
    if (
        [first_name, last_name, student_id, email, password, otp].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const verifyEmail = await db.query("SELECT * FROM otp WHERE email=$1", [
        email,
    ]);
    if (verifyEmail.rows.length < 1) {
        throw new ApiError(400, "Email does not exist");
    }
    if (!verifyEmail.rows[0].otp) {
        throw new ApiError(400, "Please generate OTP.");
    }
    const hashedOtp = verifyEmail.rows[0].otp;
    if (!verifyOtp(otp, hashedOtp)) {
        throw new ApiError(
            400,
            "OTP does not match, please make sure your OTP is correct."
        );
    }
    await db.query("DELETE FROM otp WHERE email=$1", [email]);
    const existingHostelStudent = await db.query(
        "SELECT email ,student_id FROM student WHERE student_id = $1",
        [student_id]
    );
    if (existingHostelStudent?.rows?.length > 0) {
        throw new ApiError(
            409,
            "Student with unique id already exist. Please login.  If it is not you please contact the administration."
        );
    }
    const checkIsStudent = await db.query(
        "SELECT email,student_id FROM regdept WHERE student_id=$1 AND email=$2",
        [student_id, email]
    );
    if (checkIsStudent.rows.length < 1) {
        throw new ApiError(
            409,
            "You need to be a student of the University to register on the platform"
        );
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO student(first_name, last_name, email, student_id, password) VALUES($1,$2,$3,$4,$5)",
            [first_name, last_name, email, student_id, hashedPassword]
        );
    } catch (error) {
        throw new ApiError(500, "Could not Sign Up, please try again later.");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Sign Up Successfull."));
});

const getCurrentStudent = asyncHandler(async (req, res) => {
    if (req.user.resident_id) {
        const resident = await db.query(
            "SELECT * FROM resident WHERE resident_id=$1",
            [req.user.resident_id]
        );
        if (resident.rows.length < 1) {
            throw new ApiError(404, "User Not Found");
        }
        const applicantData = await db.query("SELECT application_status FROM applicant WHERE applicant_id =$1",[req.user.applicant_id])
        const { resident_id, student_id, ...filteredResidentData } =
            resident.rows[0];
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    user: { ...req.user,...applicantData.rows[0], ...filteredResidentData },
                },
                "Fetching of hosteler details successfull."
            )
        );
    } else if (!req.user.resident_id && req.user.applicant_id) {
        const applicant = await db.query(
            "SELECT * FROM applicant WHERE applicant_id=$1",
            [req.user.applicant_id]
        );
        if (applicant.rows.length < 1) {
            throw new ApiError(404, "User Not Found");
        }
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    user: {
                        ...req.user,
                        application_status:
                            applicant.rows[0].application_status,
                    },
                },
                "Fetching of applicant details successfull."
            )
        );
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: { ...req.user },
            },
            "Fetching of student details successfull"
        )
    );
});

const getDistance = asyncHandler(async (req, res) => {
    console.log(req.body);
    console.log("inside function");
    const destinationAddress = "Maulana Abul Kalam Azad University of Technology,West Bengal , NH12, Haringhata, Bara jagulia,Nadia District, West Bengal, 741249, India";
    let originAddress="";
    let temp = "";
    for(let [key,value] of Object.entries(req.body)){
        console.log("inside loop");
        if(!value){
            throw new ApiError(400, "All fields are required.");
        }
        if((key==="police_station1" || key==="post_office1")||(key==="police_station2" || key==="post_office2")){
            continue;
        }
        temp += `${value}, `
        console.log(temp);
    }
    originAddress =  temp.trim().slice(0,-1)
    console.log(originAddress);

    try {
        const coords1 = { lat: 22.9579942, lon: 88.5422764 }; // coordinates of MAKAUT
        const coords2 = await getCoordinatesOpenCage(originAddress);
        console.log(coords2);
        const distance = haversineDistance(coords1, coords2);
        if (!distance) {
            throw new ApiError(
                500,
                "Could not calculate distance, please try again ."
            );
        }
        console.log(
            `The distance between ${originAddress} and ${destinationAddress} is ${distance.toFixed(2)} km`
        );
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { distance },
                    "Distance calculated successfully."
                )
            );
    } catch (error) {
        console.log(error)
        throw new ApiError(error.status||500,error.message||"Something went wrong while calculating distance.");
    }   
});

const submitApplication = asyncHandler(async (req, res) => {
    const date = new Date()
    try {
        console.log("application data", req.body);
        console.log("application files", req.files);
        if (!req.files || Object.keys(req.files).length === 0)
            throw new ApiError(400, "No files were uploaded");

        const requiredFiles = [
            "student_photo",
            "income_proof",
            "admission_proof",
            "permanent_address_proof",
            "correspondence_address_proof",
        ];

        if (req.body.is_disabled === "Yes") {
            requiredFiles.push("student_disability_certificate");
        }

        if (Object.keys(req.files).length !== requiredFiles.length) {
            deleteAllFiles(dirPath);
            // res.status(400).send("All files are required")
            throw new ApiError(400, "Please upload the required files");
        }

        for (const file of requiredFiles) {
            if (!req.files[file] || !req.files[file][0].path) {
                deleteAllFiles(dirPath);
                throw new ApiError(
                    400,
                    `${file.replace(/_/g, " ")} is required`
                );
            }
        }

        const uploadPromises = requiredFiles.map((file) =>
            uploadOnCloudinary(req.files[file][0].path)
        );
        const uploadResults = await Promise.all(uploadPromises);

        if (uploadResults.some((result) => !result|| !result.url)) {
            const publicIds = uploadResults.map(
                (result) => result?.public_id || ""
            );
            await deleteUploadedCloudinaryResources(publicIds);
            deleteAllFiles(dirPath);
            throw new ApiError(500, "Unable to upload files, please try again");
        }
        
        const [
            student_photo_Cloudres,
            income_proof_Cloudres,
            admission_proof_Cloudres,
            permanent_address_proof_Cloudres,
            correspondence_address_proof_Cloudres,
            student_disability_certificate_Cloudres,
        ] = uploadResults;

        const data = req.body;
        const query = `UPDATE student 
        SET student_phone_number = $1, 
            gender = $2, 
            date_of_birth = $3,
            degree = $4, 
            course_name = $5, 
            course_duration = $6, 
            admission_year = $7, 
            current_semester = $8,
            is_disabled = $9, 
            disability_type = $10, 
            degree_of_disability = $11, 
            blood_group = $12,
            guardian_full_name = $13, 
            guardian_contact_number = $14, 
            relation_with_guardian = $15, 
            guardian_occupation = $16, 
            annual_family_income = $17,
            country1 = $18, 
            state1 = $19, 
            city1 = $20, 
            district1 = $21, 
            address1 = $22, 
            pin_code1 = $23, 
            police_station1 = $24, 
            post_office1 = $25, 
            distance1 = $26,
            country2 = $27, 
            state2 = $28, 
            city2 = $29, 
            district2 = $30, 
            address2 = $31, 
            pin_code2 = $32, 
            police_station2 = $33, 
            post_office2 = $34, 
            distance2 = $35,
            student_photo = $36, 
            student_disability_certificate = $37, 
            admission_proof = $38, 
            income_proof = $39, 
            permanent_address_proof = $40, 
            correspondence_address_proof = $41,
            updated_at = $42
        WHERE student_id = $43`;

        const values = [
            data.student_phone_number,
            data.gender,
            data.date_of_birth,
            data.degree,
            data.course_name,
            data.course_duration,
            data.admission_year,
            data.current_semester,
            data.is_disabled,
            data.disability_type,
            data.degree_of_disability,
            data.blood_group,
            data.guardian_full_name,
            data.guardian_contact_number,
            data.relation_with_guardian,
            data.guardian_occupation,
            data.annual_family_income,
            data.country1,
            data.state1,
            data.city1,
            data.district1,
            data.address1,
            data.pin_code1,
            data.police_station1,
            data.post_office1,
            data.distance1,
            data.country2,
            data.state2,
            data.city2,
            data.district2,
            data.address2,
            data.pin_code2,
            data.police_station2,
            data.post_office2,
            data.distance2,
            student_photo_Cloudres.url,
            student_disability_certificate_Cloudres?.url || null,
            admission_proof_Cloudres.url,
            income_proof_Cloudres.url,
            permanent_address_proof_Cloudres.url,
            correspondence_address_proof_Cloudres.url,
            date,
            req.user.student_id,
        ];

        try {
            await db.query("BEGIN");
            await db.query(query, values);
            const result = await db.query(
                "INSERT INTO applicant (application_status, student_id) VALUES($1, $2) RETURNING applicant_id",
                [1, req.user.student_id]
            );
            await db.query(
                "UPDATE student SET applicant_id=$1 WHERE student_id=$2",
                [result.rows[0].applicant_id, req.user.student_id]
            );
            await db.query("COMMIT");
        } catch (error) {
            await db.query("ROLLBACK");
            const publicIds = uploadResults.map(
                (result) => result?.public_id || ""
            );
            await deleteUploadedCloudinaryResources(publicIds);
            await db.query(query, [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                req.user.student_id,
            ]);
            console.log(error);
            throw new ApiError(
                500,
                error?.message ||
                    "Unable to submit application, please try again later"
            );
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Application submitted successfully")
            );
    } catch (error) {
        console.log(error);
        throw new ApiError(
            error.status || 500,
            error.message || "Something went wrong"
        );
    }
});

export { studentSignUp, getCurrentStudent, submitApplication , getDistance};
