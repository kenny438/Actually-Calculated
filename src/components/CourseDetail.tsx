import React, { useState } from "react";
import { Course } from "../data/mockData";
import { formatCurrency, cn } from "../lib/utils";
import { ArrowLeft, Share2, Star, Clock, Users, PlayCircle, CheckCircle, Lock, Check, GraduationCap, Edit2, Sparkles, BadgeCheck, ChevronDown, ChevronUp, Globe, Award, HelpCircle, MessageSquare, Info, Target, Zap, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "./ui/Toast";
import { CommentSection } from "./CommentSection";
import { LessonPlayer } from "./LessonPlayer";

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEnroll: (courseId: string) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  isEnrolled: boolean;
  progress?: number;
  onUpdateProgress?: (progress: number) => void;
  isInstructor?: boolean;
  onDeleteCourse?: (courseId: string) => void;
  onEditCourse?: (courseId: string) => void;
  onUnenroll?: (courseId: string) => void;
  initialLessonId?: string;
}

export function CourseDetail({ course, onBack, onEnroll, isWatchlisted, onToggleWatchlist, isEnrolled, progress = 0, onUpdateProgress, isInstructor, onDeleteCourse, onEditCourse, onUnenroll, initialLessonId }: CourseDetailProps) {
  const { addToast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(initialLessonId || null);
  
  // Initialize completed lessons based on progress
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    const initialCompletedCount = Math.floor((progress / 100) * course.lessons.length);
    return new Set(course.lessons.slice(0, initialCompletedCount).map(l => l.id));
  });

  React.useEffect(() => {
    const initialCompletedCount = Math.floor((progress / 100) * course.lessons.length);
    setCompletedLessons(new Set(course.lessons.slice(0, initialCompletedCount).map(l => l.id)));
  }, [course.lessons]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Link copied to clipboard!", "success");
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteCourse?.(course.id);
  };

  const handleLessonComplete = () => {
    if (activeLessonId) {
      let newProgress = 0;
      setCompletedLessons(prev => {
        const next = new Set(prev);
        next.add(activeLessonId);
        newProgress = Math.round((next.size / course.lessons.length) * 100);
        return next;
      });
      if (onUpdateProgress) {
        // We need to calculate it here or use the value from the updater
        // But since state updates are async, we can just calculate it based on the current state + 1
        // Wait, it's better to just calculate it directly
        const nextSize = completedLessons.has(activeLessonId) ? completedLessons.size : completedLessons.size + 1;
        const calcProgress = Math.round((nextSize / course.lessons.length) * 100);
        onUpdateProgress(calcProgress);
      }
      addToast("Lesson completed! +10 XP", "success");
      window.dispatchEvent(new CustomEvent('lessonCompleted', { detail: { xp: 10 } }));
    }
    setActiveLessonId(null);
  };

  const [activeTab, setActiveTab] = useState("about");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const activeLesson = course.lessons.find(l => l.id === activeLessonId);

  if (activeLesson) {
    return (
      <LessonPlayer 
        lesson={activeLesson} 
        onClose={() => setActiveLessonId(null)} 
        onComplete={() => {
          handleLessonComplete();
          const nextSize = completedLessons.has(activeLesson.id) ? completedLessons.size : completedLessons.size + 1;
          const calcProgress = Math.round((nextSize / course.lessons.length) * 100);
          if (calcProgress === 100 && course.qualificationGranted) {
             window.dispatchEvent(new CustomEvent('courseCompleted', { detail: { qualification: course.qualificationGranted, certificateName: course.certificateName } }));
          }
        }} 
      />
    );
  }

  const tabs = [
    { id: "about", label: "About", icon: Info },
    { id: "outcomes", label: "Outcomes", icon: Target },
    { id: "courses", label: "Curriculum", icon: PlayCircle },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-bg-primary"
    >
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center text-sm font-bold text-text-secondary hover:text-text-primary transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={onToggleWatchlist} className={cn("p-2 transition-colors", isWatchlisted ? "text-yellow-500" : "text-text-secondary hover:text-text-primary")}>
              <Star className={cn("w-5 h-5", isWatchlisted && "fill-current")} />
            </button>
            {isInstructor && (
              <div className="flex gap-2 ml-2">
                <button onClick={() => onEditCourse?.(course.id)} className="p-2 text-text-secondary hover:text-text-primary"><Edit2 className="w-5 h-5" /></button>
                <button onClick={handleDelete} className="p-2 text-text-secondary hover:text-rose-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden border-b border-border-primary">
        <div className="absolute inset-0 z-0">
          <img 
            src={course.image || `https://picsum.photos/seed/${course.id}/1920/1080`} 
            alt="" 
            className="w-full h-full object-cover opacity-10 blur-sm"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/50 via-bg-primary to-bg-primary"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-bg-tertiary text-text-secondary text-[10px] font-bold uppercase tracking-widest rounded-full border border-border-secondary">
                  {course.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
                  <Star className="w-3 h-3 fill-current" />
                  {course.rating.toFixed(1)} ({course.students.toLocaleString()} enrolled)
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor.avatarSeed + i}`} className="w-10 h-10 rounded-full border-2 border-bg-primary bg-bg-tertiary" alt="" />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="text-text-primary font-bold">Instructors: {course.instructor.name} and 3 others</p>
                  <p className="text-text-secondary">Expert educators from the industry</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                {isEnrolled ? (
                  <div className="flex items-center gap-4">
                    <div className="px-8 py-4 bg-bg-tertiary text-text-primary font-bold rounded-xl border border-border-secondary flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Enrolled
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-text-secondary">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-bg-inverted" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => onEnroll(course.id)}
                    className="px-10 py-4 bg-bg-inverted text-text-inverted font-bold rounded-xl hover:bg-bg-inverted-hover transition-all shadow-lg shadow-bg-inverted/20 text-lg active:scale-95"
                  >
                    Enroll for Free
                  </button>
                )}
                <button 
                  onClick={() => {
                    setExpandedFaq(0);
                    const faqSection = document.getElementById('faq-section');
                    faqSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-bg-tertiary text-text-primary font-bold rounded-xl border border-border-secondary hover:bg-bg-primary transition-all flex items-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  Is this right for me?
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-bg-tertiary shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={course.image || `https://picsum.photos/seed/${course.id}/800/800`} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-bg-secondary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-text-primary">{course.lessons.length} modules</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Course series</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-text-primary">{course.rating.toFixed(1)} <Star className="w-5 h-5 inline fill-current text-yellow-500" /></p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Average rating</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-text-primary">{course.level}</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Difficulty level</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-text-primary">{course.estimatedTime || "Self-paced"}</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Duration</p>
            </div>
            <div className="space-y-1 hidden lg:block">
              <p className="text-2xl font-bold text-text-primary">Flexible</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Schedule</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-16 z-30 bg-bg-primary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                activeTab === tab.id ? "border-bg-inverted text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div 
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <section>
                    <h2 className="text-3xl font-bold text-text-primary mb-6">What you'll learn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(course.outcomes || [
                        "Gain a deep understanding of the core concepts",
                        "Apply your knowledge to real-world projects",
                        "Learn best practices and industry standards",
                        "Build a professional portfolio to showcase your skills"
                      ]).map((outcome, i) => (
                        <div key={i} className="flex gap-3">
                          <Check className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                          <p className="text-text-secondary leading-relaxed">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-3xl font-bold text-text-primary mb-6">Skills you'll gain</h2>
                    <div className="flex flex-wrap gap-3">
                      {(course.skills || course.tags || ["Learning", "Growth", "Success"]).map((skill, i) => (
                        <span key={i} className="px-4 py-2 bg-bg-tertiary text-text-primary rounded-full border border-border-secondary text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-3xl font-bold text-text-primary mb-6">Tools you'll learn</h2>
                    <div className="flex flex-wrap gap-3">
                      {(course.tools || ["Standard Tools", "Industry Software"]).map((tool, i) => (
                        <span key={i} className="px-4 py-2 bg-bg-secondary text-text-secondary rounded-lg border border-border-primary text-sm font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-3xl font-bold text-text-primary mb-6">Details to know</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex gap-4 p-6 bg-bg-secondary rounded-2xl border border-border-primary">
                        <Award className="w-8 h-8 text-text-primary" />
                        <div>
                          <h4 className="font-bold text-text-primary">Shareable certificate</h4>
                          <p className="text-sm text-text-secondary mt-1">Add to your LinkedIn profile or resume</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-6 bg-bg-secondary rounded-2xl border border-border-primary">
                        <Globe className="w-8 h-8 text-text-primary" />
                        <div>
                          <h4 className="font-bold text-text-primary">Taught in {course.language || "English"}</h4>
                          <p className="text-sm text-text-secondary mt-1">Subtitles available in multiple languages</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === "outcomes" && (
                <motion.div 
                  key="outcomes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <section className="bg-bg-inverted text-text-inverted p-12 rounded-[3rem] relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                      <h2 className="text-4xl font-bold tracking-tight">Prepare for a career as a {course.qualificationGranted || "Professional"}</h2>
                      <ul className="space-y-4 text-lg opacity-90">
                        <li className="flex items-center gap-3"><CheckCircle className="w-6 h-6" /> Receive professional-level training</li>
                        <li className="flex items-center gap-3"><CheckCircle className="w-6 h-6" /> Demonstrate your technical proficiency</li>
                        <li className="flex items-center gap-3"><CheckCircle className="w-6 h-6" /> Earn an employer-recognized certificate</li>
                      </ul>
                      <button 
                        onClick={() => {
                          addToast("Career path details coming soon!", "info");
                        }}
                        className="px-8 py-4 bg-bg-primary text-text-primary font-bold rounded-xl mt-4 flex items-center gap-2 group"
                      >
                        Explore this role <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
                      <Users className="w-full h-full" />
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === "courses" && (
                <motion.div 
                  key="courses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-text-primary">Professional Certificate - {course.lessons.length} course series</h2>
                    <p className="text-text-secondary font-medium">{course.estimatedTime || "Self-paced"}</p>
                  </div>
                  
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="bg-bg-secondary border border-border-primary rounded-2xl overflow-hidden group">
                        <button 
                          onClick={() => (!isEnrolled && !isInstructor && index > 0) ? null : setActiveLessonId(lesson.id)}
                          className="w-full p-6 flex items-center justify-between text-left hover:bg-bg-tertiary transition-colors"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center border border-border-secondary text-text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-text-primary group-hover:text-bg-inverted transition-colors">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{lesson.description}</p>
                              )}
                              <p className="text-sm text-text-secondary flex items-center gap-2 mt-2">
                                <Clock className="w-4 h-4" /> {lesson.duration}
                              </p>
                            </div>
                          </div>
                          {(!isEnrolled && !isInstructor && index > 0) ? (
                            <Lock className="w-5 h-5 text-text-secondary" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text-secondary" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "testimonials" && (
                <motion.div 
                  key="testimonials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <h2 className="text-3xl font-bold text-text-primary mb-8">Why people choose this course</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(course.testimonials || [
                      { name: "Alex R.", text: "This course transformed my understanding of the subject. Highly recommended!", avatarSeed: "alex", role: "Learner since 2023" },
                      { name: "Sam K.", text: "The instructors are top-notch and the content is very practical.", avatarSeed: "sam", role: "Learner since 2022" }
                    ]).map((t, i) => (
                      <div key={i} className="p-8 bg-bg-secondary rounded-3xl border border-border-primary space-y-6">
                        <div className="flex items-center gap-4">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatarSeed}`} className="w-12 h-12 rounded-full bg-bg-tertiary" alt="" />
                          <div>
                            <h4 className="font-bold text-text-primary">{t.name}</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">{t.role}</p>
                          </div>
                        </div>
                        <p className="text-text-secondary italic leading-relaxed">"{t.text}"</p>
                        {t.date && <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{t.date}</p>}
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-12 border-t border-border-primary">
                    <CommentSection comments={course.comments} courseId={course.id} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ Section */}
            <section id="faq-section" className="pt-12 border-t border-border-primary">
              <h2 className="text-3xl font-bold text-text-primary mb-8">Frequently asked questions</h2>
              <div className="space-y-4">
                {(course.faq || [
                  { question: "Who is this program for?", answer: "This program is designed for anyone looking to gain professional skills in this field." },
                  { question: "What background knowledge is necessary?", answer: "No prior experience is required, though basic familiarity with the topic is helpful." },
                  { question: "How long does it take to complete?", answer: "Most learners complete the course in 3-6 months depending on their schedule." }
                ]).map((item, i) => (
                  <div key={i} className="border border-border-primary rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full p-6 flex items-center justify-between text-left hover:bg-bg-secondary transition-colors"
                    >
                      <span className="font-bold text-text-primary">{item.question}</span>
                      {expandedFaq === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 text-text-secondary leading-relaxed">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-bg-secondary p-8 rounded-3xl border border-border-primary sticky top-32">
              <h3 className="text-xl font-bold text-text-primary mb-6">Instructors</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={course.instructor.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor.avatarSeed}`} className="w-16 h-16 rounded-2xl bg-bg-tertiary object-cover border border-border-secondary" alt="" />
                  <div>
                    <h4 className="font-bold text-text-primary">{course.instructor.name}</h4>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">{course.instructor.bio}</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {course.instructor.qualifications || "Professional educator with years of experience in the field."}
                </p>
                <button 
                  onClick={() => {
                    addToast("Instructor profiles coming soon!", "info");
                  }}
                  className="w-full py-3 text-sm font-bold text-text-primary border border-border-secondary rounded-xl hover:bg-bg-tertiary transition-all"
                >
                  View all instructors
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-border-primary">
                <h3 className="text-xl font-bold text-text-primary mb-6">Offered by</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-bg-inverted rounded-xl flex items-center justify-center text-text-inverted font-black text-xl">
                    ML
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">MasterLearn Academy</h4>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">Official Partner</p>
                  </div>
                </div>
              </div>

              {!isEnrolled && (
                <div className="mt-12 space-y-4">
                  <button 
                    onClick={() => onEnroll(course.id)}
                    className="w-full py-4 bg-bg-inverted text-text-inverted font-bold rounded-xl hover:bg-bg-inverted-hover transition-all shadow-lg shadow-bg-inverted/20"
                  >
                    Enroll Now
                  </button>
                  <p className="text-[10px] text-center text-text-secondary font-bold uppercase tracking-widest">
                    Join {course.students.toLocaleString()} other learners
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary p-8 max-w-md w-full rounded-3xl border border-border-primary shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-text-primary mb-4">Delete Course?</h3>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Are you sure you want to delete "{course.title}"? This action cannot be undone and all enrollments will be lost.
            </p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-bg-tertiary text-text-primary font-bold rounded-xl hover:bg-bg-primary transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
              >
                Delete Course
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
