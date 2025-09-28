import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["open", "answered"], default: "open" },
  isImportant: { type: Boolean, default: false },
});

export default mongoose.model("Question", QuestionSchema);
