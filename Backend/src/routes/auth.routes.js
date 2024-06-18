import { Router } from "express";
import {
    login,
    logout,
    otpVerification,
    refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logout);
router.route("/get-otp").post(otpVerification);
router.route("/access-token").post(refreshAccessToken)

export default router;
