import express from "express";
import { postQuestion, listQuestions, updateQuestion } from "../controllers/questionController.js";
import { requireAuth } from "../utils/auth.js";
const router = express.Router();

router.post("/:lectureId/questions", requireAuth, postQuestion);
router.get("/:lectureId/questions", requireAuth, listQuestions);
router.patch("/question/:questionId", requireAuth, updateQuestion);

export default router;
