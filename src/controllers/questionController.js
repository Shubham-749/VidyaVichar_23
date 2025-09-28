import Question from "../models/Question.js";
import Lecture from "../models/Lecture.js";
import Course from "../models/Course.js";

export const postQuestion = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { content } = req.body;
    
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: "Question content is required" });
    }
    
    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }
    
    const start = new Date(lecture.startTime);
    const end = new Date(lecture.endTime);
    const current = new Date();
    
    
    // Check if lecture is ongoing
    if (start > current || end < current) {
      return res.status(400).json({ 
        message: "Lecture not ongoing",
        details: {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          currentTime: current.toISOString()
        }
      });
    }
    
    const course = await Course.findById(lecture.course);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    
    // Check if user is enrolled in the course
    if (!course.students.includes(req.user.id)) {
      return res.status(403).json({ 
        message: "Not enrolled in this course",
        details: {
          userId: req.user.id,
          courseId: course._id,
          enrolledStudents: course.students
        }
      });
    }
    
    const q = await Question.create({
      lecture: lectureId,
      askedBy: req.user.id,
      content: content.trim(),
    });
    
    // Populate the user data before sending response
    await q.populate('askedBy', 'name');
    
    res.status(201).json(q);
  } catch (e) {
    res.status(500).json({ 
      message: "server error",
      error: e.message 
    });
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
