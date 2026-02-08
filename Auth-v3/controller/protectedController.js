import User from "../models/usersModel.js";

export const profile = async(req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Profile route", user: user });


    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: "Something went wrong", details: err.message });
    }
}

export const dashboard = (req, res) => {
    res.json({
        message: `Welcome to dashboard User: ${req.user.email}`
   })
}