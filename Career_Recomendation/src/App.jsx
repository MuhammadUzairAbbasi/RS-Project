import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import Login from "./pages/auth/Login";
import SignUP from "./pages/auth/SignUp";
import Dashboard from "./pages/Dashboard/Dashboard";
import EditProfile from "./pages/EditProfile/EditProfile";
import CareerPage from "./pages/RecommendationPage/CareerPage";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <header className="flex items-center justify-end h-12">
        <UserButton />
      </header>
      <Routes>
        <Route
          path="/"
          element={
            isSignedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/signIn" />
            )
          }
        />
        <Route path="/signIn" element={<Login />} />
        <Route path="/signUp" element={<SignUP />} />
        <Route
          path="/dashboard"
          element={isSignedIn ? <Dashboard /> : <Navigate to="/signIn" />}
        />
        <Route
          path="/edit-profile"
          element={isSignedIn ? <EditProfile /> : <Navigate to={"/signIn"} />}
        />
        <Route
          path="/careerPage"
          element={isSignedIn ? <CareerPage /> : <Navigate to={"/signIn"} />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
