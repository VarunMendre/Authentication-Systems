import User from "../models/usersModel.js";
import crypto from "crypto";
import { generateToken } from "../utils/jwtHelper.js";

export const register = async function (req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  try {
    const user = await User.insertOne({
      name,
      email,
      password,
    });

    const token = generateToken({
      userId: user._id,
      email: user.email,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res
      .status(201)
      .json({ message: "User Registered Successfully", details: user, token: token });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: "Something went wrong", details: err.message });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Required fields are missing!" });
  }

  try {
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res
        .status(400)
        .json({ error: "User not found, either check credentials or register!" });
    }

    if (!user.password || user.password.length === 0) {
      return res.status(401).json({
        error:
          "No password set. Please login with Google/GitHub or set a password in settings.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(404).json({ error: "Wrong password" });
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "logged in" ,token: token});
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: "Something went wrong", details: err.message });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: "Something went wrong", details: err.message });
  }
};

