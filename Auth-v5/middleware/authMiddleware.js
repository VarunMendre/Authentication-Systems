import { verifyToken } from "../utils/jwtHelper.js";

export default function checkAuth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    if (!token.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Invalid token format"
        });
    }

    const accessToken = token.split("Bearer ")[1];
    const decodedToken = verifyToken(accessToken);

    if (!decodedToken) {
        return res.status(401).json({
            error: "Invalid token"
        });
    }

    req.user = decodedToken;
    next();
}