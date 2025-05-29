import React, { useEffect, useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../../store/UserStore";
import {
  Lock,
  XCircle,
  AlertTriangle,
  User,
  FlaskConical,
  Briefcase,
  Lightbulb,
  Pencil,
  LogOut,
  Map, // Added for Career Page button icon
} from "lucide-react";

const Dashboard = () => {
  const { user } = useUser();
  const { state } = useLocation();
  const justSignedUp = state?.justSignedUp || false;
  const {
    profile,
    loading,
    error,
    isUserinDB,
    checkUser,
    fetchProfile,
    saveProfile,
    clearError,
  } = useUserStore();
  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  useEffect(() => {
    if (!user || hasCheckedUser) return;

    const handleUserFlow = async () => {
      try {
        // Check if user exists in the database
        const userExists = await checkUser(user.id);

        if (userExists && !justSignedUp) {
          // User exists and not a new signup, fetch their profile
          await fetchProfile(user.id);
        } else {
          // User doesn't exist or just signed up, create a new profile
          const userData = {
            fullName: user.fullName || user.firstName || "",
            primaryEmailAddress: {
              emailAddress: user.primaryEmailAddress?.emailAddress || "",
            },
          };
          await saveProfile(user.id, userData);
          // Fetch profile to ensure UI consistency
          await fetchProfile(user.id);
        }
        setHasCheckedUser(true);
      } catch (err) {
        console.error("Error in user flow:", err);
        setHasCheckedUser(true); // Prevent retry loops
      }
    };

    handleUserFlow();
  }, [
    user,
    justSignedUp,
    hasCheckedUser,
    checkUser,
    fetchProfile,
    saveProfile,
  ]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-xl font-semibold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-gray-600">
              Please log in to view your dashboard.
            </p>
          </div>
          <Link
            to="/login"
            className="mt-6 block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition duration-200 transform hover:translate-y-[-1px] hover:shadow-lg"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 relative">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Loading data...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {error || "Failed to load profile. Please try again."}
          </p>
          <button
            onClick={() => {
              clearError();
              fetchProfile(user.id);
            }}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfileContent = () => {
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();

    if (!profile || Object.keys(profile).length <= 3) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Update your profile to get started.
              </p>
              <div className="mt-4">
                <Link
                  to="/edit-profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:from-indigo-700 transition ease-in-out duration-150"
                >
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Personal Information
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="mt-1 text-base text-gray-900">
                    {profile.name || "Not set"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Age</div>
                  <div className="mt-1 text-base text-gray-900">
                    {profile.age || "Not set"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    Education
                  </div>
                  <div className="mt-1 text-base text-gray-900">
                    {profile.education || "Not set"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FlaskConical className="w-5 h-5 mr-2 text-indigo-600" />
                Interests
              </h3>
              <div className="mt-4">
                {profile.interests?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No interests added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                Work Experience
              </h3>
              <div className="mt-4">
                {profile.experience?.length > 0 ? (
                  <div className="space-y-3">
                    {profile.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {exp.jobTitle}
                          </div>
                          <div className="text-sm text-gray-500">{`${
                            exp.years
                          } ${
                            exp.years === 1 ? "year" : "years"
                          } of experience`}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No experience added yet
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-indigo-600" />
                Skills
              </h3>
              <div className="mt-4">
                {profile.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {user.firstName?.[0] || user.username?.[0] || "U"}
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {user.firstName || user.username}!
                </h1>
                <p className="text-sm text-gray-500">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/careerPage"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:border-cyan-700 focus:shadow-outline-cyan active:from-cyan-700 transition ease-in-out duration-150"
              >
                <Map className="mr-2 h-4 w-4" />
                View Career Roadmap
              </Link>
              <Link
                to="/edit-profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:from-indigo-700 transition ease-in-out duration-150"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
              <SignOutButton redirectUrl="/login">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:from-red-700 transition ease-in-out duration-150">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Profile Information
        </h2>
        {renderProfileContent()}
      </div>
    </div>
  );
};

export default Dashboard;
