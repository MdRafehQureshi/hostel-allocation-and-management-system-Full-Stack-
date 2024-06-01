import dotenv from "dotenv";
import connectDb from "./db";
import { app } from "./app.js";
dotenv.config({
    path: "./.env",
});


;( async ()=>{
    try {
        await connectDb()
        app.listen(process.env.PORT||8000,()=>{
            console.log(`Server is running at port : ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("POSTGRES CONNECTION FAILED !!",error);
    }
})()