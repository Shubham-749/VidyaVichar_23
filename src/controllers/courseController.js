import Course from "../models/Course.js";
import User from "../models/User.js";

export const createCourse = async (req, res) => {
  const { title, instructorId } = req.body;

  if (!instructorId) {
    return res.status(400).json({ message: "instructorId is required" });
  }

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "title is required" });
  }

  const course = await Course.create({ title, instructorId });
  res.status(201).json(course);
};

export const listCourses = async (req, res) => {
  let courses = null;
  if (req.user.role === "admin") {
    courses = await Course.find();
  } else {
    courses = await Course.find({
      $or: [{ instructorId: req.user.id }, { students: req.user.id }],
    });
  }
  res.json(courses);
};

export const getCourseById = async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
};

export const enrollUser = async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Check if user is already enrolled
  if (course.students.includes(userId)) {
    return res
      .status(400)
      .json({ message: "User is already enrolled in this course" });
  }

  // Add user to course students array
  course.students.push(userId);
  await course.save();

  res.json({
    message: "User enrolled successfully",
    courseId: course._id,
    userId: userId,
    totalStudents: course.students.length,
  });
};
