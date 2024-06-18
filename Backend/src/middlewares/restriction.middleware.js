import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const restrictTo = (roles)=>{
    return asyncHandler(async(req,res,next)=>{
        if(roles.includes(req.user.role)){
            next()
        }
        else{
            throw new ApiError(403,"You don't have permissions to perform this action.")
        }
    })
}

export {restrictTo}