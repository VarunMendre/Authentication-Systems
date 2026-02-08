import express from "express";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import auth from "./routes/authRoutes.js"
import protectedRoutes from "./routes/protectedRoutes.js"
import checkAuth from "./middleware/authMiddleware.js";

const app = express();
const PORT = 5000;

await connectDB();

app.disable("x-powered-by");
app.use(express.json())

const mySecretKey = "Varun123456"
app.use(cookieParser("mySecretKey"));

app.use("/users", auth);
app.use("/api", protectedRoutes)

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on PORT: ${PORT}`);
});