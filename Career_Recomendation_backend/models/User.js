// models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  age: Number,
  education: String,
  interests: [String],
  skills: [String],
  experience: [{ jobTitle: String, years: Number }],
  recommendations: [
    {
      Title: String,
      SimilarityScore: Number,
      JobDescription: String,
    },
  ],
  roadmaps: [
    {
      role: String,
      jobRoles: {
        entryLevel: [String],
        midLevel: [String],
        seniorLevel: [String],
      },
      skillsRequired: {
        technical: [String],
        softSkills: [String],
      },
      resources: {
        onlineCourses: [String],
        certifications: [String],
        books: [String],
        projectIdeas: [String],
      },
      timeline: {
        shortTerm: [String],
        midTerm: [String],
        longTerm: [String],
      },
      bridgeSkills: [String],
    },
  ],
});

export default mongoose.model("User", userSchema);
