import User from "../models/usersModel.js";

export const profile = async(req, res) => {
    try {
        return res.status(200).json({
            message: "User profile retrieved successfully",
            user: req.user
        })
    } catch (err) {
        return res.status(500).json({
            error: "Something went wrong",
            details: process.env.NODE_ENV === "development" ? err.message : undefined
        })
    }
}

export const dashboard = (req, res) => {
    try {
        return res.status(200).json({ message: "Welcome to Dashboard", user: req.user });
    } catch (err) {
        return res.status(500).json({
            error: "Something went wrong",
            details: process.env.NODE_ENV === "development" ? err.message : undefined
        })
    }
}