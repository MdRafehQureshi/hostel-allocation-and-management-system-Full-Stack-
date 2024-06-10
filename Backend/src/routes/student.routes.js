import { Router } from "express";
import { getCurrentStudent, studentSignUp} from "../controllers/student.controller.js";
// submitApplication,
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/student-registration").post(studentSignUp)
router.route("/get-current-student").get(verifyJwt,getCurrentStudent)

// router.route("/application-form").post(upload.fields([
//     {name: "student_photo", maxCount:1},
//     {name: "student_disability_certificate", maxCount:1},
//     {name: "income_proof", maxCount:1},
//     {name: "admission_proof", maxCount:1},
//     {name: "permanent_address_proof", maxCount:1},
//     {name: "correspondence_address_proof", maxCount:1}
// ]),submitApplication);


export default router;
