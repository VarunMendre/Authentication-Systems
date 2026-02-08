import User from "../models/usersModel.js";
import { generateToken, verifyToken } from "../utils/jwtHelper.js";

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

    return res.status(201).json({
      message: "User registered successfully",
      user: user
    })

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

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    if (!user.password || user.password.length === 0) {
      return res.status(401).json({
        error: "No password set. Please login with Google/GitHub or set a password in settings.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials"  
      });
    }

    const accessToken = generateToken(
      { userId: user._id, email: user.email, type: "AccessToken" },
      "15m"
    );
    const refreshToken = generateToken(
      { userId: user._id, email: user.email, type: "RefreshToken" },
      "7d"
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    return res.status(200).json({
      message: "User logged in successfully",
      user: userResponse, 
      accessToken: accessToken  
    });

  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: "No refresh token provided. Please login again."
      });
    }

    const decodedToken = verifyToken(refreshToken);

    if (!decodedToken) {
      return res.status(401).json({
        error: "Invalid or expired refresh token. Please login again."
      });
    }

    if (decodedToken.type !== "RefreshToken") {
      return res.status(401).json({
        error: "Invalid token type. Please login again."
      });
    }

    // generating new tokens (rotation)
    const accessToken = generateToken(
      {
        userId: decodedToken.userId,
        email: decodedToken.email,
        type: "AccessToken"
      },
      "15m"
    );

    const newRefreshToken = generateToken(
      {
        userId: decodedToken.userId,
        email: decodedToken.email,
        type: "RefreshToken"
      },
      "7d"
    );

    // setting new refresh token cookie (overwrites old one)
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Tokens refreshed successfully",
      accessToken: accessToken
    });

  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({
      error: "Something went wrong",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "User Logged out Successfully" });

  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: "Something went wrong", details: err.message });
  }
};

