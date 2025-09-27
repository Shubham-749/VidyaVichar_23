import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  startTime: Date,
  endTime: Date,
  status: { type: String, enum: ["scheduled","ongoing","completed","cancelled"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Lecture", LectureSchema);
