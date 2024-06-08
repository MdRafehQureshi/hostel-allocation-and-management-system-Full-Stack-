import { Router } from "express";
import { login,logout,otpVerification } from "../controllers/auth.controller.js";

const router = Router()

router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/get-otp").post(otpVerification)

export default router