import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap, Star, Flame, Trophy, Target, PlayCircle, Plus, BookOpen, Sparkles, BadgeCheck } from "lucide-react";
import { Course, Enrollment, UserProfile } from "../data/mockData";
import { CourseCard } from "./CourseCard";

interface HomeDashboardProps {
  courses: Course[];
  enrollments: Enrollment[];
  userProfile: UserProfile;
  onSelectCourse: (id: string) => void;
  onCreateCourse: () => void;
  onExploreCourses: () => void;
}

const FUN_QUOTES = [
  "Ready to crush your learning goals today?",
  "Time to level up your brain! 🧠✨",
  "Knowledge is power, but learning is a superpower! 🦸‍♂️",
  "Let's get this bread... of knowledge! 🍞📚",
  "Warning: Extreme learning ahead! 🚧🤓",
  "Your brain is hungry. Feed it! 🍔📖",
  "Fueling up for a knowledge marathon! 🏃‍♀️💨"
];

export function HomeDashboard({ courses, enrollments, userProfile, onSelectCourse, onCreateCourse, onExploreCourses }: HomeDashboardProps) {
  const isCoFounder = ["mgethmikadinujakumarathunga@gmail.com", "thewantab2012@gmail.com", "therevisionplan@gmail.com"].includes(userProfile.email || "");
  const [quote, setQuote] = useState(FUN_QUOTES[0]);

  useEffect(() => {
    setQuote(FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)]);
  }, []);

  // Find the most recently accessed enrolled course that still exists
  const validEnrollments = enrollments.filter(e => courses.some(c => c.id === e.courseId));
  const activeEnrollment = validEnrollments.length > 0 
    ? [...validEnrollments].sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())[0]
    : null;

  const recommendedCourses = courses.filter(c => 
    userProfile.interests?.some(i => 
      (c.category && i && c.category.toLowerCase().includes(i.toLowerCase())) || 
      (c.tags && i && c.tags.some(t => t && t.toLowerCase().includes(i.toLowerCase())))
    )
  );

  const mainCourse = (activeEnrollment ? courses.find(c => c.id === activeEnrollment.courseId) : null)
    || (recommendedCourses.length > 0 ? recommendedCourses[0] : courses[0]);

  const publishedCourses = courses.filter(c => c.status === 'published' || !c.status);
  
  let exploreCourses = [];
  if (publishedCourses.length > 10) {
    // Show recommended courses if there are many
    exploreCourses = recommendedCourses.filter(c => c.id !== mainCourse?.id).slice(0, 6);
    if (exploreCourses.length < 6) {
      // Fill the rest with random or latest courses
      const remaining = publishedCourses.filter(c => c.id !== mainCourse?.id && !exploreCourses.find(ec => ec.id === c.id)).slice(0, 6 - exploreCourses.length);
      exploreCourses = [...exploreCourses, ...remaining];
    }
  } else {
    // Show all published courses if there are few
    exploreCourses = publishedCourses.filter(c => c.id !== mainCourse?.id);
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 transition-all cursor-pointer group hover:border-zinc-600/50 border border-zinc-800/50 hover:shadow-sm"
        >
          <div className="w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center overflow-hidden relative group-hover:bg-zinc-700/50 transition-colors">
            <Flame className="w-5 h-5 text-zinc-100 relative z-10" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors">Daily Streak</p>
            <p className="text-xl font-semibold text-zinc-100">{userProfile.dailyStreak || 0} <span className="text-sm font-medium text-zinc-500">Days</span></p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 transition-all cursor-pointer group hover:border-zinc-600/50 border border-zinc-800/50 hover:shadow-sm"
        >
          <div className="w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center overflow-hidden relative group-hover:bg-zinc-700/50 transition-colors">
            <Trophy className="w-5 h-5 text-zinc-100 relative z-10" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors">Total XP</p>
            <p className="text-xl font-semibold text-zinc-100">{userProfile.xp || 0} <span className="text-sm font-medium text-zinc-500">XP</span></p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 transition-all cursor-pointer group relative overflow-hidden hover:border-zinc-600/50 border border-zinc-800/50 hover:shadow-sm"
        >
          <div className="w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center relative z-10 group-hover:bg-zinc-700/50 transition-colors">
            <Target className="w-5 h-5 text-zinc-100" />
          </div>
          <div className="relative z-10 flex-1">
            <p className="text-xs font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors">Current Level</p>
            <p className="text-xl font-semibold text-zinc-100">Level {userProfile.level || 1}</p>
            <div className="mt-2 h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((userProfile.xp || 0) % 1000) / 10}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-bg-inverted rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Greeting & Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 md:p-8 relative overflow-hidden group backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col items-start">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight mb-2 flex items-center gap-3">
            Welcome back, {userProfile.username}! 
            {isCoFounder && (
              <span className="flex items-center gap-1 text-xs bg-zinc-800/50 text-zinc-300 px-2.5 py-1 font-bold rounded-lg border border-zinc-700/50">
                <BadgeCheck className="w-3.5 h-3.5" />
                Co-founder
              </span>
            )}
          </h1>
          <p className="text-base text-zinc-400 font-medium">
            {quote}
          </p>
        </div>
        {userProfile.canCreateCourses && (
          <motion.button 
            onClick={onCreateCourse}
            className="relative z-10 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover py-2.5 px-5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 flex-shrink-0 transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Course
          </motion.button>
        )}
      </motion.div>

      {/* Main Featured/Continue Course or Empty State */}
      {enrollments.length === 0 || !mainCourse ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/40 rounded-2xl border border-zinc-800/50 p-10 text-center flex flex-col items-center justify-center backdrop-blur-sm"
        >
          <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-700/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <BookOpen className="w-8 h-8 text-zinc-300" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight">Your learning journey starts here</h2>
          <p className="text-sm text-zinc-400 max-w-lg mb-8">
            You haven't enrolled in any courses yet. Explore our catalog to discover new skills, or create your own course to share your knowledge with the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onExploreCourses}
              className="px-5 py-2.5 bg-bg-inverted text-text-inverted font-bold rounded-xl hover:bg-bg-inverted-hover transition-all flex items-center justify-center shadow-sm"
            >
              <Zap className="w-4 h-4 mr-2" /> Explore Courses
            </button>
            {userProfile.canCreateCourses && (
              <button 
                onClick={onCreateCourse}
                className="px-5 py-2.5 bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 font-bold rounded-xl hover:bg-zinc-800 hover:text-zinc-100 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Create a Course
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight mb-4 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-zinc-100" />
            {activeEnrollment ? "Jump Back In" : "Featured Course"}
          </h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/40 rounded-2xl border border-zinc-800/50 p-0 relative overflow-hidden group cursor-pointer flex flex-col md:flex-row transition-all hover:border-zinc-600/50 hover:shadow-sm backdrop-blur-sm"
            onClick={() => onSelectCourse(mainCourse.id)}
          >
            {/* Image Section */}
            <div className="w-full md:w-2/5 relative aspect-video md:aspect-auto overflow-hidden bg-zinc-950 border-r border-zinc-800/50">
              {mainCourse.image ? (
                <img src={mainCourse.image} alt={mainCourse.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <BookOpen className="w-12 h-12 text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent md:hidden" />
              <div className="absolute bottom-4 left-4 md:hidden">
                <span className="px-2.5 py-1 bg-zinc-900/90 backdrop-blur-md text-zinc-200 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-zinc-700/50">
                  {activeEnrollment ? "Continue Learning" : "Recommended"}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
              <div className="hidden md:block mb-4">
                <span className="px-2.5 py-1 bg-zinc-800/50 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-zinc-700/50">
                  {activeEnrollment ? "Continue Learning" : "Recommended"}
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-3 leading-tight group-hover:text-zinc-300 transition-colors tracking-tight">{mainCourse.title}</h2>
              
              <p className="text-zinc-400 mb-8 line-clamp-2 text-sm font-medium">
                {mainCourse.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-auto">
                <div className="flex-1">
                  {activeEnrollment ? (
                    <div>
                      <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                        <span>Progress</span>
                        <span className="text-zinc-100">{Math.round(activeEnrollment.progress || 0)}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-bg-inverted rounded-full"
                          style={{ width: `${activeEnrollment.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-zinc-100" /> {mainCourse.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{mainCourse.lessons.length} lessons</span>
                      <span>•</span>
                      <span>{mainCourse.level}</span>
                    </div>
                  )}
                </div>
                <button 
                  className="px-6 py-2.5 bg-bg-inverted text-text-inverted font-bold rounded-xl hover:bg-bg-inverted-hover transition-all w-full sm:w-auto text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  {activeEnrollment ? "Resume" : "Start"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Explore / Newly Published Courses Grid */}
      {exploreCourses.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zinc-100" />
              Explore Courses
            </h2>
            <button 
              onClick={onExploreCourses}
              className="text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
            >
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exploreCourses.map((course, idx) => {
              const enrollment = enrollments.find(e => e.courseId === course.id);
              return (
                <CourseCard 
                  key={course.id}
                  course={course}
                  onClick={() => onSelectCourse(course.id)}
                  progress={enrollment?.progress}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
