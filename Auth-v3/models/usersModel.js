import mongoose, { model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "name field should a string with at least three characters"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
      "please enter a valid email",
    ],
  },
  password: {
    type: String,
    minLength: 4,
  }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (userPassword) {
    return bcrypt.compare(userPassword, this.password);
}

const User = model("users", userSchema);
export default User;