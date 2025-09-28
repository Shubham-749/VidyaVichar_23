import { Server } from "socket.io";
import { verifyJwt } from "./utils/auth.js";
import Lecture from "./models/Lecture.js";
import Question from "./models/Question.js";
import Course from "./models/Course.js";

let ioInstance = null;

export function initSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query.token;

    const payload = verifyJwt(token);

    if (!payload) return next(new Error("Auth error"));
    socket.user = payload;
    next();
  });

  io.on("connection", (socket) => {
    socket.on("joinLecture", async (data) => {
      try {
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
        const questions = await Question.find({ lecture: lectureId })
          .populate('askedBy', 'name');
        
        // Get participant count
        const participants = io.sockets.adapter.rooms.get(`lecture:${lectureId}`)?.size || 0;
        
        socket.emit("lectureData", { lecture, questions, participants });
        io.to(`lecture:${lectureId}`).emit("participantCount", participants);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("leaveLecture", async (data) => {
      try {
        const lectureId = data.lectureId;
        socket.leave(`lecture:${lectureId}`);
        
        // Update participant count
        const participants = io.sockets.adapter.rooms.get(`lecture:${lectureId}`)?.size || 0;
        io.to(`lecture:${lectureId}`).emit("participantCount", participants);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("askQuestion", async (data) => {
      try {
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
        
        // Populate the user data before emitting
        await q.populate('askedBy', 'name');
        
        io.to(`lecture:${lectureId}`).emit("newQuestion", q);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("toggleImportant", async (data) => {
      try {
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
        
        // Populate the user data before emitting
        await q.populate('askedBy', 'name');
        
        io.to(`lecture:${lecture._id}`).emit("questionUpdated", q);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("updateQuestionStatus", async (data) => {
      try {
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
        
        // Populate the user data before emitting
        await q.populate('askedBy', 'name');
        
        io.to(`lecture:${lecture._id}`).emit("questionUpdated", q);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("updateQuestion", async (data) => {
      try {
        const { questionId, updates } = data;
        const q = await Question.findById(questionId);
        if (!q) return socket.emit("error", "Question not found");
        const lecture = await Lecture.findById(q.lecture);
        if (!lecture) return socket.emit("error", "Lecture not found");
        const course = await Course.findById(lecture.course);
        if (!course) return socket.emit("error", "Course not found");
        if (course.instructorId.toString() !== socket.user.id)
          return socket.emit("error", "Not instructor");
        
        // Apply updates
        if (updates.status) q.status = updates.status;
        if (updates.isImportant !== undefined) q.isImportant = updates.isImportant;
        
        await q.save();
        
        // Populate the user data before emitting
        await q.populate('askedBy', 'name');
        
        io.to(`lecture:${lecture._id}`).emit("questionUpdated", q);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("deleteQuestion", async (data) => {
      try {
        const { questionId } = data;
        const q = await Question.findById(questionId);
        if (!q) return socket.emit("error", "Question not found");
        const lecture = await Lecture.findById(q.lecture);
        if (!lecture) return socket.emit("error", "Lecture not found");
        const course = await Course.findById(lecture.course);
        if (!course) return socket.emit("error", "Course not found");
        if (course.instructorId.toString() !== socket.user.id)
          return socket.emit("error", "Not instructor");
        
        await Question.findByIdAndDelete(questionId);
        io.to(`lecture:${lecture._id}`).emit("questionDeleted", { questionId });
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("clearQuestions", async (data) => {
      try {
        const { lectureId } = data;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) return socket.emit("error", "Lecture not found");
        const course = await Course.findById(lecture.course);
        if (!course) return socket.emit("error", "Course not found");
        if (course.instructorId.toString() !== socket.user.id)
          return socket.emit("error", "Not instructor");
        
        await Question.deleteMany({ lecture: lectureId });
        io.to(`lecture:${lectureId}`).emit("questionsCleared", { lectureId });
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
