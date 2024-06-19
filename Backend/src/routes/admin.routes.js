import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/restriction.middleware.js";
import { getCurrentAdmin } from "../controllers/admin.controller.js";

const router = Router()

router.route("/get-current-admin").get(verifyJwt,restrictTo(["admin1","admin2"]),getCurrentAdmin)

export default router