import { ApiError } from "../utils/ApiError.js";


function errorHandler(err,req,res,next){
    if(err instanceof ApiError){
        if(err.statusCode<=511 || err.statusCode>=400){
            res
            .status(err.statusCode)
            .json({
                success : false ,
                message : err.message ,
                errors : err.errors,
            })
        }
    }
}

export { errorHandler }