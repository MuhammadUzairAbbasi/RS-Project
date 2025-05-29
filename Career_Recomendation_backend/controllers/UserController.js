import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";
import User from "../models/user.js"; // Adjust path to your User model

import axios from "axios";

// Promisify exec for async/await
const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get user profile by clerkUserId
export const getUserProfile = async (req, res) => {
  try {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save or update user profile
export const saveProfile = async (req, res) => {
  try {
    const { clerkUserId, name, email } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    const userData = {
      clerkUserId,
      name: name || "",
      email: email || "",
      interests: [],
      experience: [],
      skills: [],
    };

    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { $setOnInsert: userData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(user.wasAdded ? 201 : 200).json(user);
  } catch (err) {
    console.error("Error in saveProfile:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      clerkUserId,
      name,
      email,
      age,
      education,
      interests,
      experience,
      skills,
    } = req.body;

    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    // Prepare update data, excluding undefined fields
    const updateData = {
      name: name !== undefined ? name : undefined,
      email: email !== undefined ? email : undefined,
      age: age !== undefined ? Number(age) : undefined,
      education:
        education !== undefined
          ? typeof education === "string"
            ? education
            : education
          : undefined,
      interests:
        interests !== undefined
          ? Array.isArray(interests)
            ? interests
            : typeof interests === "string"
            ? interests
                .split(",")
                .map((i) => i.trim())
                .filter((i) => i)
            : []
          : undefined,
      skills:
        skills !== undefined
          ? Array.isArray(skills)
            ? skills
            : typeof skills === "string"
            ? skills
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : []
          : undefined,
      experience:
        experience !== undefined
          ? Array.isArray(experience)
            ? experience.map((exp) =>
                typeof exp === "object" ? exp : { jobTitle: exp, years: 1 }
              )
            : typeof experience === "string"
            ? [{ jobTitle: experience, years: 1 }]
            : []
          : undefined,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Update user in MongoDB
    let user = await User.findOneAndUpdate(
      { clerkUserId },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("User updated:", user);

    // Generate roadmap after profile update and get the updated user
    user = await generateRoadmap(clerkUserId);

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ error: error.message });
  }
};

const generateRoadmap = async (clerkUserId) => {
  try {
    if (!clerkUserId) {
      throw new Error("clerkUserId is required");
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      throw new Error("User not found");
    }

    // Prepare the input data based on user profile
    const inputData = {
      degree: user.education || "N/A",
      skills: user.skills || [],
      experience: user.experience?.length
        ? user.experience
            .map((exp) => `${exp.jobTitle} (${exp.years} years)`)
            .join(", ")
        : "None", // Convert experience array to string
      interests: user.interests || [],
      career_roles: [], // Default to empty list; add logic if user has career preferences
    };

    // Call the FastAPI endpoint to generate the roadmap
    const response = await axios.post(
      "http://localhost:8000/generate_roadmaps",
      inputData
    );

    // Update the user with the generated roadmap
    const updatedUser = await User.findOneAndUpdate(
      { clerkUserId },
      {
        $set: {
          roadmaps: response.data.careerRoadmaps || [], // Updated to match FastAPI response
          recommendationStatus: "completed",
        },
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error in generateRoadmap:", error);
    throw new Error(error.message || "Failed to generate roadmap");
  }
};

// export const updateProfile = async (req, res) => {
//   try {
//     const {
//       clerkUserId,
//       name,
//       email,
//       age,
//       education,
//       interests,
//       experience,
//       skills,
//     } = req.body;

//     if (!clerkUserId) {
//       return res.status(400).json({ error: "clerkUserId is required" });
//     }

//     // Prepare update data, excluding undefined fields
//     const updateData = {
//       name: name !== undefined ? name : undefined,
//       email: email !== undefined ? email : undefined,
//       age: age !== undefined ? Number(age) : undefined,
//       education:
//         education !== undefined
//           ? typeof education === "string"
//             ? education
//             : education
//           : undefined,
//       interests:
//         interests !== undefined
//           ? Array.isArray(interests)
//             ? interests
//             : typeof interests === "string"
//             ? interests
//                 .split(",")
//                 .map((i) => i.trim())
//                 .filter((i) => i)
//             : []
//           : undefined,
//       skills:
//         skills !== undefined
//           ? Array.isArray(skills)
//             ? skills
//             : typeof skills === "string"
//             ? skills
//                 .split(",")
//                 .map((s) => s.trim())
//                 .filter((s) => s)
//             : []
//           : undefined,
//       experience:
//         experience !== undefined
//           ? Array.isArray(experience)
//             ? experience.map((exp) =>
//                 typeof exp === "object" ? exp : { jobTitle: exp, years: 1 }
//               )
//             : typeof experience === "string"
//             ? [{ jobTitle: experience, years: 1 }]
//             : []
//           : undefined,
//     };

//     // Remove undefined fields
//     Object.keys(updateData).forEach(
//       (key) => updateData[key] === undefined && delete updateData[key]
//     );

//     // Update user in MongoDB
//     const user = await User.findOneAndUpdate(
//       { clerkUserId },
//       { $set: updateData },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     console.log("User updated:", user);

//     generateRoadmap(clerkUserId);

//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error in updateProfile:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// const generateRoadmap = async (clerkUserId, req, res) => {
//   try {
//     // const { clerkUserId } = req.query;

//     if (!clerkUserId) {
//       return res.status(400).json({ error: "clerkUserId is required" });
//     }

//     const user = await User.findOne({ clerkUserId });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Prepare the input data based on user profile
//     const inputData = {
//       degree: user.education || "N/A", // Assuming education is stored as a string
//       skills: user.skills || [], // Array of skills
//       interests: user.interests || [], // Array of interests
//     };

//     // Call the FastAPI endpoint to generate the roadmap
//     const response = await axios.post(
//       "http://localhost:8000/generate_roadmaps",
//       inputData
//     );

//     // Update the user with the generated roadmap
//     const updatedUser = await User.findOneAndUpdate(
//       { clerkUserId },
//       {
//         $set: {
//           roadmaps: response.data.roadmaps || [],
//           recommendationStatus: "completed",
//         },
//       },
//       { new: true }
//     );

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error("Error in generateRoadmap:", error);
//     res
//       .status(500)
//       .json({ error: error.message || "Failed to generate roadmap" });
//   }
// };

export const getUserRecommendations = async (req, res) => {
  try {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(user.recommendations, user.roadmaps);

    res.status(200).json({
      recommendations: user.recommendations || [],
      roadmaps: user.roadmaps || [],
    });
  } catch (err) {
    console.error("Error in getUserRecommendations:", err);
    res.status(500).json({ error: err.message });
  }
};

// Check if user exists by clerkUserId
export const checkUser = async (req, res) => {
  try {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ exists: false, message: "User not found" });
    }

    res.status(200).json({ exists: true, user });
  } catch (err) {
    console.log("Error in checkUser controller:", err);
    res.status(500).json({ error: err.message });
  }
};
