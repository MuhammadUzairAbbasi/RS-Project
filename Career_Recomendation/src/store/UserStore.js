import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useUserStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,
  submitting: false,
  isUserinDB: false,
  roadmap: [],
  recomendations: [],

  checkUser: async (clerkUserId) => {
    if (!clerkUserId) {
      set({ error: "User ID is required to check user existence." });
      return false;
    }

    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/user/checkUser`, {
        params: { clerkUserId },
      });
      set({ isUserinDB: response.data.exists });
      return response.data.exists;
    } catch (err) {
      set({
        error: err?.response?.data?.error,
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async (clerkUserId) => {
    if (!clerkUserId) {
      set({ error: "User ID is required to fetch profile." });
      return false;
    }

    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/user/getUserProfile`, {
        params: { clerkUserId },
      });
      set({ profile: response.data, loading: false, isUserinDB: true });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch profile.",
        loading: false,
      });
      return false;
    }
  },

  saveProfile: async (clerkUserId, userData) => {
    if (!clerkUserId) {
      set({ error: "You must be logged in to save your profile." });
      return false;
    }

    if (useUserStore.getState().submitting) {
      console.warn("Profile submission already in progress.");
      return false;
    }

    set({ submitting: true });
    try {
      const dataToSave = {
        clerkUserId,
        name: userData.fullName || userData.firstName || "",
        email: userData.primaryEmailAddress?.emailAddress || "",
      };
      const response = await axiosInstance.post(
        "/user/saveProfile",
        dataToSave
      );
      set({
        profile: response.data,
        submitting: false,
        isUserinDB: true,
      });
      return true;
    } catch (err) {
      console.error("Error in saveProfile:", err);
      set({
        error: err.response?.data?.error || "Failed to save profile.",
        submitting: false,
      });
      return false;
    }
  },

  updateProfile: async (clerkUserId, profileData, userData) => {
    if (!clerkUserId) {
      set({ error: "You must be logged in to update your profile." });
      return false;
    }

    if (useUserStore.getState().submitting) {
      console.warn("Profile submission already in progress.");
      return false;
    }

    set({ submitting: true });
    try {
      const dataToSave = {
        clerkUserId,
        name: userData.fullName || userData.firstName || "",
        email: userData.primaryEmailAddress?.emailAddress || "",
        ...profileData,
      };
      const response = await axiosInstance.put(
        "/user/updateProfile",
        dataToSave
      );
      set({
        profile: response.data,
        submitting: false,
        isUserinDB: true,
      });
      return true;
    } catch (err) {
      console.error("Error in updateProfile:", err);
      set({
        error: err.response?.data?.error || "Failed to update profile.",
        submitting: false,
      });
      return false;
    }
  },
  fetchRecommendRoadmap: async (clerkUserId) => {
    // Validate clerkUserId
    if (!clerkUserId || typeof clerkUserId !== "string") {
      set({
        error: "You must be logged in to fetch the recommended roadmap.",
        loading: false,
      });
      return false;
    }

    // Set loading state
    set({ loading: true, error: null });

    try {
      // Make API call to fetch recommendations and roadmaps
      const response = await axiosInstance.get("/user/getRecommendations", {
        params: { clerkUserId },
      });

      // Validate response structure
      const { recommendations, roadmaps } = response.data;
      if (!Array.isArray(recommendations) || !Array.isArray(roadmaps)) {
        throw new Error("Invalid response structure from server");
      }

      // Update state with fetched data
      set({
        roadmap: { recommendations, roadmaps }, // Store both in roadmap object
        loading: false,
        error: null,
      });

      return true;
    } catch (err) {
      // Handle errors
      console.error("Error in fetchRecommendRoadmap:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch recommended roadmap.";
      set({
        error: errorMessage,
        loading: false,
        roadmap: null, // Clear roadmap on error
      });
      return false;
    }
  },
}));
