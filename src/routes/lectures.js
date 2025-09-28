import express from "express";
import {
  createLecture,
  joinLecture,
  listLectures,
} from "../controllers/lectureController.js";
import { requireAuth } from "../utils/auth.js";
const router = express.Router();

router.get("/:courseId/lectures", requireAuth, listLectures);
router.post("/join/:lectureId", requireAuth, joinLecture);
router.post("/:courseId/lectures", requireAuth, createLecture);

export default router;
