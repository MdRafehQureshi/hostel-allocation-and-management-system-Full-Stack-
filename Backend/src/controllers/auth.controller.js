import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../db/index.js";
import { sendEmail } from "../utils/mail.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
};
const generateAccessAndRefreshTokens = (userId, role) => {
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId, role);
    if (!accessToken || !refreshToken) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens."
        );
    }
    return { accessToken, refreshToken };
};

const otpVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "To generate OTP email is required");

    const existingOtpData = await db.query("SELECT * FROM otp WHERE email=$1", [
        email,
    ]);
    console.log(existingOtpData);
    if (existingOtpData.rows.length > 0) {
        await db.query("DELETE FROM otp WHERE email=$1", [email]);
    }
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    try {
        await db.query("INSERT INTO otp(email,otp) VALUES ($1,$2)", [
            email,
            hashedOtp,
        ]);
    } catch (error) {
        throw new ApiError(500, "Could not save email");
    }

    try {
        const info = await sendEmail(otp, email);
        res.status(200).json({
            message: `mail sent to ${email}`,
        });
    } catch (error) {
        throw new ApiError(502, "Unable to send email");
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if ([email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const studentLoginData = await db.query(
        "SELECT email, password, student_id FROM student WHERE email=$1",
        [email]
    );
    if (studentLoginData.rows.length > 0) {
        const checkPassword = await bcrypt.compare(
            password,
            studentLoginData.rows[0].password
        );
        if (!checkPassword) {
            throw new ApiError(400, "Invalid user credentials");
        }
        const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
            studentLoginData.rows[0].student_id,
            "student"
        );
        try {
            await db.query(
                "UPDATE student SET refresh_token=$1 WHERE student_id = $2",
                [refreshToken, studentLoginData.rows[0].student_id]
            );
        } catch (error) {
            throw new ApiError(
                500,
                "Something went wrong while generating access and refresh tokens."
            );
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: {
                            id: studentLoginData.rows[0].student_id,
                            email: studentLoginData.rows[0].email,
                            role: "student",
                        },
                    },
                    "User logged in successfully"
                )
            );
    }

    const adminData = await db.query(
        "SELECT email, password, admin_id, level FROM admin WHERE email=$1",
        [email]
    );
    if (adminData.rows.length < 1) {
        throw new ApiError(400, "User not found");
    }
    const checkPassword = await bcrypt.compare(
        password,
        adminData.rows[0].password
    );
    if (!checkPassword) {
        throw new ApiError(400, "Invalid user credentials");
    }
    console.log(typeof adminData.rows[0].level);
    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
        adminData.rows[0].admin_id,
        adminData.rows[0].level === 1 ? "admin1" : "admin2"
    );
    try {
        await db.query(
            "UPDATE admin SET refresh_token=$1 WHERE admin_id = $2",
            [refreshToken, adminData.rows[0].admin_id]
        );
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens."
        );
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: {
                        id: adminData.rows[0].admin_id,
                        email: adminData.rows[0].email,
                        role:
                            adminData.rows[0].level === 1 ? "admin1" : "admin2",
                    },
                },
                "User logged in successfully"
            )
        );
});

const logout = asyncHandler(async (req, res) => {
    Object.keys(req.user).includes("admin_id")
        ? await db.query(
              "UPDATE admin SET refresh_token=$1 WHERE admin_id = $2",
              ["", req.user.admin_id]
          )
        : await db.query(
              "UPDATE student SET refresh_token=$1 WHERE student_id = $2",
              ["", req.user.student_id]
          );
    return res
        .status(200)
        .clearCookie("accessToken", req.user.access_token, cookieOptions)
        .clearCookie("refreshToken", req.user.refresh_token, cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies.refreshToken;
    if (!incomingToken) {
        console.log("unauhorized");
        throw new ApiError(401, "Unauthorized request!");
    }

    const decodedToken = jwt.verify(
        incomingToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken) {
        throw new ApiError(401, "Refresh token invalid or expired");
    }
    if (decodedToken.role === "student") {
        const student = await db.query(
            "SELECT refresh_token FROM student WHERE student_id=$1",
            [decodedToken.id]
        );
        if (student.rows.length < 1) {
            throw new ApiError(401, "Invalid refresh token");
        }
        if (incomingToken !== student.rows[0].refresh_token) {
            throw new ApiError(401, "Refresh token expired or used");
        }

        const accessToken = generateAccessToken(decodedToken.id, "student");
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", incomingToken, cookieOptions)
            .json(
                new ApiResponse(200, {}, "Access token refreshed successfully")
            );
    }
    const admin = await db.query(
        "SELECT refresh_token FROM admin WHERE admin_id=$1",
        [decodedToken.id]
    );
    if (admin.rows.length < 1) {
        throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingToken !== admin.rows[0].refresh_token) {
        throw new ApiError(401, "Refresh token expired or used");
    }

    const accessToken = generateAccessToken(decodedToken.id, decodedToken.role);
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", incomingToken, cookieOptions)
        .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

const updatePassword = asyncHandler(async (req, res) => {
    const { email, password, otp } = req.body;
    const verifyEmail = await db.query("SELECT * FROM otp WHERE email=$1", [
        email,
    ]);
    if (verifyEmail.rows.length < 1) {
        throw new ApiError(404, "Could not verify the email.");
    }
    if (!verifyEmail.rows[0].otp) {
        throw new ApiError(400, "Please generate otp");
    }
    if (!verifyOtp(otp, verifyEmail.rows[0].otp)) {
        throw new ApiError(
            400,
            "Incorrect OTP"
        );
    }
    await db.query("DELETE FROM otp WHERE email=$1", [email]);
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await db.query(
        "SELECT password FROM student WHERE email=$1",
        [email]
    );
    if (student.rows.length > 0) {
        await db.query("UPDATE student SET password=$1 WHERE email=$2",
         [ hashedPassword, email,]
        );
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Student password updated successfully"
                )
            );
    }
    const admin = await db.query("SELECT password FROM admin WHERE email=$1", [
        email,
    ]);
    if (admin.rows.length > 0) {
        await db.query("UPDATE student SET password=$1 WHERE email=$2", [
            hashedPassword,
            email,
        ]);
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Admin password updated successfully")
            );
    }
    throw new ApiError(404, "User cannot be found");
});

export { login, logout, otpVerification, refreshAccessToken, updatePassword };
