import { verifyToken } from "../utils/jwtHelper.js";

export default function checkAuth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if(!token.startsWith('Bearer ')){
        return res.status(401).json({ error: "Unauthorized" });
    }

    const actualTokken = token.split(" ")[1]
    const decode = verifyToken(actualTokken);

    if (!decode) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    req.user = decode;
    next();

}