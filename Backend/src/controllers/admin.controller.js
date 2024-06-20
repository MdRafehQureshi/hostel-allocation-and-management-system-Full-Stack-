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


export {getCurrentAdmin, updateAdminEmail}