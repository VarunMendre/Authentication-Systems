export const profile = (req, res) => {
    res.json({ message: "Profile route", user: req.user });
}

export const dashboard = (req, res) => {
    res.json({ message: "Dashboard route" });
}