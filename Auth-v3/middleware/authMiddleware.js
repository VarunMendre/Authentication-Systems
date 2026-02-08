import { verifyToken } from "../utils/jwtHelper.js";

export default function checkAuth(req, res, next) {
    try {
        let token = null;

        // Option 1: Get token from HTTP-only cookie (more secure)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // Option 2: Get token from Authorization header (for API testing)
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove "Bearer " prefix
            }
        }

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - No token provided"
            });
        }

        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized - Invalid token"
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized - Token verification failed",
            error: err.message
        });
    }
}