import redisClient from "../config/redis.js";
import User from "../models/usersModel.js";

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

    return res
      .status(201)
      .json({ message: "User Registered Successfully", details: user });
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

    const sessionId = crypto.randomUUID();
   const redisKey = `session:${sessionId}`;

  await redisClient.json.set(redisKey, "$", {
    userId: user._id,
  });

  await redisClient.expire(redisKey, 60 * 60 * 24 * 7);

  res.cookie("sid", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
    
  res.json({ message: "logged in" });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: "Something went wrong", details: err.message });
  }
};

export const logout = async (req, res, next) => {
    const sessionId = req.signedCookies.sid;
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const redisKey = `session:${sessionId}`;
    await redisClient.del(redisKey);
    res.clearCookie("sid");
    res.json({ message: "logged out" });
};

export const dashboard = async (req, res, next) => {
    const user = req.user;
    console.log(user);
    res.json({ message: "dashboard", details: user });
};

