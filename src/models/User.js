import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["student","instructor","ta","admin"], default: "student" },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.setPassword = async function(password){
  this.passwordHash = await bcrypt.hash(password, 10);
};

UserSchema.methods.validatePassword = async function(password){
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", UserSchema);
