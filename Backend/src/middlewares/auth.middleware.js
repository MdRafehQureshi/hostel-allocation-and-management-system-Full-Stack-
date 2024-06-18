import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) throw new ApiError(401, "Unauthorized user!");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded token", decodedToken);
        const student = await db.query(
            "SELECT student_id, first_name, last_name, email, student_phone_number, gender, date_of_birth, degree, course_name, course_duration, admission_year, current_semester, is_disabled, disability_type, degree_of_disability, blood_group, guardian_full_name, guardian_contact_number, relation_with_guardian, guardian_occupation, annual_family_income, country1, state1, city1, district1, address1, pin_code1, police_station1, post_office1, distance1, country2, state2, city2, district2, address2, pin_code2, police_station2, post_office2, distance2, student_photo, student_disability_certificate, admission_proof, income_proof, permanent_address_proof, correspondence_address_proof, resident_id, applicant_id,resident_id FROM student WHERE student_id=$1",
            [decodedToken?.id]
        );
        if (student.rows.length > 0) {
            req.user = { ...student.rows[0], role: decodedToken.role };
            return next();
        }
        const admin = await db.query(
            "SELECT admin_id,email,level,first_name,last_name FROM admin WHERE admin_id=$1",
            [decodedToken?.id]
        );
        if (admin.rows.length > 0) {
            req.user = { ...admin.rows[0], role: decodedToken.role };
            return next();
        }
        throw new ApiError(401, "Invalid Access token");
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Unauthorized user!");
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Token expired!");
        } else {
            console.log(error);
            throw new ApiError(
                error.statusCode || 500,
                error.message || "Something went wrrong"
            );
        }
    }
});

export { verifyJwt };
