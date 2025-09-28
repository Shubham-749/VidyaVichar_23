import { Server } from "socket.io";
import { verifyJwt } from "./utils/auth.js";
import Lecture from "./models/Lecture.js";
import Question from "./models/Question.js";
import Course from "./models/Course.js";

let ioInstance = null;

export function initSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    const payload = verifyJwt(token);

    if (!payload) return next(new Error("Auth error"));
    socket.user = payload;
    next();
  });

  io.on("connection", (socket) => {
    socket.on("joinLecture", async (data) => {
      try {
        data = JSON.parse(data);
        const lectureId = data.lectureId;
        const lecture = await Lecture.findById(lectureId);
        const start = new Date(lecture.startTime);
        const end = new Date(lecture.endTime);
        const current = new Date();
        if (!lecture || start > current || end < current)
          return socket.emit("error", "Lecture not ongoing");
        const course = await Course.findById(lecture.course);
        if (!course) return socket.emit("error", "Course not found");
        if (
          !course.students.includes(socket.user.id) &&
          course.instructorId.toString() !== socket.user.id
        )
          return socket.emit("error", "Not enrolled in course");
        socket.join(`lecture:${lectureId}`);
        const questions = await Question.find({ lecture: lectureId });
        socket.emit("lectureData", { lecture, questions });
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("leaveLecture", async (data) => {
      data = JSON.parse(data);
      const lectureId = data.lectureId;
      try {
        socket.leave(`lecture:${lectureId}`);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("askQuestion", async (data) => {
      try {
        data = JSON.parse(data);
        const lectureId = data.lectureId;
        const content = data.content;
        const lecture = await Lecture.findById(lectureId);
        const start = new Date(lecture.startTime);
        const end = new Date(lecture.endTime);
        const current = new Date();
        if (!lecture || start > current || end < current)
          return socket.emit("error", "Lecture not ongoing");
        const course = await Course.findById(lecture.course);
        if (!course) return socket.emit("error", "Course not found");
        if (!course.students.includes(socket.user.id))
          return socket.emit("error", "Not enrolled");
        const q = await Question.create({
          lecture: lectureId,
          askedBy: socket.user.id,
          content,
        });
        io.to(`lecture:${lectureId}`).emit("newQuestion", q);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("toggleImportant", async (data) => {
      try {
        data = JSON.parse(data);
        const questionId = data.questionId;
        const isImportant = data.isImportant;
        const q = await Question.findById(questionId);
        if (!q) return socket.emit("error", "Question not found");
        const lecture = await Lecture.findById(q.lecture);
        if (!lecture) return socket.emit("error", "Lecture not found");
        const course = await Course.findById(lecture.course);
        if (!course) return socket.emit("error", "Course not found");
        if (course.instructorId.toString() !== socket.user.id)
          return socket.emit("error", "Not instructor");
        q.isImportant = isImportant;
        await q.save();
        io.to(`lecture:${lecture._id}`).emit("questionUpdated", q);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("updateQuestionStatus", async (data) => {
      try {
        data = JSON.parse(data);
        const questionId = data.questionId;
        const status = data.status;
        const q = await Question.findById(questionId);
        if (!q) return socket.emit("error", "Question not found");
        const lecture = await Lecture.findById(q.lecture);
        if (!lecture) return socket.emit("error", "Lecture not found");
        const course = await Course.findById(lecture.course);
        if (!course) return socket.emit("error", "Course not found");
        if (course.instructorId.toString() !== socket.user.id)
          return socket.emit("error", "Not instructor");
        q.status = status;
        await q.save();
        io.to(`lecture:${lecture._id}`).emit("questionUpdated", q);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("disconnecting", async () => {
      for (const room of socket.rooms) {
        if (room.startsWith("lecture:")) {
          socket.leave(room);
        }
      }
    });
  });

  ioInstance = io;
  return io;
}

export function getIo() {
  if (!ioInstance) throw new Error("Socket not initialized");
  return ioInstance;
}
