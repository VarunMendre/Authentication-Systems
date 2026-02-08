import User from "../models/usersModel.js";

export default async function checkAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if(!authHeader.startsWith('Bearer ')){
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1];
    console.log(token);

    const user = await User.findOne({
        'tokens.token': token,
    });

    if (!user) {
        return res.status(401).json({ error: "User not found" });
    }

    const tokenObj = user.tokens.find((t) => t.token === token);

    if (tokenObj.expiresAt && tokenObj.expiresAt < new Date()) {
        return res.status(401).json({ error: "Token expired" });
    }

    req.user = user;
    req.token = token;
    next();
}