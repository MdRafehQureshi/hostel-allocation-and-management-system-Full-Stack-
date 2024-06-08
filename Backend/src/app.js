import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static("public"));

import otpRouter from "./routes/otp.routes.js"
import authRouter from  "./routes/auth.routes.js"
import studentRouter from "./routes/student.routes.js"


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/otp",otpRouter)
app.use("/api/v1/student",studentRouter)



app.use(errorHandler)

export { app };
    