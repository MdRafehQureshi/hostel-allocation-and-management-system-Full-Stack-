import { Router } from "express";
import { submitApplication } from "../controllers/student.controller.js";

const router = Router();

router.route("/application-form").post(submitApplication);

export default router;
