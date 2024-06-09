import { Router } from "express";
import {
    login,
    logout,
    otpVerification,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logout);
router.route("/get-otp").post(otpVerification);

export default router;
