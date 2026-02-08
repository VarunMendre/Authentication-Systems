import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import { dashboard, profile } from "../controller/protectedController.js";

const router = express.Router();

router.get("/dashboard", checkAuth, dashboard);
router.get("/profile", checkAuth, profile);

export default router;