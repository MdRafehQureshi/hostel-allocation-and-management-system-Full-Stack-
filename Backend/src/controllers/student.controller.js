import { db } from "../db/index.js";
import bcrypt from "bcrypt"
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteUploadedCloudinaryResources,
} from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import fs from "fs";
import path from "path";
import { log } from "console";
import { verifyOtp } from "../utils/otp.js";

const dirPath = "./public/temp";

const deleteAllfiles = (dirPath) => {
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
        email
    ]);
    if (verifyEmail.rows.length < 1) {
        throw new ApiError(406, "Email does not exist");
    }
    if(!verifyEmail.rows[0].otp){
        throw new ApiError(400,"Please generate OTP.")
    }
    const hashedOtp = verifyEmail.rows[0].otp;
    if (!verifyOtp(otp, hashedOtp)) {
        throw new ApiError(
            409,
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
            "You mmust be a student of the University to register on the platform"
        );
    }
    //TODO - HASH THE PASSWORD BEFORE STORING
    
    try {
        const hashedPassword = await bcrypt.hash(password,10)
        await db.query(
            "INSERT INTO student(first_name, last_name, email, student_id, password) VALUES($1,$2,$3,$4,$5)",
            [first_name, last_name, email, student_id, hashedPassword]
        );
    } catch (error) {
        throw new ApiError(500, "Could not Sign Up, please try again later.");
    }
    res.status(200).json({
        message: "Sign Up Successfull.",
    });
});

// const submitApplication = asyncHandler(async (req, res) => {
//     if (!req.files || Object.keys(req.files).length === 0)
//         throw new ApiError(400, "No files were uploaded");

//     if (Object.keys(req.files).length !== 6) {
//         deleteAllfiles(dirPath);
//         // res.status(400).send("All files are required")
//         throw new ApiError(400, "All files are required");
//     }

//     if (!req.files.student_photo[0].path) {
//         deleteAllfiles(dirPath)
//         throw new ApiError(400, "Student Photo is required");
//     }

//     if (!req.files.student_disability_certificate[0].path) {
//         deleteAllfiles(dirPath)
//         throw new ApiError(400, "Student Disability Certificate is required");
//     }

//     if (!req.files.income_proof[0].path) {
//         deleteAllfiles(dirPath)
//         throw new ApiError(400, "Income Proof is required");
//     }

//     if (!req.files.admission_proof[0].path) {
//         deleteAllfiles(dirPath)
//         throw new ApiError(400, "Admission Proof is required");
//     }

//     if (!req.files.permanent_address_proof[0].path) {
//         deleteAllfiles(dirPath)
//         throw new ApiError(400, "Permanent Address Proof is required");
//     }
       
//     if (! req.files.correspondence_address_proof[0].path) {
//         deleteAllfiles(dirPath)
//         throw new ApiError(400, "Correspondpermanentroof is required");
//     }

//     const student_photo_Cloudres = await uploadOnCloudinary(req.files.student_photo[0].path);
//     const student_disability_certificate_Cloudres = await uploadOnCloudinary( req.files.student_disability_certificate[0].path );
//     const income_proof_Cloudres = await uploadOnCloudinary( req.files.income_proof[0].path);
//     console.log(income_proof_Cloudres);
//     const admission_proof_Cloudres = await uploadOnCloudinary(req.files.admission_proof[0].path );
//     const permanent_address_proof_Cloudres = await uploadOnCloudinary( req.files.permanent_address_proof[0].path );
//     const correspondence_address_proof_Cloudres = await uploadOnCloudinary( req.files.correspondence_address_proof[0].path );
//     if (
//         !student_photo_Cloudres ||
//         !student_disability_certificate_Cloudres ||
//         !income_proof_Cloudres ||
//         !admission_proof_Cloudres ||
//         !permanent_address_proof_Cloudres ||
//         !correspondence_address_proof_Cloudres
//     ) {
//         await deleteUploadedCloudinaryResources([student_photo_Cloudres.public_id||"",
//             student_disability_certificate_Cloudres?.public_id||"",
//             income_proof_Cloudres?.public_id||"",
//             admission_proof_Cloudres?.public_id||"",
//             permanent_address_proof_Cloudres?.public_id||"",
//             correspondence_address_proof_Cloudres?.public_id||""
//         ])
//         deleteAllfiles(dirPath)
//         throw new ApiError(500,"Unable to uploadd files , please try again")
//     }

//     const data = req.body

//     const query = `
//     INSERT INTO students (
//       first_name, last_name, email, student_phone_number, gender, date_of_birth, 
//       degree, course_name, course_duration, admission_year, current_semester, 
//       is_disabled, disability_type, degree_of_disability, blood_group, 
//       guardian_full_name, guardian_contact_number, relation_with_guardian, guardian_occupation, annual_family_income, 
//       country1, state1, city1, district1, address1, pin_code1, police_station1, post_office1, distance1, 
//       country2, state2, city2, district2, address2, pin_code2, police_station2, post_office2, distance2, 
//       student_photo, student_disability_certificate, admission_proof, income_proof, permanent_address_proof, correspondence_address_proof
//     ) VALUES (
//       $1, $2, $3, $4, $5, $6, 
//       $7, $8, $9, $10, $11, 
//       $12, $13, $14, $15, 
//       $16, $17, $18, $19, $20, 
//       $21, $22, $23, $24, $25, $26, $27, $28, $29, 
//       $30, $31, $32, $33, $34, $35, $36, $37, $38, 
//       $39, $40, $41, $42, $43, $44
//     )
//   `;

//   const values = [
//     data.first_name, data.last_name, data.email, data.student_phone_number, data.gender, data.date_of_birth,
//     data.degree, data.course_name, data.course_duration, data.admission_year, data.current_semester,
//     data.is_disabled, data.disability_type, data.degree_of_disability, data.blood_group,
//     data.guardian_full_name, data.guardian_contact_number, data.relation_with_guardian, data.guardian_occupation, data.annual_family_income,
//     data.country1, data.state1, data.city1, data.district1, data.address1, data.pin_code1, data.police_station1, data.post_office1, data.distance1,
//     data.country2, data.state2, data.city2, data.district2, data.address2, data.pin_code2, data.police_station2, data.post_office2, data.distance2,
//     student_photo_Cloudres.url,
//     student_disability_certificate_Cloudres.url,
//     admission_proof_Cloudres.url,
//     income_proof_Cloudres.url,
//     permanent_address_proof_Cloudres.url,
//     correspondence_address_proof_Cloudres.url
//   ];
//      db.query(query,values,(err,res)=>{

//    })

//     res.status(200).json({
//         message: "OK",
//     });
// });

export {studentSignUp};
// submitApplication,
