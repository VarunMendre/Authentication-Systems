import User from "../models/usersModel.js";

export const profile = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        return res.status(200).json({
            message: "User profile",
            user: user
        })
    } catch (err) {
        return res.status(400).json({
            error: "Something went wrong",
            details: err.message
        })
    }
}

export const dashboard = (req, res) => {
    try {

        return res.status(200).json({
            message: "User profile",
            user: req.user
        })
    } catch (err) {
        return res.status(400).json({
            error: "Something went wrong",
            details: err.message
        })
    }
}