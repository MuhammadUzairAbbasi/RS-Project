import React, { createContext, useState, useContext, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { axiosInstance } from "../lib/axios";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/user/getUserProfile", {
        params: { clerkUserId: user.id },
      });
      setProfile({
        ...response.data,
        name: user.fullName || user.firstName || response.data.name || "",
      });
      setLoading(false);
    } catch (err) {
      setError("No Profile Information Added.");
      setLoading(false);
      if (err.response?.status === 404) {
        // Optional: auto-create new user profile if not found
        await updateProfile({});
      }
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) {
      alert("You must be logged in to save your profile.");
      return false;
    }

    setSubmitting(true);
    try {
      const dataToSave = {
        clerkUserId: user.id,
        name: user.fullName || user.firstName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        ...profileData,
      };
      const userResponse = await axiosInstance.post(
        "/user/saveUserProfile",
        dataToSave
      );

      // Fetch new recommendations
      const recResponse = await axiosInstance.post(
        "/user/getrecommend",
        dataToSave
      );

      setProfile({
        ...userResponse.data,
        name: user.fullName || user.firstName || "",
        recommendedCareers: recResponse.data.recommendedCareers || [],
      });
      setSubmitting(false);
      return true;
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to update profile.");
      setSubmitting(false);
      return false;
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchProfile();
    }
  }, [isLoaded, user]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        submitting,
        fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
