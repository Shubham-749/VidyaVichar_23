import Lecture from "../models/Lecture.js";
import Course from "../models/Course.js";

export const createLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, startTime, endTime } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructorId.toString() !== req.user.id) return res.status(403).json({ message: "Not instructor for this course" });
    const lecture = await Lecture.create({ course: courseId, title, startTime, endTime });
    res.status(201).json(lecture);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
};



export const joinLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture || lecture.startTime > Date.now() || lecture.endTime < Date.now()) return res.status(400).json({ message: "Lecture not ongoing" });
    const course = await Course.findById(lecture.course);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.students.includes(req.user.id)) return res.status(403).json({ message: "Not enrolled in course" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
};
