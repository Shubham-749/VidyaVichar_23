import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/vidya";
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log("Mongo connected"))
  .catch(err => console.error("Mongo connect err", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server listening ${PORT}`));
