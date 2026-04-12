import express from "express";
import {
  getDailyCheckinRewards,
  claimDailyCheckin,
} from "../controllers/dailyCheckinController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getDailyCheckinRewards);
router.post("/claim", authMiddleware, claimDailyCheckin);

export default router;
