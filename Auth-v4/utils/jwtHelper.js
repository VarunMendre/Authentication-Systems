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
// Math.floor(Date.now() / 1000)
// console.log(verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiVmFydW4iLCJpZCI6IjEyMyIsImlhdCI6MTc2NTExNTUwNCwiZXhwIjoxNzY1MTE1ODA0fQ.dg1kt29Z1TGribraJBUz8lKf9YWBrUPIKNyStzAde9I"));