import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/mail.js";
import { generateOtp, hashOtp } from "../utils/otp.js";

const otpVerification = asyncHandler( async (req,res) =>{
    console.log("request = " + req.body.email);
    const {email} = req.body
    if (!email) throw new ApiError(400, "To generate OTP email is required");
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp)
    try {
        await db.query('INSERT INTO otp(email,otp) VALUES ($1,$2)',[email,hashedOtp])
    } catch (error) {
        throw new ApiError(500,"Could not save email")
    }
    
    try {
        const info = await sendEmail(otp,email);
        res.status(200).json({
            message:`mail sent to ${email}` ,
        })
    } catch (error) {
        throw new ApiError(502,"Unable to send email")
    }
})

export { otpVerification };
