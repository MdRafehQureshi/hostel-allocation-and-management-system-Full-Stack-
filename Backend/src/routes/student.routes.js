import { Router } from "express";
import { getCurrentStudent, getDistance, studentSignUp,  submitApplication} from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/restriction.middleware.js";

const router = Router();

router.route("/student-registration").post(studentSignUp)
router.route("/get-current-student").get(verifyJwt,restrictTo(["student"]),getCurrentStudent)
router.route("/get-distance").post(getDistance)
router.route("/application-form").post(verifyJwt,upload.fields([
    {name: "student_photo", maxCount:1},
    {name: "student_disability_certificate", maxCount:1},
    {name: "income_proof", maxCount:1},
    {name: "admission_proof", maxCount:1},
    {name: "permanent_address_proof", maxCount:1},
    {name: "correspondence_address_proof", maxCount:1}
]),submitApplication);


export default router;
