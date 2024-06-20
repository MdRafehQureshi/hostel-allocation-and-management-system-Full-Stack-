import { Router } from "express";
import {
    login,
    logout,
    otpVerification,
    refreshAccessToken,
    updatePassword,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logout);
router.route("/get-otp").post(otpVerification);
router.route("/access-token").post(refreshAccessToken)
router.route("/update-password").post(updatePassword)

export default router;
