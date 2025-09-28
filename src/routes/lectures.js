import express from "express";
import { createLecture, joinLecture } from "../controllers/lectureController.js";
import { requireAuth } from "../utils/auth.js";
const router = express.Router();

router.post("/:courseId/lectures", requireAuth, createLecture);
router.post("/join/:lectureId", requireAuth, joinLecture);

export default router;
