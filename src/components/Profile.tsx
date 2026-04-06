import React, { useState } from "react";
import { UserProfile, Course, Enrollment } from "../data/mockData";
import { User, Mail, Calendar, Edit2, Save, LogOut, BookOpen, Award, Star, Flame, Trophy, Zap, PlusCircle, GraduationCap, PlayCircle, Settings, RefreshCw, Tag, AlignLeft, BadgeCheck, Upload } from "lucide-react";
import { useToast } from "./ui/Toast";
import { motion } from "motion/react";

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onSignOut: () => void;
  onCreateCourse?: () => void;
  createdCourses?: Course[];
  onEditCourse?: (course: Course) => void;
  enrollments?: Enrollment[];
  courses?: Course[];
}

export function Profile({ profile, onUpdateProfile, onSignOut, onCreateCourse, createdCourses = [], onEditCourse, enrollments = [], courses = [] }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const { addToast } = useToast();

  const isCoFounder = ["mgethmikadinujakumarathunga@gmail.com", "thewantab2012@gmail.com", "therevisionplan@gmail.com"].includes(profile.email || "");

  const handleSave = () => {
    if (!editedProfile.username.trim()) {
      addToast("Username cannot be empty", "error");
      return;
    }
    onUpdateProfile(editedProfile);
    setIsEditing(false);
    addToast("Profile updated successfully", "success");
  };

  const handleRandomizeAvatar = () => {
    setEditedProfile({ ...editedProfile, avatarSeed: Math.random().toString(36).substring(7), avatarUrl: undefined });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile({ ...editedProfile, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interests = e.target.value.split(',').map(i => i.trim()).filter(i => i);
    setEditedProfile({ ...editedProfile, interests });
  };

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const certificatesEarned = enrollments.filter(e => e.progress === 100 && courses.find(c => c.id === e.courseId)?.certificate).length;

  const stats = [
    { label: "Courses Enrolled", value: enrollments.length.toString(), icon: BookOpen },
    { label: "Courses Completed", value: completedCourses.toString(), icon: Award },
    { label: "Certificates", value: certificatesEarned.toString(), icon: Trophy },
    { label: "Current Streak", value: `${profile.dailyStreak || 0} Days`, icon: Flame },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Student Profile</h1>
          <p className="text-text-secondary mt-1 font-medium text-sm">Manage your learning journey and personal details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-center border border-zinc-800/50 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full bg-zinc-950 border-2 border-zinc-700/50 overflow-hidden flex items-center justify-center shadow-sm">
                <img 
                  src={isEditing ? (editedProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editedProfile.avatarSeed || 'default'}`) : (profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed || 'default'}`)}
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 flex gap-2">
                  <label className="bg-zinc-800 text-zinc-100 p-2 rounded-full hover:bg-zinc-700 transition-colors border border-zinc-600 cursor-pointer shadow-lg" title="Upload Photo">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <button 
                    onClick={handleRandomizeAvatar}
                    className="bg-zinc-800 text-zinc-100 p-2 rounded-full hover:bg-zinc-700 transition-colors border border-zinc-600 shadow-lg"
                    title="Randomize Avatar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="w-full space-y-4 text-left">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Username</label>
                  <input
                    type="text"
                    value={editedProfile.username}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    className="mt-1 text-sm font-bold text-zinc-100 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-zinc-600/50 focus:border-zinc-600/50 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-1"><AlignLeft className="w-3 h-3"/> Bio</label>
                  <textarea
                    value={editedProfile.bio || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="mt-1 text-sm font-medium text-zinc-100 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-zinc-600/50 focus:border-zinc-600/50 resize-none h-24 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-1"><GraduationCap className="w-3 h-3"/> Qualifications</label>
                  <textarea
                    value={editedProfile.qualifications || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, qualifications: e.target.value })}
                    placeholder="e.g. BSc Computer Science..."
                    className="mt-1 text-sm font-medium text-zinc-100 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-zinc-600/50 focus:border-zinc-600/50 resize-none h-20 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-1"><Tag className="w-3 h-3"/> Interests (comma separated)</label>
                  <input
                    type="text"
                    value={(editedProfile.interests || []).join(", ")}
                    onChange={handleInterestsChange}
                    placeholder="e.g. React, Design, Python..."
                    className="mt-1 text-sm font-medium text-zinc-100 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-zinc-600/50 focus:border-zinc-600/50 transition-all shadow-inner"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-zinc-100 flex items-center justify-center gap-2 tracking-tight">
                  {profile.username}
                  {isCoFounder && (
                    <span className="flex items-center gap-1 text-[10px] bg-zinc-800/50 text-zinc-300 px-2 py-0.5 rounded-md font-bold border border-zinc-700/50">
                      <BadgeCheck className="w-3 h-3" />
                      Co-founder
                    </span>
                  )}
                </h2>
                <p className="text-zinc-400 mt-2 flex items-center justify-center gap-2 font-medium bg-zinc-900/50 border border-zinc-800/50 px-3 py-1.5 rounded-lg w-full text-sm">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <span className="truncate">{profile.email}</span>
                </p>
                {profile.bio && (
                  <p className="text-sm font-medium text-zinc-400 mt-4 italic">
                    "{profile.bio}"
                  </p>
                )}
                
                <div className="w-full mt-6 text-left space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-zinc-400" />
                      Qualifications
                    </h3>
                    <p className="text-sm font-medium text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                      {profile.qualifications || "No qualifications added yet."}
                    </p>
                  </div>
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-zinc-400" />
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-zinc-800/50 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-zinc-700/50">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="w-full mt-6 pt-6 border-t border-zinc-800/50 flex flex-col gap-3">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(profile);
                    }}
                    className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 font-bold rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-bg-inverted text-text-inverted font-bold rounded-xl hover:bg-bg-inverted-hover transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-2.5 bg-bg-inverted text-text-inverted font-bold rounded-xl hover:bg-bg-inverted-hover transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              
              {!isEditing && onCreateCourse && profile.canCreateCourses && (
                <button
                  onClick={onCreateCourse}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 font-bold rounded-xl hover:bg-zinc-800 hover:text-zinc-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create a Course
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={onSignOut}
                  className="w-full px-4 py-2.5 bg-transparent border border-zinc-800/50 text-zinc-500 font-bold rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-5 flex items-center gap-4 hover:border-zinc-600/50 transition-colors group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 group-hover:bg-zinc-800 group-hover:border-zinc-600/50 transition-colors`}>
                  <stat.icon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">{stat.label}</p>
                  <p className="text-xl font-bold text-zinc-100">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {profile.canCreateCourses && (
            <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-6">
              <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2 tracking-tight">
                <BookOpen className="w-5 h-5 text-zinc-100" />
                My Created Courses
              </h3>
              {createdCourses.length > 0 ? (
                <div className="space-y-3">
                  {createdCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-600/50 transition-all bg-zinc-950/50 group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800/50 text-zinc-400 flex items-center justify-center border border-zinc-700/50 group-hover:bg-zinc-800 group-hover:text-zinc-300 group-hover:border-zinc-600/50 transition-colors">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-zinc-100 group-hover:text-zinc-300 transition-colors">{course.title}</h4>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{course.status === 'published' ? 'Published' : 'Draft'} • {course.students} Students</p>
                        </div>
                      </div>
                      {onEditCourse && (
                        <button 
                          onClick={() => onEditCourse(course)}
                          className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-all"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-zinc-800/50 rounded-2xl bg-zinc-950/50">
                  <p className="text-sm text-zinc-400 font-medium mb-6">You haven't created any courses yet.</p>
                  {onCreateCourse && (
                    <button 
                      onClick={onCreateCourse}
                      className="bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm"
                    >
                      Create Your First Course
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
