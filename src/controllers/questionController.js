import Question from "../models/Question.js";
import Lecture from "../models/Lecture.js";
import Course from "../models/Course.js";

export const postQuestion = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { content } = req.body;
    const lecture = await Lecture.findById(lectureId);
    const start = new Date(lecture.startTime);
    const end = new Date(lecture.endTime);
    const current = new Date();
    if (!lecture || start > current || end < current)
      return res.status(400).json({ message: "Lecture not ongoing" });
    const course = await Course.findById(lecture.course);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.students.includes(req.user.id))
      return res.status(403).json({ message: "Not enrolled" });
    const q = await Question.create({
      lecture: lectureId,
      askedBy: req.user.id,
      content,
    });
    res.status(201).json(q);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
};

export const listQuestions = async (req, res) => {
  const { lectureId } = req.params;
  const qs = await Question.find({ lecture: lectureId })
    .populate("askedBy", "name")
    .sort("-timestamp");
  res.json(qs);
};

export const markImportant = async (req, res) => {
  const { questionId } = req.params;
  const q = await Question.findById(questionId);
  if (!q) return res.status(404).json({ message: "Not found" });
  q.isImportant = true;
  await q.save();
  res.json(q);
};

export const unmarkImportant = async (req, res) => {
  const { questionId } = req.params;
  const q = await Question.findById(questionId);
  if (!q) return res.status(404).json({ message: "Not found" });
  q.isImportant = false;
  await q.save();
  res.json(q);
};

export const updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { status } = req.body;
  const q = await Question.findById(questionId);
  if (!q) return res.status(404).json({ message: "Not found" });
  if (status) q.status = status;
  await q.save();
  res.json(q);
};
