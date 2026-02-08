import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
    // jwt.sign(payload, secret, options)
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
    return token;
}

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        console.log(err);
        return null;
    }
}

