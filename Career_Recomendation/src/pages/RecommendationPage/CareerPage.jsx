import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/UserStore"; // Adjust path to your Zustand store
import { useAuth } from "@clerk/clerk-react"; // If using Clerk for auth

const CareerPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Zustand state and actions
  const { fetchRecommendRoadmap, roadmap, loading, error } = useUserStore();

  // Get clerkUserId (example using Clerk)
  const { userId } = useAuth(); // Assumes Clerk is set up; userId is clerkUserId

  // Fetch roadmap on mount
  useEffect(() => {
    if (userId) {
      fetchRecommendRoadmap(userId);
    }
    if (userId && roadmap) {
      console.log("Roadmap data fetched successfully:", roadmap);
    }
  }, [userId, fetchRecommendRoadmap]);

  // Helper to calculate match percentage
  const getMatchPercentage = (score) => Math.round(score * 100);

  // Filter unique roadmaps by role
  const getUniqueRoadmaps = (roadmaps) => {
    const seen = new Set();
    return roadmaps.filter((roadmap) => {
      if (seen.has(roadmap.role)) {
        return false;
      }
      seen.add(roadmap.role);
      return true;
    });
  };

  // Handle loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-700">
            Loading your career roadmap...
          </p>
        </div>
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">
            {error || "Please log in to view your career roadmap."}
          </p>
        </div>
      </div>
    );
  }

  // If no roadmap data, show a placeholder
  if (!roadmap || !roadmap.recommendations || !roadmap.roadmaps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-700">
            No career recommendations available. Please update your profile to
            get started.
          </p>
        </div>
      </div>
    );
  }

  const uniqueRoadmaps = getUniqueRoadmaps(roadmap.roadmaps);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Your Career Journey
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover personalized career recommendations and detailed roadmaps
            to achieve your professional goals
          </p>
        </div>

        {/* Job Recommendations */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-3xl font-bold text-slate-900">
              Recommended Positions
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roadmap.recommendations.map((job, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex-1">
                      {job.Title}
                    </h3>
                    <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-medium ml-2 whitespace-nowrap">
                      {getMatchPercentage(job.SimilarityScore)}% match
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300"
                      style={{
                        width: `${getMatchPercentage(job.SimilarityScore)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 leading-relaxed line-clamp-4">
                    {job.JobDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Career Roadmaps */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📈</span>
            <h2 className="text-3xl font-bold text-slate-900">
              Career Roadmaps
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 bg-slate-50 border-b border-slate-200">
              {uniqueRoadmaps.map((roadmap, index) => (
                <button
                  key={roadmap.role}
                  className={`p-4 text-sm md:text-base font-medium transition-all duration-200 border-b-3 ${
                    activeTab === index
                      ? "bg-white text-blue-600 border-blue-600"
                      : "text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  {roadmap.role}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {uniqueRoadmaps.map((roadmap, index) => (
                <div
                  key={roadmap.role}
                  className={`space-y-6 ${
                    activeTab === index ? "block" : "hidden"
                  }`}
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Career Progression */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 p-4 border-b border-slate-200">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                          <span className="text-xl">📈</span>
                          Career Progression
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">
                            Entry Level
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {roadmap.jobRoles.entryLevel.map((role, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs text-slate-700"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="h-px bg-slate-300"></div>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">
                            Mid Level
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {roadmap.jobRoles.midLevel.map((role, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs text-slate-700"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="h-px bg-slate-300"></div>
                        <div>
                          <h4 className="font-semibold text-purple-700 mb-2">
                            Senior Level
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {roadmap.jobRoles.seniorLevel.map((role, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs text-slate-700"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Required */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 p-4 border-b border-slate-200">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                          <span className="text-xl">🧠</span>
                          Skills Required
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                            <span className="text-base">💻</span>
                            Technical Skills
                          </h4>
                          <ul className="space-y-2">
                            {roadmap.skillsRequired.technical.map(
                              (skill, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm leading-relaxed"
                                >
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {skill}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div className="h-px bg-slate-300"></div>
                        <div>
                          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                            <span className="text-base">👥</span>
                            Soft Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {roadmap.skillsRequired.softSkills.map(
                              (skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 p-4 border-b border-slate-200">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                          <span className="text-xl">⏰</span>
                          Learning Timeline
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">
                            Short Term (0-6 months)
                          </h4>
                          <ul className="space-y-1">
                            {roadmap.timeline.shortTerm.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm leading-relaxed"
                              >
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">
                            Mid Term (6-18 months)
                          </h4>
                          <ul className="space-y-1">
                            {roadmap.timeline.midTerm.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm leading-relaxed"
                              >
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-700 mb-2">
                            Long Term (18+ months)
                          </h4>
                          <ul className="space-y-1">
                            {roadmap.timeline.longTerm.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm leading-relaxed"
                              >
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Learning Resources */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 p-4 border-b border-slate-200">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                          <span className="text-xl">📚</span>
                          Learning Resources
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">
                            Online Courses
                          </h4>
                          <ul className="space-y-1">
                            {roadmap.resources.onlineCourses
                              .slice(0, 3)
                              .map((course, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm leading-relaxed"
                                >
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {course}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">
                            Certifications
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {roadmap.resources.certifications.map(
                              (cert, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-xs"
                                >
                                  {cert}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-700 mb-2">
                            Recommended Books
                          </h4>
                          <ul className="space-y-1">
                            {roadmap.resources.books.map((book, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm leading-relaxed"
                              >
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                {book}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bridge Skills */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-4 border-b border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Bridge Skills - Start Here
                      </h3>
                      <p className="text-sm text-slate-600">
                        These are the essential skills to focus on first for
                        transitioning into this role
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-3">
                        {roadmap.bridgeSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Project Ideas */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-4 border-b border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Project Ideas
                      </h3>
                      <p className="text-sm text-slate-600">
                        Build these projects to demonstrate your skills and
                        create a strong portfolio
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        {roadmap.resources.projectIdeas.map((project, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-slate-200 rounded-lg"
                          >
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {project}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CareerPage;
