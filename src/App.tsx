import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { CourseCard } from "./components/CourseCard";
import { CourseDetail } from "./components/CourseDetail";
import { MyLearning } from "./components/MyLearning";
import { Profile } from "./components/Profile";
import { CourseCreatorWorkspace } from "./components/CourseCreatorWorkspace";
import { MOCK_COURSES, Course, Enrollment, UserProfile, Comment, Group } from "./data/mockData";
import { Filter, TrendingUp, ArrowUpRight, ArrowDownRight, Users, Activity, Plus, Shield, BookOpen, Target, Zap, GraduationCap } from "lucide-react";
import { cn, formatPercent, formatCurrency } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useToast } from "./components/ui/Toast";
import { useAuth } from "./contexts/AuthContext";
import { Auth } from "./components/Auth";
import { Groups } from "./components/Groups";
import { TermsOfService } from "./components/TermsOfService";
import { Loader2 } from "lucide-react";
import { ShortcutsHelp } from "./components/ShortcutsHelp";
import { HomeDashboard } from "./components/HomeDashboard";
import { Onboarding } from "./components/Onboarding";
import { LoadingScreen } from "./components/LoadingScreen";

import { usePlatform } from "./hooks/usePlatform";

const DEFAULT_PROFILE: UserProfile = {
  username: "Learner123",
  email: "learner@example.com",
  bio: "Lifelong learner and curious mind.",
  avatarSeed: "user123",
  joinedDate: new Date().toISOString(),
  onboardingCompleted: false,
};

export default function App() {
  const { session, loading, signOut } = useAuth();
  const userId = session?.user?.id || "guest";

  const [activeTab, setActiveTab] = useState("home");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Real State - User Specific
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [watchlist, setWatchlist] = useLocalStorage<string[]>(`masterlearn-watchlist-${userId}`, []);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  const platform = usePlatform();

  useEffect(() => {
    document.body.className = `platform-${platform}`;
  }, [platform]);

  // Sync with server on login
  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserData = async () => {
        try {
          const res = await fetch(`/api/user/${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            const { user, enrollments: serverEnrollments } = data;
            
            const todayStr = new Date().toISOString().split('T')[0];
            let streak = user.daily_streak || 0;
            let lastLoginStr = user.last_login ? new Date(user.last_login).toISOString().split('T')[0] : null;
            let needsSync = false;

            if (lastLoginStr !== todayStr) {
              if (lastLoginStr) {
                const lastLoginDate = new Date(lastLoginStr);
                const todayDate = new Date(todayStr);
                const diffTime = todayDate.getTime() - lastLoginDate.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                  streak += 1;
                } else if (diffDays > 1) {
                  streak = 1;
                }
              } else {
                streak = 1;
              }
              needsSync = true;
            }

            const profileData = {
              username: user.username || DEFAULT_PROFILE.username,
              email: user.email || session.user.email || "",
              bio: user.bio || DEFAULT_PROFILE.bio,
              avatarSeed: user.avatar_seed || DEFAULT_PROFILE.avatarSeed,
              avatarUrl: user.avatar_url,
              joinedDate: user.joined_date || DEFAULT_PROFILE.joinedDate,
              isAdmin: user.is_admin === 1 || user.is_admin === '1' || user.is_admin === true,
              onboardingCompleted: user.onboarding_completed === 1 || user.onboarding_completed === '1' || user.onboarding_completed === true,
              xp: user.xp || 0,
              level: user.level || 1,
              dailyStreak: streak,
              lastLogin: new Date().toISOString(),
              referralCode: user.referral_code,
              qualifications: user.qualifications,
              interests: user.interests ? JSON.parse(user.interests) : [],
              age: user.age,
              isAdult: user.is_adult === 1 || user.is_adult === '1' || user.is_adult === true,
              canCreateCourses: user.can_create_courses === 1 || user.can_create_courses === '1' || user.can_create_courses === true
            };

            // Fix hallucinated emails or update streak
            if ((session.user.email && profileData.email !== session.user.email) || needsSync) {
              if (session.user.email && profileData.email !== session.user.email) {
                profileData.email = session.user.email;
              }
              fetch('/api/user/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: session.user.id,
                  ...profileData
                })
              }).catch(err => console.error("Failed to sync profile:", err));
            }

            localStorage.setItem(`calculated_profile_${session.user.id}`, JSON.stringify(profileData));
            setUserProfile(profileData);
            setEnrollments(serverEnrollments.map((e: any) => ({
              courseId: e.course_id,
              progress: e.progress,
              enrolledAt: e.enrolled_at,
              lastAccessed: e.last_accessed
            })));
            setIsInitialSyncDone(true);
          } else if (res.status === 404) {
            // New user or wiped database - initialize on server
            const isAdmin = ["mgethmikadinujakumarathunga@gmail.com", "thewantab2012@gmail.com", "therevisionplan@gmail.com"].includes(session.user.email || "");
            const randomId = Math.random().toString(36).substring(7);
            
            // Check if we have a backup in localStorage (in case the SQLite DB was wiped)
            const backupStr = localStorage.getItem(`calculated_profile_${session.user.id}`);
            let newProfile;
            
            if (backupStr) {
              try {
                newProfile = JSON.parse(backupStr);
              } catch (e) {
                console.error("Failed to parse backup profile:", e);
              }
            }
            
            if (!newProfile) {
              newProfile = {
                ...DEFAULT_PROFILE,
                username: `Learner_${randomId}`,
                avatarSeed: randomId,
                email: session.user.email || "",
                isAdmin,
                xp: 0,
                level: 1,
                dailyStreak: 1,
                interests: []
              };
            }
            
            await fetch('/api/user/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: session.user.id,
                ...newProfile
              })
            }).catch(() => {});
            
            setUserProfile(newProfile);
            
            const localEnrollmentsStr = localStorage.getItem(`local_enrollments_${session.user.id}`);
            if (localEnrollmentsStr) {
              try {
                setEnrollments(JSON.parse(localEnrollmentsStr));
              } catch (e) {
                setEnrollments([]);
              }
            } else {
              setEnrollments([]);
            }
            
            setIsInitialSyncDone(true);
          } else {
            console.error("Unexpected status code:", res.status);
            
            const backupStr = localStorage.getItem(`calculated_profile_${session.user.id}`);
            if (backupStr) {
              try {
                setUserProfile(JSON.parse(backupStr));
              } catch (e) {
                setUserProfile({
                  ...DEFAULT_PROFILE,
                  email: session.user.email || ""
                });
              }
            } else {
              setUserProfile({
                ...DEFAULT_PROFILE,
                email: session.user.email || ""
              });
            }
            
            const localEnrollmentsStr = localStorage.getItem(`local_enrollments_${session.user.id}`);
            if (localEnrollmentsStr) {
              try {
                setEnrollments(JSON.parse(localEnrollmentsStr));
              } catch (e) {
                setEnrollments([]);
              }
            } else {
              setEnrollments([]);
            }
            
            setIsInitialSyncDone(true);
          }
        } catch (err) {
          console.error("Failed to sync user data:", err);
          
          const backupStr = localStorage.getItem(`calculated_profile_${session.user.id}`);
          if (backupStr) {
            try {
              setUserProfile(JSON.parse(backupStr));
            } catch (e) {
              setUserProfile({
                ...DEFAULT_PROFILE,
                email: session.user.email || ""
              });
            }
          } else {
            setUserProfile({
              ...DEFAULT_PROFILE,
              email: session.user.email || ""
            });
          }
          
          const localEnrollmentsStr = localStorage.getItem(`local_enrollments_${session.user.id}`);
          if (localEnrollmentsStr) {
            try {
              setEnrollments(JSON.parse(localEnrollmentsStr));
            } catch (e) {
              setEnrollments([]);
            }
          } else {
            setEnrollments([]);
          }
          
          setIsInitialSyncDone(true);
        }
      };
      fetchUserData();
    } else {
      setUserProfile(DEFAULT_PROFILE);
      setEnrollments([]);
      setIsInitialSyncDone(false);
    }
  }, [session?.user?.id, session?.user?.email]);

  useEffect(() => {
    const handleSignOut = () => {
      signOut();
    };
    window.addEventListener('app:signout', handleSignOut);
    return () => window.removeEventListener('app:signout', handleSignOut);
  }, [signOut]);

  useEffect(() => {
    const handleCourseCompleted = (e: CustomEvent) => {
      if (!session?.user) return;
      const { qualification, certificateName } = e.detail;
      
      setUserProfile(prev => {
        const newProfile = { ...prev };
        let updated = false;
        
        if (qualification && !newProfile.qualifications?.includes(qualification)) {
          newProfile.qualifications = newProfile.qualifications ? `${newProfile.qualifications}, ${qualification}` : qualification;
          updated = true;
        }
        
        if (updated) {
           localStorage.setItem(`calculated_profile_${session.user.id}`, JSON.stringify(newProfile));
           fetch('/api/user/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: session.user.id,
                ...newProfile
              })
            }).catch(() => {});
        }
        return newProfile;
      });
    };
    
    const handleLessonCompleted = (e: CustomEvent) => {
      if (!session?.user) return;
      const { xp } = e.detail;
      
      setUserProfile(prev => {
        const newProfile = { ...prev, xp: (prev.xp || 0) + xp };
        localStorage.setItem(`calculated_profile_${session.user.id}`, JSON.stringify(newProfile));
        return newProfile;
      });

      fetch(`/api/user/${session.user.id}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: xp })
      }).catch(err => console.error("Failed to add XP:", err));
    };
    
    window.addEventListener('courseCompleted', handleCourseCompleted as EventListener);
    window.addEventListener('lessonCompleted', handleLessonCompleted as EventListener);
    return () => {
      window.removeEventListener('courseCompleted', handleCourseCompleted as EventListener);
      window.removeEventListener('lessonCompleted', handleLessonCompleted as EventListener);
    };
  }, [session?.user]);

  // Global State
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Fetch global data on mount
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [coursesRes, groupsRes] = await Promise.all([
          fetch('/api/courses').catch(() => ({ ok: false, status: 404, json: async () => [] })),
          fetch('/api/groups').catch(() => ({ ok: false, status: 404, json: async () => [] }))
        ]);
        
        let serverCourses = [];
        if (coursesRes.ok) {
          serverCourses = await coursesRes.json();
        }
        
        const localCoursesStr = localStorage.getItem('local_courses');
        if (localCoursesStr) {
          try {
            const localCourses = JSON.parse(localCoursesStr);
            const localIds = new Set(localCourses.map((c: any) => c.id));
            serverCourses = [...localCourses, ...serverCourses.filter((c: any) => !localIds.has(c.id))];
          } catch (e) {
            console.error("Failed to parse local courses", e);
          }
        }
        setCourses(serverCourses);
        
        if (groupsRes.ok) {
          const serverGroups = await groupsRes.json();
          setGroups(serverGroups);
        }
      } catch (err) {
        console.error("Failed to fetch global data:", err);
        const localCoursesStr = localStorage.getItem('local_courses');
        if (localCoursesStr) {
          try {
            setCourses(JSON.parse(localCoursesStr));
          } catch (e) {}
        }
      }
    };
    fetchGlobalData();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch ((e.key || "").toLowerCase()) {
        case '/':
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
        case 'c':
          setActiveTab("courses");
          break;
        case 'l':
          setActiveTab("my-learning");
          break;
        case 'g':
          setActiveTab("groups");
          break;
        case 'n':
          setIsCourseCreatorOpen(true);
          break;
        case 'escape':
          setIsCourseCreatorOpen(false);
          setSelectedCourseId(null);
          setIsShortcutsOpen(false);
          break;
        case '?':
          setIsShortcutsOpen(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCourseCreatorOpen, setIsCourseCreatorOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { addToast } = useToast();

  const handleEnroll = async (courseId: string) => {
    if (!session?.user) {
      addToast("Please sign in to enroll in courses", "error");
      return;
    }

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          courseId
        })
      }).catch(() => ({ ok: false, status: 404 }));

      if (res.ok) {
        setEnrollments(prev => {
          const newEnrollments = [...prev, { courseId, progress: 0, enrolledAt: new Date().toISOString(), lastAccessed: new Date().toISOString() }];
          localStorage.setItem(`local_enrollments_${session.user.id}`, JSON.stringify(newEnrollments));
          return newEnrollments;
        });
        setCourses(prev => {
          const newCourses = prev.map(c => c.id === courseId ? { ...c, students: c.students + 1 } : c);
          localStorage.setItem('local_courses', JSON.stringify(newCourses));
          return newCourses;
        });
        
        const courseTitle = courses.find(c => c.id === courseId)?.title || 'Course';
        addToast(`Successfully enrolled in ${courseTitle}`, "success");
      } else {
        // Fallback for non-ok responses
        setEnrollments(prev => {
          const newEnrollments = [...prev, { courseId, progress: 0, enrolledAt: new Date().toISOString(), lastAccessed: new Date().toISOString() }];
          localStorage.setItem(`local_enrollments_${session.user.id}`, JSON.stringify(newEnrollments));
          return newEnrollments;
        });
        setCourses(prev => {
          const newCourses = prev.map(c => c.id === courseId ? { ...c, students: c.students + 1 } : c);
          localStorage.setItem('local_courses', JSON.stringify(newCourses));
          return newCourses;
        });
        
        const courseTitle = courses.find(c => c.id === courseId)?.title || 'Course';
        addToast(`Successfully enrolled in ${courseTitle} (Local Mode)`, "success");
      }
    } catch (err) {
      setEnrollments(prev => {
        const newEnrollments = [...prev, { courseId, progress: 0, enrolledAt: new Date().toISOString(), lastAccessed: new Date().toISOString() }];
        localStorage.setItem(`local_enrollments_${session.user.id}`, JSON.stringify(newEnrollments));
        return newEnrollments;
      });
      setCourses(prev => {
        const newCourses = prev.map(c => c.id === courseId ? { ...c, students: c.students + 1 } : c);
        localStorage.setItem('local_courses', JSON.stringify(newCourses));
        return newCourses;
      });
      
      const courseTitle = courses.find(c => c.id === courseId)?.title || 'Course';
      addToast(`Successfully enrolled in ${courseTitle} (Offline Mode)`, "success");
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/unenroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, courseId })
      }).catch(() => ({ ok: false, status: 404 }));
      if (res.ok) {
        setEnrollments(prev => {
          const newEnrollments = prev.filter(e => e.courseId !== courseId);
          localStorage.setItem(`local_enrollments_${session.user.id}`, JSON.stringify(newEnrollments));
          return newEnrollments;
        });
        setCourses(prev => {
          const newCourses = prev.map(c => c.id === courseId ? { ...c, students: Math.max(0, c.students - 1) } : c);
          localStorage.setItem('local_courses', JSON.stringify(newCourses));
          return newCourses;
        });
        addToast("Unenrolled from course", "success");
      } else {
        // Fallback for non-ok responses
        setEnrollments(prev => {
          const newEnrollments = prev.filter(e => e.courseId !== courseId);
          localStorage.setItem(`local_enrollments_${session.user.id}`, JSON.stringify(newEnrollments));
          return newEnrollments;
        });
        setCourses(prev => {
          const newCourses = prev.map(c => c.id === courseId ? { ...c, students: Math.max(0, c.students - 1) } : c);
          localStorage.setItem('local_courses', JSON.stringify(newCourses));
          return newCourses;
        });
        addToast("Unenrolled from course (Local Mode)", "success");
      }
    } catch (err) {
      setEnrollments(prev => {
        const newEnrollments = prev.filter(e => e.courseId !== courseId);
        localStorage.setItem(`local_enrollments_${session.user.id}`, JSON.stringify(newEnrollments));
        return newEnrollments;
      });
      setCourses(prev => {
        const newCourses = prev.map(c => c.id === courseId ? { ...c, students: Math.max(0, c.students - 1) } : c);
        localStorage.setItem('local_courses', JSON.stringify(newCourses));
        return newCourses;
      });
      addToast("Unenrolled from course (Offline Mode)", "success");
    }
  };

  const toggleWatchlist = (courseId: string) => {
    setWatchlist(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
    addToast(
      watchlist.includes(courseId) ? "Removed from watchlist" : "Added to watchlist",
      "success"
    );
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      }).catch(() => ({ ok: false, status: 404 }));
      
      if (res.ok) {
        setCourses(prev => {
          const newCourses = prev.filter(c => c.id !== courseId);
          localStorage.setItem('local_courses', JSON.stringify(newCourses));
          return newCourses;
        });
        setEnrollments(prev => {
          const newEnrollments = prev.filter(e => e.courseId !== courseId);
          localStorage.setItem(`local_enrollments_${session?.user?.id}`, JSON.stringify(newEnrollments));
          return newEnrollments;
        });
        setIsCourseCreatorOpen(false);
        setEditingCourse(null);
        setSelectedCourseId(prev => prev === courseId ? null : prev);
        addToast("Course deleted successfully", "success");
      } else {
        // Fallback
        setCourses(prev => {
          const newCourses = prev.filter(c => c.id !== courseId);
          localStorage.setItem('local_courses', JSON.stringify(newCourses));
          return newCourses;
        });
        setEnrollments(prev => {
          const newEnrollments = prev.filter(e => e.courseId !== courseId);
          localStorage.setItem(`local_enrollments_${session?.user?.id}`, JSON.stringify(newEnrollments));
          return newEnrollments;
        });
        setIsCourseCreatorOpen(false);
        setEditingCourse(null);
        setSelectedCourseId(prev => prev === courseId ? null : prev);
        addToast("Course deleted locally", "success");
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
      // Fallback
      setCourses(prev => {
        const newCourses = prev.filter(c => c.id !== courseId);
        localStorage.setItem('local_courses', JSON.stringify(newCourses));
        return newCourses;
      });
      setEnrollments(prev => {
        const newEnrollments = prev.filter(e => e.courseId !== courseId);
        localStorage.setItem(`local_enrollments_${session.user.id}`, JSON.stringify(newEnrollments));
        return newEnrollments;
      });
      setIsCourseCreatorOpen(false);
      setEditingCourse(null);
      setSelectedCourseId(prev => prev === courseId ? null : prev);
      addToast("Course deleted locally", "success");
    }
  };

  const handleCreateCourse = async (newCourse: any) => {
    if (!session?.user) return;
    
    const isUpdate = !!newCourse.id;
    const course: Course = {
      ...newCourse,
      id: newCourse.id || "c_" + Math.random().toString(36).substr(2, 9),
      instructor: {
        id: session.user.id,
        name: userProfile.username,
        avatarSeed: userProfile.avatarSeed,
        avatarUrl: userProfile.avatarUrl,
        bio: userProfile.bio,
        qualifications: userProfile.qualifications,
        email: userProfile.email
      },
      students: newCourse.students || 0,
      rating: newCourse.rating || 0,
      lessons: newCourse.lessons || [],
      comments: newCourse.comments || [],
      status: newCourse.status || 'published'
    };

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });

      if (res.ok) {
        setCourses(prev => {
          const newCourses = isUpdate ? prev.map(c => c.id === course.id ? course : c) : [course, ...prev];
          localStorage.setItem('local_courses', JSON.stringify(newCourses));
          return newCourses;
        });
        setIsCourseCreatorOpen(false);
        setEditingCourse(null);
        addToast(
          course.status === 'published' 
            ? (isUpdate ? "Course updated successfully!" : "Course published successfully!") 
            : (isUpdate ? "Course unpublished to draft!" : "Course saved as draft!"), 
          "success"
        );
      } else {
        // Fallback for static deployments (e.g., Vercel) or server errors
        setCourses(prev => {
          const newCourses = isUpdate ? prev.map(c => c.id === course.id ? course : c) : [course, ...prev];
          localStorage.setItem('local_courses', JSON.stringify(newCourses));
          return newCourses;
        });
        setIsCourseCreatorOpen(false);
        setEditingCourse(null);
        addToast(
          course.status === 'published' 
            ? (isUpdate ? "Course updated locally!" : "Course published locally!") 
            : (isUpdate ? "Course unpublished locally!" : "Course saved locally!"), 
          "success"
        );
      }
    } catch (err) {
      console.error("Failed to save course:", err);
      // Fallback for network errors
      setCourses(prev => {
        const newCourses = isUpdate ? prev.map(c => c.id === course.id ? course : c) : [course, ...prev];
        localStorage.setItem('local_courses', JSON.stringify(newCourses));
        return newCourses;
      });
      setIsCourseCreatorOpen(false);
      setEditingCourse(null);
      addToast("Course saved locally (offline mode)", "success");
    }
  };

  const filteredCourses = courses.filter(course => {
    const isInstructor = session?.user?.id === course.instructor?.id;
    const isPublished = course.status === 'published' || !course.status; // Treat undefined as published for backward compatibility
    if (!isPublished && !isInstructor) return false;

    const matchesSearch = (course.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()) || 
                          (course.description || "").toLowerCase().includes((searchQuery || "").toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Technology", "Business", "Arts", "Science", "Lifestyle"];

  if (loading || (session?.user && !isInitialSyncDone)) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Auth />;
  }

  if (!userProfile.onboardingCompleted) {
    return (
      <Onboarding 
        onComplete={(data) => {
          setUserProfile(prev => {
            const newProfile = { ...prev, onboardingCompleted: true, ...data };
            if (session?.user?.id) {
              localStorage.setItem(`calculated_profile_${session.user.id}`, JSON.stringify(newProfile));
            }
            return newProfile;
          });
          if (session?.user?.id) {
            fetch('/api/user/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: session.user.id,
                ...userProfile,
                onboardingCompleted: true,
                ...data
              })
            });
          }
        }}
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      userProfile={userProfile}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-bg-secondary p-6 rounded-xl border border-border-primary">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              {activeTab === 'courses' && 'Explore Courses'}
              {activeTab === 'my-learning' && 'My Learning'}
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'groups' && 'Study Groups'}
            </h1>
            <p className="text-text-secondary font-medium mt-1 text-sm">
              {activeTab === 'courses' && 'Discover new skills and expand your knowledge.'}
              {activeTab === 'my-learning' && 'Track your progress and continue learning.'}
            </p>
          </div>

          {activeTab === 'courses' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCourseCreatorOpen(true)}
                className="flex items-center gap-2 bg-bg-inverted hover:bg-bg-inverted-hover text-text-inverted px-4 py-2 rounded-md font-medium transition-all active:scale-95 text-sm"
              >
                <Plus className="w-4 h-4" />
                Teach a Course
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <HomeDashboard 
                courses={courses.filter(c => c.status === 'published' || !c.status || c.instructor?.id === session?.user?.id)} 
                enrollments={enrollments}
                userProfile={userProfile}
                onSelectCourse={(id) => {
                  setSelectedCourseId(id);
                  setActiveTab('courses');
                }}
                onCreateCourse={() => setIsCourseCreatorOpen(true)}
                onExploreCourses={() => setActiveTab('courses')}
              />
            </motion.div>
          )}

          {activeTab === 'courses' && !selectedCourseId && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-secondary p-4 rounded-xl border border-border-primary">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar w-full sm:w-auto">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all border",
                        selectedCategory === cat 
                          ? "bg-bg-inverted text-text-inverted border-border-hover" 
                          : "bg-bg-tertiary text-text-primary hover:bg-bg-secondary border-border-secondary"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search courses... (/)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-72 pl-10 pr-4 py-2 bg-bg-tertiary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-border-hover focus:border-border-hover transition-all text-sm text-text-primary placeholder-text-muted"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Course Grid */}
              {filteredCourses.length > 0 ? (
                <div className="space-y-8">
                  {searchQuery === "" && selectedCategory === "All" && enrollments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="w-5 h-5 text-text-secondary" />
                        <h2 className="text-xl font-semibold text-text-primary">My Courses</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.filter(c => enrollments.some(e => e.courseId === c.id)).slice(0, 3).map((course, idx) => (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <CourseCard 
                              course={course} 
                              onClick={() => setSelectedCourseId(course.id)}
                              isWatchlisted={watchlist.includes(course.id)}
                              onToggleWatchlist={() => toggleWatchlist(course.id)}
                              progress={enrollments.find(e => e.courseId === course.id)?.progress}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery === "" && selectedCategory === "All" && (
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-text-secondary" />
                        <h2 className="text-xl font-semibold text-text-primary">Trending Now</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.slice(0, 3).map((course, idx) => (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <CourseCard 
                              course={course} 
                              onClick={() => setSelectedCourseId(course.id)}
                              isWatchlisted={watchlist.includes(course.id)}
                              onToggleWatchlist={() => toggleWatchlist(course.id)}
                              progress={enrollments.find(e => e.courseId === course.id)?.progress}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    {searchQuery === "" && selectedCategory === "All" && (
                      <h2 className="text-xl font-semibold text-text-primary mb-6">All Courses</h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCourses.map((course, idx) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <CourseCard 
                            course={course} 
                            onClick={() => setSelectedCourseId(course.id)}
                            isWatchlisted={watchlist.includes(course.id)}
                            onToggleWatchlist={() => toggleWatchlist(course.id)}
                            progress={enrollments.find(e => e.courseId === course.id)?.progress}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-bg-secondary rounded-xl border border-border-primary border-dashed">
                  <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary">No courses found</h3>
                  <p className="text-text-secondary mt-2 text-sm">Try adjusting your search or filters.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'courses' && selectedCourseId && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              key={selectedCourseId}
            >
              <CourseDetail 
                course={courses.find(c => c.id === selectedCourseId)!} 
                onBack={() => setSelectedCourseId(null)}
                onEnroll={handleEnroll}
                isWatchlisted={watchlist.includes(selectedCourseId)}
                onToggleWatchlist={() => toggleWatchlist(selectedCourseId)}
                isEnrolled={enrollments.some(e => e.courseId === selectedCourseId)}
                progress={enrollments.find(e => e.courseId === selectedCourseId)?.progress || 0}
                isInstructor={session?.user?.id === courses.find(c => c.id === selectedCourseId)?.instructor.id}
                onUnenroll={handleUnenroll}
                onDeleteCourse={handleDeleteCourse}
                onEditCourse={(courseId) => {
                  const courseToEdit = courses.find(c => c.id === courseId);
                  if (courseToEdit) {
                    setEditingCourse(courseToEdit);
                    setIsCourseCreatorOpen(true);
                  }
                }}
                onUpdateProgress={async (progress) => {
                  if (!session?.user) return;
                  setEnrollments(prev => {
                    const newEnrollments = prev.map(e => 
                      e.courseId === selectedCourseId ? { ...e, progress, lastAccessed: new Date().toISOString() } : e
                    );
                    localStorage.setItem(`local_enrollments_${session.user.id}`, JSON.stringify(newEnrollments));
                    return newEnrollments;
                  });
                  try {
                    await fetch(`/api/enrollments/${selectedCourseId}/progress`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: session.user.id, progress })
                    });
                  } catch (err) {
                    console.error("Failed to update progress", err);
                  }
                }}
              />
            </motion.div>
          )}

          {activeTab === 'my-learning' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MyLearning 
                enrollments={enrollments} 
                courses={courses}
                onSelectCourse={(id) => {
                  setSelectedCourseId(id);
                  setActiveTab('courses');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Profile 
                profile={userProfile} 
                onUpdateProfile={(updates) => {
                  setUserProfile(prev => {
                    const newProfile = { ...prev, ...updates };
                    localStorage.setItem(`calculated_profile_${session?.user?.id}`, JSON.stringify(newProfile));
                    return newProfile;
                  });
                  if (session?.user?.id) {
                    fetch('/api/user/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: session.user.id,
                        ...userProfile,
                        ...updates
                      })
                    });
                  }
                }}
                onSignOut={signOut}
                onCreateCourse={() => {
                  setEditingCourse(null);
                  setIsCourseCreatorOpen(true);
                }}
                createdCourses={courses.filter(c => c.instructor.id === userId)}
                onEditCourse={(course) => {
                  setEditingCourse(course);
                  setIsCourseCreatorOpen(true);
                }}
                enrollments={enrollments}
                courses={courses}
              />
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Groups />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isCourseCreatorOpen && (
          <CourseCreatorWorkspace 
            initialData={editingCourse || undefined}
            userProfile={userProfile}
            onClose={() => {
              setIsCourseCreatorOpen(false);
              setEditingCourse(null);
            }}
            onSave={handleCreateCourse}
            onDelete={handleDeleteCourse}
          />
        )}
      </AnimatePresence>

      <ShortcutsHelp 
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </Layout>
  );
}
