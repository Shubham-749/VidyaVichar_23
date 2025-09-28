import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import lecturesRoutes from "./routes/lectures.js";
import questionsRoutes from "./routes/questions.js";
import { initSocket } from "./socket.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lectures", lecturesRoutes);
app.use("/api", questionsRoutes);

const server = http.createServer(app);

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/vidya";
mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("Mongo connect err", err));

const io = initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening ${PORT}`));
