import express from "express";
import {  login, logout, register } from "../controller/authController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", checkAuth, logout);

export default router;