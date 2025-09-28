import express from "express";
import {
  createCourse,
  listCourses,
  enrollUser,
} from "../controllers/courseController.js";
import { requireAuth, requireRole } from "../utils/auth.js";
const router = express.Router();

router.get("/", requireAuth, listCourses);
router.post("/", createCourse);
router.post("/enroll", enrollUser);

export default router;
