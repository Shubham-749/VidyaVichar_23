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

router.patch("/question/:questionId", requireAuth, updateQuestion);
router.patch("/question/important/:questionId", requireAuth, markImportant);
router.patch("/question/unimportant/:questionId", requireAuth, unmarkImportant);
router.post("/:lectureId/questions", requireAuth, postQuestion);
router.get("/:lectureId/questions", requireAuth, listQuestions);

export default router;
