import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/restriction.middleware.js";
import { test, getCurrentAdmin, updateAdminEmail, addHostel, addRoom, allotRooms, getAllHostels, getAllRooms, getAllActiveResidents, getAllActiveApplicants } from "../controllers/admin.controller.js";

const router = Router()

router.route("/get-current-admin").get(verifyJwt,restrictTo(["admin1","admin2"]),getCurrentAdmin)
router.route("/update-admin-email").post(verifyJwt,restrictTo(["admin1","admin2"]),updateAdminEmail)
router.route("/hostel").post(verifyJwt,restrictTo(["admin1"]),addHostel)
router.route("/hostels").get(verifyJwt,restrictTo(["admin1"]),getAllHostels)
router.route("/rooms").post(verifyJwt,restrictTo(["admin1"]),addRoom)
router.route("/all-rooms").get(verifyJwt,restrictTo(["admin1"]),getAllRooms)
router.route("/all-active-residents").get(verifyJwt,restrictTo(["admin1","admin2"]),getAllActiveResidents)
router.route("/all-active-applicants").get(verifyJwt,restrictTo(["admin1"]),getAllActiveApplicants)
router.route("/test").post(test)
router.route("/allot").post(verifyJwt,restrictTo(["admin1"]),allotRooms)

export default router