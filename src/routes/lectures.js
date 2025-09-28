import express from "express";
import { createLecture, startLecture, endLecture, joinLecture } from "../controllers/lectureController.js";
import { requireAuth } from "../utils/auth.js";
const router = express.Router();

router.post("/:courseId/lectures", requireAuth, createLecture);
router.post("/start/:lectureId", requireAuth, startLecture);
router.post("/end/:lectureId", requireAuth, endLecture);
router.post("/join/:lectureId", requireAuth, joinLecture);

export default router;
