import express from "express";
import {
  getUserProfile,
  saveProfile,
  updateProfile,
  checkUser,
  getUserRecommendations,
} from "../controllers/UserController.js";

const router = express.Router();

// Routes for user profile
router.get("/getUserProfile", getUserProfile);
router.post("/saveProfile", saveProfile);
router.put("/updateProfile", updateProfile);
router.get("/checkUser", checkUser);
router.get("/getRecommendations", getUserRecommendations); // Assuming this is for recommendations

export default router;
