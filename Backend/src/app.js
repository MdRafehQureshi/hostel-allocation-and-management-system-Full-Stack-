import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

import otpRouter from "./routes/otp.routes.js"
// import studentRouter from "./routes/student.routes.js"

app.use("/api/v1/otp",otpRouter)
// app.use("/api/v1/student",studentRouter)



app.use(errorHandler)

export { app };
    