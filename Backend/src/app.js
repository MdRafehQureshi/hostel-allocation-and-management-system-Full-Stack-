import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static("public"));

import authRouter from  "./routes/auth.routes.js"
import studentRouter from "./routes/student.routes.js"
import adminRouter from "./routes/admin.routes.js"

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/student",studentRouter)
app.use("/api/v1/admin",adminRouter)



app.use(errorHandler)

export { app };
    