import redisClient from "../config/redis.js";
import User from "../models/usersModel.js";

export default async function checkAuth(req, res, next) {
    const {sid} = req.signedCookies;
    if(!sid){
        return res.status(401).json({ error: "Unauthorized" });
    }
    const session = await redisClient.json.get(`session:${sid}`);
    
    if(!session){
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = await User.findById(session.userId);
    console.log(user);

    if(!user){
        return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
}