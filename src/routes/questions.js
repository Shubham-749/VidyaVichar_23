import express from "express";
import {
  postQuestion,
  listQuestions,
  updateQuestion,
  markImportant,
  unmarkImportant,
} from "../controllers/questionController.js";
import { requireAuth } from "../utils/auth.js";
const router = express.Router();

router.post("/:lectureId/questions", requireAuth, postQuestion);
router.get("/:lectureId/questions", requireAuth, listQuestions);
router.patch("/question/:questionId", requireAuth, updateQuestion);
router.patch("/question/important/:questionId", requireAuth, markImportant);
router.patch("/question/unimportant/:questionId", requireAuth, unmarkImportant);

export default router;
