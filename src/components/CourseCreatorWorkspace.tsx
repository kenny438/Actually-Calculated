import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Settings, ListVideo, Plus, Trash2, GripVertical, 
  Save, X, Image as ImageIcon, Video, HelpCircle, ChevronRight, Map, Eye, Check, Paperclip, Upload, Copy, Sparkles
} from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import '@google/model-viewer';
import { Course, Lesson, Question, UserProfile } from "../data/mockData";
import { cn } from "../lib/utils";
import { CourseDetail } from "./CourseDetail";
import { DrawingBoard } from "./DrawingBoard";

interface CourseCreatorWorkspaceProps {
  onClose: () => void;
  onSave: (course: Partial<Course>) => void;
  onDelete?: (courseId: string) => void;
  initialData?: Partial<Course>;
  userProfile: UserProfile;
}

export function CourseCreatorWorkspace({ onClose, onSave, onDelete, initialData, userProfile }: CourseCreatorWorkspaceProps) {
  const [activeMenu, setActiveMenu] = useState<"overview" | "landing" | "settings" | string>("overview");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<{lessonId: string, questionId: string} | null>(null);
  
  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: "",
    description: "",
    category: "Technology",
    level: "Beginner",
    price: 0,
    image: "",
    lessons: [],
    ...initialData
  });

  const handleSave = (status: 'published' | 'draft') => {
    onSave({ ...courseData, status });
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: "l_" + Math.random().toString(36).substr(2, 9),
      title: "New Lesson",
      duration: "10:00",
      content: "",
      questions: []
    };
    setCourseData(prev => ({
      ...prev,
      lessons: [...(prev.lessons || []), newLesson]
    }));
    setActiveMenu(newLesson.id);
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons?.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const deleteLesson = (id: string) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons?.filter(l => l.id !== id)
    }));
    if (activeMenu === id) setActiveMenu("overview");
  };

  const addQuestion = (lessonId: string) => {
    const newQuestion: Question = {
      id: "q_" + Math.random().toString(36).substr(2, 9),
      type: "multiple-choice",
      question: "New Question",
      options: ["Option 1", "Option 2"],
      correctAnswer: "Option 1"
    };
    
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons?.map(l => {
        if (l.id === lessonId) {
          return { ...l, questions: [...(l.questions || []), newQuestion] };
        }
        return l;
      })
    }));
  };

  const updateQuestion = (lessonId: string, questionId: string, updates: Partial<Question>) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons?.map(l => {
        if (l.id === lessonId) {
          return {
            ...l,
            questions: l.questions?.map(q => q.id === questionId ? { ...q, ...updates } : q)
          };
        }
        return l;
      })
    }));
  };

  const deleteQuestion = (lessonId: string, questionId: string) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons?.map(l => {
        if (l.id === lessonId) {
          return {
            ...l,
            questions: l.questions?.filter(q => q.id !== questionId)
          };
        }
        return l;
      })
    }));
  };

  const activeLesson = courseData.lessons?.find(l => l.id === activeMenu);

  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-primary overflow-y-auto pt-safe pb-safe">
        <div className="sticky top-0 z-50 bg-bg-primary border-b border-border-primary p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-primary">Preview Mode</h2>
          <button 
            onClick={() => setIsPreviewMode(false)}
            className="px-4 py-2 border border-border-secondary bg-bg-secondary text-text-primary hover:bg-bg-tertiary font-medium rounded-md transition-colors text-sm"
          >
            Exit Preview
          </button>
        </div>
        <div className="p-8">
          <CourseDetail
            course={{
              ...courseData,
              id: courseData.id || "preview-id",
              instructor: courseData.instructor || { 
                id: "preview-inst", 
                name: userProfile.username || "You", 
                avatarSeed: userProfile.avatarSeed || "you", 
                bio: userProfile.bio || "",
                qualifications: userProfile.qualifications || ""
              },
              students: 0,
              rating: 0,
              comments: [],
            } as Course}
            onBack={() => {
              setIsPreviewMode(false);
              setPreviewLessonId(null);
            }}
            onEnroll={() => {}}
            isWatchlisted={false}
            onToggleWatchlist={() => {}}
            isEnrolled={false}
            progress={0}
            isInstructor={true}
            initialLessonId={previewLessonId || undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-bg-primary flex flex-col h-screen overflow-hidden pt-safe pb-safe"
    >
      {/* Topbar */}
      <header className="h-auto md:h-16 py-3 md:py-0 bg-bg-primary border-b border-border-primary flex flex-col md:flex-row items-center justify-between px-4 md:px-6 flex-shrink-0 z-10 gap-3 md:gap-0">
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={onClose} className="p-2 hover:bg-bg-secondary hover:text-text-primary transition-colors text-text-secondary rounded-md">
              <X className="w-5 h-5" />
            </button>
            <div className="hidden md:block h-6 w-px bg-bg-tertiary" />
            <h1 className="text-base md:text-lg font-semibold text-text-primary">Course Creator</h1>
          </div>
          <span className={cn(
            "px-2 py-1 text-[10px] md:text-xs font-medium uppercase tracking-wider rounded-md",
            courseData.status === 'published' 
              ? "bg-bg-inverted text-text-inverted" 
              : "bg-bg-secondary text-text-secondary border border-border-secondary"
          )}>
            {courseData.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={() => setIsPreviewMode(true)}
            className="px-4 py-2 border border-border-secondary bg-bg-secondary text-text-primary hover:bg-bg-tertiary font-medium rounded-md transition-colors flex items-center gap-2 text-sm flex-1 md:flex-none justify-center"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button 
            onClick={() => handleSave('draft')}
            className="px-4 py-2 border border-border-secondary bg-bg-secondary text-text-primary hover:bg-bg-tertiary font-medium rounded-md transition-colors flex items-center gap-2 text-sm flex-1 md:flex-none justify-center"
          >
            {courseData.status === 'published' ? 'Unpublish' : 'Save Draft'}
          </button>
          <button 
            onClick={() => handleSave('published')}
            className="px-4 py-2 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex items-center gap-2 text-sm flex-1 md:flex-none justify-center"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{courseData.status === 'published' ? 'Save Changes' : 'Publish Course'}</span>
            <span className="sm:hidden">Publish</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-bg-primary border-b md:border-b-0 md:border-r border-border-primary flex flex-col overflow-y-auto z-10 flex-shrink-0 max-h-48 md:max-h-none">
          <div className="p-4 md:p-6 flex flex-row md:flex-col gap-2 md:space-y-2 overflow-x-auto md:overflow-visible">
            <button
              onClick={() => setActiveMenu("overview")}
              className={cn(
                "flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md",
                activeMenu === "overview" 
                  ? "bg-bg-secondary text-text-primary border border-border-secondary" 
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveMenu("map")}
              className={cn(
                "flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md",
                activeMenu === "map" 
                  ? "bg-bg-secondary text-text-primary border border-border-secondary" 
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <Map className="w-4 h-4" />
              Map
            </button>
            <button
              onClick={() => setActiveMenu("landing")}
              className={cn(
                "flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md",
                activeMenu === "landing" 
                  ? "bg-bg-secondary text-text-primary border border-border-secondary" 
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Landing Page
            </button>
            <button
              onClick={() => setActiveMenu("settings")}
              className={cn(
                "flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md",
                activeMenu === "settings" 
                  ? "bg-bg-secondary text-text-primary border border-border-secondary" 
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          <div className="px-4 md:px-6 py-2 md:py-4 border-t border-border-primary md:border-t-0">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <h3 className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">Curriculum</h3>
              <button onClick={addLesson} className="p-1 hover:bg-bg-secondary rounded-md text-text-secondary hover:text-text-primary transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-row md:flex-col gap-2 md:space-y-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {courseData.lessons?.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveMenu(lesson.id)}
                  className={cn(
                    "flex-shrink-0 w-48 md:w-full flex items-center justify-between px-3 py-2 text-xs md:text-sm font-medium transition-all rounded-md group",
                    activeMenu === lesson.id 
                      ? "bg-bg-secondary text-text-primary border border-border-secondary" 
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  )}
                >
                  <div className="flex items-center gap-2 md:gap-3 truncate">
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-medium shrink-0",
                      activeMenu === lesson.id ? "bg-bg-tertiary text-text-primary" : "bg-bg-secondary text-text-secondary"
                    )}>
                      {index + 1}
                    </div>
                    <span className="truncate">{lesson.title}</span>
                  </div>
                  <ChevronRight className={cn(
                    "w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                    activeMenu === lesson.id && "opacity-100"
                  )} />
                </button>
              ))}
              {courseData.lessons?.length === 0 && (
                <div className="text-center py-4 md:py-6 px-4 bg-bg-secondary rounded-xl border border-border-primary border-dashed flex-shrink-0 w-64 md:w-auto">
                  <div className="w-8 h-8 bg-bg-tertiary text-text-secondary rounded-md flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-text-secondary mb-2 md:mb-4">Your curriculum is empty. Start by adding your first lesson!</p>
                  <button onClick={addLesson} className="px-4 py-2 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors text-xs w-full">
                    Add First Lesson
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {activeMenu === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary mb-6">Course Overview</h2>
                      <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Course Title</label>
                          <input
                            type="text"
                            value={courseData.title}
                            onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                            placeholder="e.g. Advanced Mathematics"
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none text-text-primary placeholder-text-muted font-medium"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                          <textarea
                            value={courseData.description}
                            onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                            placeholder="What will students learn?"
                            rows={4}
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none text-text-primary placeholder-text-muted font-medium resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                            <select
                              value={courseData.category}
                              onChange={e => setCourseData({ ...courseData, category: e.target.value as any })}
                              className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none text-text-primary font-medium"
                            >
                              <option>Technology</option>
                              <option>Business</option>
                              <option>Arts</option>
                              <option>Science</option>
                              <option>Lifestyle</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Level</label>
                            <select
                              value={courseData.level}
                              onChange={e => setCourseData({ ...courseData, level: e.target.value as any })}
                              className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none text-text-primary font-medium"
                            >
                              <option>Beginner</option>
                              <option>Intermediate</option>
                              <option>Advanced</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Tags / Keywords</label>
                          <input
                            type="text"
                            value={courseData.tags?.join(", ") || ""}
                            onChange={e => setCourseData({ ...courseData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                            placeholder="e.g. React, JavaScript, Frontend (comma separated)"
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none text-text-primary placeholder-text-muted font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Cover Image</label>
                          {!courseData.image ? (
                            <div className="mt-2 flex justify-center border border-dashed border-border-secondary rounded-md px-6 py-12 hover:border-[#666] hover:bg-[#1A1A1A] transition-colors cursor-pointer group bg-bg-primary">
                              <div className="text-center">
                                <ImageIcon className="mx-auto h-10 w-10 text-text-muted group-hover:text-text-primary transition-colors" aria-hidden="true" />
                                <div className="mt-4 flex text-sm leading-6 text-text-secondary justify-center">
                                  <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer font-medium text-text-primary focus-within:outline-none hover:text-white"
                                  >
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setCourseData({ ...courseData, image: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }} />
                                  </label>
                                  <p className="pl-1 font-medium">or drag and drop</p>
                                </div>
                                <p className="text-xs leading-5 text-text-muted font-medium mt-2">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                          ) : (
                            <div className="relative mt-2 overflow-hidden rounded-md border border-border-secondary h-64 bg-bg-primary group">
                              <img src={courseData.image} alt="Preview" className="w-full h-full object-cover opacity-80" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  onClick={() => setCourseData({ ...courseData, image: "" })}
                                  className="px-4 py-2 bg-bg-secondary border border-border-secondary text-text-primary hover:bg-bg-tertiary font-medium rounded-md transition-colors text-sm"
                                >
                                  Remove Image
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="mt-4 flex gap-4">
                            <input
                              type="text"
                              value={courseData.image}
                              onChange={e => setCourseData({ ...courseData, image: e.target.value })}
                              placeholder="Or paste an image URL here..."
                              className="flex-1 px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none text-text-primary placeholder-text-muted text-sm font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary mb-6">Publishing</h2>
                      <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-6">
                        <h3 className="text-base font-semibold text-text-primary">Checklist</h3>
                        <ul className="space-y-4">
                          <li className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", courseData.title ? "bg-bg-inverted text-text-inverted" : "bg-bg-tertiary text-text-muted")}>
                              <Check className="w-3 h-3" />
                            </div>
                            <span className={cn("font-medium text-sm", courseData.title ? "text-text-primary" : "text-text-muted")}>Add a title</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", courseData.description ? "bg-bg-inverted text-text-inverted" : "bg-bg-tertiary text-text-muted")}>
                              <Check className="w-3 h-3" />
                            </div>
                            <span className={cn("font-medium text-sm", courseData.description ? "text-text-primary" : "text-text-muted")}>Add a description</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", courseData.image ? "bg-bg-inverted text-text-inverted" : "bg-bg-tertiary text-text-muted")}>
                              <Check className="w-3 h-3" />
                            </div>
                            <span className={cn("font-medium text-sm", courseData.image ? "text-text-primary" : "text-text-muted")}>Add a cover image</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", (courseData.lessons?.length || 0) > 0 ? "bg-bg-inverted text-text-inverted" : "bg-bg-tertiary text-text-muted")}>
                              <Check className="w-3 h-3" />
                            </div>
                            <span className={cn("font-medium text-sm", (courseData.lessons?.length || 0) > 0 ? "text-text-primary" : "text-text-muted")}>Add at least 1 lesson</span>
                          </li>
                        </ul>
                        
                        <div className="pt-6 border-t border-border-primary">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">Completion</span>
                            <span className="text-xs font-medium text-text-primary">{Math.round(((courseData.title ? 1 : 0) + (courseData.description ? 1 : 0) + (courseData.image ? 1 : 0) + ((courseData.lessons?.length || 0) > 0 ? 1 : 0)) / 4 * 100)}%</span>
                          </div>
                          <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-bg-inverted transition-all duration-500 rounded-full"
                              style={{ width: `${((courseData.title ? 1 : 0) + (courseData.description ? 1 : 0) + (courseData.image ? 1 : 0) + ((courseData.lessons?.length || 0) > 0 ? 1 : 0)) / 4 * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary text-text-primary">
                        <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-text-secondary" />
                          Creator Tips
                        </h3>
                        <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                          High-quality cover images and detailed descriptions increase enrollment by up to 300%.
                        </p>
                        <button 
                          onClick={() => {
                            // In a real app, this would open a modal or link to documentation
                            const toast = document.createElement('div');
                            toast.className = "fixed bottom-8 right-8 bg-bg-inverted text-text-inverted px-6 py-3 rounded-xl font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4";
                            toast.innerText = "Creator Guide coming soon!";
                            document.body.appendChild(toast);
                            setTimeout(() => {
                              toast.className += " animate-out fade-out slide-out-to-bottom-4";
                              setTimeout(() => toast.remove(), 500);
                            }, 3000);
                          }}
                          className="w-full py-2 bg-bg-tertiary text-text-primary hover:bg-[#333] font-medium rounded-md transition-colors text-sm border border-border-secondary"
                        >
                          Read Creator Guide
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeMenu === "map" && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Progression Map</h2>
                    <button 
                      onClick={addLesson}
                      className="px-4 py-2 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Lesson
                    </button>
                  </div>
                  
                  <div className="bg-bg-secondary p-8 rounded-xl border border-border-primary overflow-hidden">
                    <div className="relative py-8">
                      {/* Winding Path Line */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                        <path 
                          d="M 50,0 Q 50,100 200,100 T 350,200 T 200,300 T 50,400" 
                          fill="none" 
                          stroke="#333" 
                          strokeWidth="2"
                          className="path-line"
                        />
                      </svg>

                      <div className="relative z-10 space-y-16">
                        {courseData.lessons?.map((lesson, index) => {
                          // Alternate sides for the winding path effect
                          const isLeft = index % 2 === 0;
                          
                          return (
                            <div key={lesson.id} className={cn(
                              "flex items-center gap-6",
                              isLeft ? "flex-row" : "flex-row-reverse"
                            )}>
                              {/* Node */}
                              <div className="relative group cursor-pointer" onClick={() => setActiveMenu(lesson.id)}>
                                <div className={cn(
                                  "w-12 h-12 flex items-center justify-center rounded-full border-2 relative z-10 transition-all duration-300 group-hover:scale-105",
                                  "bg-bg-secondary border-[#EDEDED] text-text-primary"
                                )}>
                                  <span className="text-base font-semibold">{index + 1}</span>
                                </div>
                              </div>

                              {/* Content Card */}
                              <div 
                                className={cn(
                                  "flex-1 max-w-sm bg-bg-primary p-4 rounded-md border border-border-secondary cursor-pointer hover:border-[#666] transition-all group",
                                  isLeft ? "text-left" : "text-right"
                                )}
                                onClick={() => setActiveMenu(lesson.id)}
                              >
                                <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-white transition-colors">
                                  {lesson.title}
                                </h3>
                                <div className={cn(
                                  "flex items-center gap-4 text-xs font-medium text-text-secondary",
                                  isLeft ? "justify-start" : "justify-end"
                                )}>
                                  <span className="flex items-center gap-1">
                                    <ListVideo className="w-3 h-3" />
                                    {lesson.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="w-3 h-3" />
                                    {lesson.questions?.length || 0} Questions
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {courseData.lessons?.length === 0 && (
                          <div className="text-center py-16 px-4 bg-bg-primary rounded-xl border border-border-secondary border-dashed relative z-10">
                            <div className="w-12 h-12 bg-bg-secondary text-text-muted rounded-md flex items-center justify-center mx-auto mb-4 border border-border-primary">
                              <Map className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Your Map is Empty</h3>
                            <p className="text-sm text-text-secondary font-medium max-w-md mx-auto mb-6">Add lessons to your curriculum to see them appear on the progression map.</p>
                            <button onClick={addLesson} className="px-4 py-2 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors text-sm">
                              Add First Lesson
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeMenu === "landing" && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-bg-secondary text-text-primary rounded-full flex items-center justify-center border border-border-primary">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary">Landing Page Design</h2>
                      <p className="text-text-secondary font-medium text-sm">Customize how your course appears to potential students</p>
                    </div>
                  </div>

                  <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-8">
                    {/* Outcomes */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-text-primary">What you'll learn (Outcomes)</h3>
                        <button 
                          onClick={() => setCourseData(prev => ({ ...prev, outcomes: [...(prev.outcomes || []), ""] }))}
                          className="text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Outcome
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(courseData.outcomes || []).map((outcome, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={outcome}
                              onChange={e => {
                                const next = [...(courseData.outcomes || [])];
                                next[i] = e.target.value;
                                setCourseData({ ...courseData, outcomes: next });
                              }}
                              placeholder="e.g. Master React 19's new features"
                              className="flex-1 px-4 py-2 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] outline-none text-sm"
                            />
                            <button 
                              onClick={() => setCourseData(prev => ({ ...prev, outcomes: prev.outcomes?.filter((_, idx) => idx !== i) }))}
                              className="p-2 text-text-secondary hover:text-rose-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Skills you'll gain (Comma separated)</label>
                      <input
                        type="text"
                        value={courseData.skills?.join(", ") || ""}
                        onChange={e => setCourseData({ ...courseData, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                        placeholder="e.g. React, Next.js, TypeScript"
                        className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] outline-none text-sm"
                      />
                    </div>

                    {/* Tools */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Tools you'll learn (Comma separated)</label>
                      <input
                        type="text"
                        value={courseData.tools?.join(", ") || ""}
                        onChange={e => setCourseData({ ...courseData, tools: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                        placeholder="e.g. VS Code, Chrome DevTools"
                        className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] outline-none text-sm"
                      />
                    </div>

                    {/* FAQ */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-text-primary">Frequently Asked Questions</h3>
                        <button 
                          onClick={() => setCourseData(prev => ({ ...prev, faq: [...(prev.faq || []), { question: "", answer: "" }] }))}
                          className="text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add FAQ
                        </button>
                      </div>
                      <div className="space-y-4">
                        {(courseData.faq || []).map((item, i) => (
                          <div key={i} className="p-4 bg-bg-primary border border-border-secondary rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                              <input
                                type="text"
                                value={item.question}
                                onChange={e => {
                                  const next = [...(courseData.faq || [])];
                                  next[i] = { ...next[i], question: e.target.value };
                                  setCourseData({ ...courseData, faq: next });
                                }}
                                placeholder="Question"
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-text-primary p-0"
                              />
                              <button 
                                onClick={() => setCourseData(prev => ({ ...prev, faq: prev.faq?.filter((_, idx) => idx !== i) }))}
                                className="p-1 text-text-secondary hover:text-rose-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <textarea
                              value={item.answer}
                              onChange={e => {
                                const next = [...(courseData.faq || [])];
                                next[i] = { ...next[i], answer: e.target.value };
                                setCourseData({ ...courseData, faq: next });
                              }}
                              placeholder="Answer"
                              rows={2}
                              className="w-full bg-transparent border-none focus:ring-0 text-sm text-text-secondary p-0 resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeMenu === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-bg-secondary text-text-primary rounded-full flex items-center justify-center border border-border-primary">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary">Course Settings</h2>
                      <p className="text-text-secondary font-medium text-sm">Configure pricing, visibility, and other options</p>
                    </div>
                  </div>

                  <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border-primary">
                          <div className="w-8 h-8 bg-bg-tertiary text-text-primary rounded-full flex items-center justify-center border border-border-secondary">
                            <span className="font-semibold text-sm">$</span>
                          </div>
                          <h3 className="text-base font-semibold text-text-primary">Pricing & Access</h3>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Price (Tokens)</label>
                          <input
                            type="number"
                            value={courseData.price}
                            onChange={e => setCourseData({ ...courseData, price: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary"
                          />
                          <p className="text-xs font-medium text-text-secondary mt-2">Set to 0 to make the course free.</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Visibility</label>
                          <select
                            value={courseData.visibility || 'public'}
                            onChange={e => setCourseData({ ...courseData, visibility: e.target.value as 'public' | 'unlisted' | 'private' })}
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary"
                          >
                            <option value="public">Public (Marketplace)</option>
                            <option value="unlisted">Unlisted (Link Only)</option>
                            <option value="private">Private (Only Me)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border-primary">
                          <div className="w-8 h-8 bg-bg-tertiary text-text-primary rounded-full flex items-center justify-center border border-border-secondary">
                            <Map className="w-4 h-4" />
                          </div>
                          <h3 className="text-base font-semibold text-text-primary">Display & Format</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">UI Style</label>
                          <select
                            value={courseData.uiStyle || 'standard'}
                            onChange={e => setCourseData({ ...courseData, uiStyle: e.target.value as 'standard' | 'progression-map' })}
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary"
                          >
                            <option value="standard">Standard List</option>
                            <option value="progression-map">Progression Map / Level Map</option>
                          </select>
                          <p className="text-xs font-medium text-text-secondary mt-2">Choose how the lessons are displayed to students.</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Language</label>
                          <select
                            value={courseData.language || 'English'}
                            onChange={e => setCourseData({ ...courseData, language: e.target.value })}
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary"
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Japanese">Japanese</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border-primary">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Estimated Total Time</label>
                            <input
                              type="text"
                              value={courseData.estimatedTime || ""}
                              onChange={e => setCourseData({ ...courseData, estimatedTime: e.target.value })}
                              placeholder="e.g. 4 hours 30 mins"
                              className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Welcome Message</label>
                            <textarea
                              value={courseData.welcomeMessage || ""}
                              onChange={e => setCourseData({ ...courseData, welcomeMessage: e.target.value })}
                              placeholder="Message shown to students when they enroll..."
                              rows={3}
                              className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary resize-y"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Congratulations Message</label>
                            <textarea
                              value={courseData.congratulationsMessage || ""}
                              onChange={e => setCourseData({ ...courseData, congratulationsMessage: e.target.value })}
                              placeholder="Message shown to students when they complete the course..."
                              rows={3}
                              className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary resize-y"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col justify-start">
                          <label className="block text-sm font-medium text-text-primary mb-2">Certification & Qualifications</label>
                          <div className="flex flex-col gap-4 p-4 bg-bg-primary border border-border-secondary rounded-md">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                id="certificate"
                                checked={courseData.certificate || false}
                                onChange={e => setCourseData({ ...courseData, certificate: e.target.checked })}
                                className="w-5 h-5 text-text-primary border border-border-secondary rounded focus:ring-[#EDEDED] bg-bg-secondary"
                              />
                              <label htmlFor="certificate" className="text-sm font-medium text-text-primary cursor-pointer select-none">
                                Offer Certificate of Completion
                              </label>
                            </div>
                            {courseData.certificate && (
                              <div className="mt-2 space-y-4">
                                <div>
                                  <label className="block text-xs font-medium text-text-secondary mb-1">Certificate Name</label>
                                  <input
                                    type="text"
                                    value={courseData.certificateName || ""}
                                    onChange={e => setCourseData({ ...courseData, certificateName: e.target.value })}
                                    placeholder="e.g. React Master Developer"
                                    className="w-full px-4 py-2.5 bg-bg-secondary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-text-secondary mb-1">Qualification Granted (Optional)</label>
                                  <input
                                    type="text"
                                    value={courseData.qualificationGranted || ""}
                                    onChange={e => setCourseData({ ...courseData, qualificationGranted: e.target.value })}
                                    placeholder="e.g. Certified React Specialist"
                                    className="w-full px-4 py-2.5 bg-bg-secondary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary text-sm"
                                  />
                                  <p className="text-xs font-medium text-text-secondary mt-1">This will be added to the student's profile upon completion.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {onDelete && courseData.id && (
                      <div className="mt-8 pt-8 border-t border-border-primary">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20">
                            <Trash2 className="w-4 h-4" />
                          </div>
                          <h3 className="text-base font-semibold text-red-500">Danger Zone</h3>
                        </div>
                        <p className="text-text-secondary font-medium mb-6 text-sm">Once you delete a course, there is no going back. Please be certain.</p>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium rounded-md transition-colors flex items-center gap-2 text-sm border border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Course
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeLesson && (
                <motion.div
                  key={activeLesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-bg-secondary text-text-primary rounded-full flex items-center justify-center flex-shrink-0 border border-border-primary">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-text-primary">Edit Lesson</h2>
                        <p className="text-sm text-text-secondary font-medium">Configure content and interactive elements</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-full border border-border-primary">
                        <button 
                          onClick={() => {
                            const idx = courseData.lessons?.findIndex(l => l.id === activeLesson.id) ?? -1;
                            if (idx > 0) {
                              const newLessons = [...(courseData.lessons || [])];
                              const temp = newLessons[idx];
                              newLessons[idx] = newLessons[idx - 1];
                              newLessons[idx - 1] = temp;
                              setCourseData({ ...courseData, lessons: newLessons });
                            }
                          }}
                          disabled={courseData.lessons?.findIndex(l => l.id === activeLesson.id) === 0}
                          className="p-1.5 text-text-primary hover:bg-bg-tertiary hover:text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text-primary"
                          title="Move Up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button 
                          onClick={() => {
                            const idx = courseData.lessons?.findIndex(l => l.id === activeLesson.id) ?? -1;
                            if (idx < (courseData.lessons?.length || 0) - 1) {
                              const newLessons = [...(courseData.lessons || [])];
                              const temp = newLessons[idx];
                              newLessons[idx] = newLessons[idx + 1];
                              newLessons[idx + 1] = temp;
                              setCourseData({ ...courseData, lessons: newLessons });
                            }
                          }}
                          disabled={courseData.lessons?.findIndex(l => l.id === activeLesson.id) === (courseData.lessons?.length || 0) - 1}
                          className="p-1.5 text-text-primary hover:bg-bg-tertiary hover:text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text-primary"
                          title="Move Down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          setPreviewLessonId(activeLesson.id);
                          setIsPreviewMode(true);
                        }}
                        className="p-2 text-text-primary bg-bg-secondary hover:bg-bg-tertiary rounded-full transition-colors border border-border-primary"
                        title="Preview Lesson"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const newLesson = { ...activeLesson, id: "l_" + Math.random().toString(36).substr(2, 9), title: activeLesson.title + " (Copy)" };
                          const idx = courseData.lessons?.findIndex(l => l.id === activeLesson.id) ?? -1;
                          if (idx !== -1) {
                            const newLessons = [...(courseData.lessons || [])];
                            newLessons.splice(idx + 1, 0, newLesson);
                            setCourseData({ ...courseData, lessons: newLessons });
                            setActiveMenu(newLesson.id);
                          }
                        }}
                        className="p-2 text-text-primary bg-bg-secondary hover:bg-bg-tertiary rounded-full transition-colors border border-border-primary"
                        title="Duplicate Lesson"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setLessonToDelete(activeLesson.id)}
                        className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors border border-red-500/20"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-6">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-primary">
                          <div className="w-8 h-8 bg-bg-tertiary text-text-primary rounded-full flex items-center justify-center border border-border-secondary">
                            <Settings className="w-4 h-4" />
                          </div>
                          <h3 className="text-base font-semibold text-text-primary">Basic Details</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Lesson Title</label>
                          <input
                            type="text"
                            value={activeLesson.title}
                            onChange={e => updateLesson(activeLesson.id, { title: e.target.value })}
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary"
                            placeholder="e.g. Introduction to React"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Short Description</label>
                          <textarea
                            value={activeLesson.description || ""}
                            onChange={e => updateLesson(activeLesson.id, { description: e.target.value })}
                            placeholder="Briefly describe what this lesson covers..."
                            rows={2}
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Duration</label>
                            <input
                              type="text"
                              value={activeLesson.duration}
                              onChange={e => updateLesson(activeLesson.id, { duration: e.target.value })}
                              placeholder="e.g. 10:00"
                              className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Video URL (Optional)</label>
                            <input
                              type="text"
                              value={activeLesson.videoUrl || ""}
                              onChange={e => updateLesson(activeLesson.id, { videoUrl: e.target.value })}
                              placeholder="https://youtube.com/..."
                              className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-6">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-primary">
                          <div className="w-8 h-8 bg-bg-tertiary text-text-primary rounded-full flex items-center justify-center border border-border-secondary">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <h3 className="text-base font-semibold text-text-primary">Lesson Content</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Content (Markdown)</label>
                          <div data-color-mode="light" className="rounded-md overflow-hidden border border-border-secondary">
                            <MDEditor
                              value={activeLesson.content}
                              onChange={(val) => {
                                let newValue = val || '';
                                // Handle slash commands
                                if (newValue.match(/(^|\n|\s)\/3d$/)) {
                                  newValue = newValue.replace(/\/3d$/, '\n```3d-model\nhttps://example.com/model.glb\n```\n');
                                } else if (newValue.match(/(^|\n|\s)\/math$/)) {
                                  newValue = newValue.replace(/\/math$/, '\n```math\nE = mc^2\n```\n');
                                }
                                updateLesson(activeLesson.id, { content: newValue });
                              }}
                              preview="edit"
                              height={400}
                              className="w-full bg-bg-primary border-none focus-within:ring-0 transition-all font-sans text-sm"
                              previewOptions={{
                                components: {
                                  code: ({ inline, className, children, ...props }: any) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    if (!inline && match && match[1] === '3d-model') {
                                      return (
                                        <div className="w-full h-64 bg-bg-tertiary relative overflow-hidden my-4 rounded-md border border-border-secondary">
                                          {/* @ts-ignore */}
                                          <model-viewer src={String(children).trim()} auto-rotate camera-controls style={{ width: '100%', height: '100%' }}></model-viewer>
                                        </div>
                                      );
                                    }
                                    if (!inline && match && match[1] === 'math') {
                                      return (
                                        <div className="p-4 bg-bg-tertiary overflow-x-auto my-4 rounded-md border border-border-secondary">
                                          <BlockMath math={String(children).trim()} />
                                        </div>
                                      );
                                    }
                                    return <code className={className} {...props}>{children}</code>;
                                  }
                                }
                              }}
                            />
                            <div className="flex items-center justify-between p-2 bg-bg-secondary border-t border-border-secondary">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-text-secondary">Tip: Type <code className="bg-bg-tertiary px-1 rounded text-text-primary">/3d</code> or <code className="bg-bg-tertiary px-1 rounded text-text-primary">/math</code></p>
                                <button 
                                  onClick={() => {
                                    updateLesson(activeLesson.id, { content: (activeLesson.content || '') + '\n```math\nE = mc^2\n```\n' });
                                  }}
                                  className="text-xs font-medium text-text-primary hover:text-white bg-bg-tertiary px-2 py-1 rounded border border-border-secondary transition-colors"
                                >
                                  + Math Eq
                                </button>
                              </div>
                              <label className="cursor-pointer flex items-center gap-1 text-xs font-medium text-text-primary hover:text-white bg-bg-tertiary px-3 py-1.5 rounded-md border border-border-secondary transition-colors">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Upload Image
                                <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const imgMarkdown = `\n![Image](${reader.result})\n`;
                                      updateLesson(activeLesson.id, { content: (activeLesson.content || '') + imgMarkdown });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Mindmap (Mermaid Syntax)</label>
                          <textarea
                            value={activeLesson.mindmap || ""}
                            onChange={e => updateLesson(activeLesson.id, { mindmap: e.target.value })}
                            placeholder="e.g. mindmap\n  Root\n    Child 1\n    Child 2"
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-mono text-text-primary text-sm h-32"
                          />
                          <p className="text-xs font-medium text-text-secondary mt-2">Use Mermaid.js syntax to create a mindmap for your students.</p>
                        </div>

                        {/* Interactives Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-text-primary">Interactives & Diagrams</label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const newInteractives = [...(activeLesson.interactives || []), { id: Date.now().toString(), type: 'drawing', title: 'New Diagram' } as any];
                                  updateLesson(activeLesson.id, { interactives: newInteractives });
                                }}
                                className="px-3 py-1.5 bg-bg-tertiary text-text-primary hover:bg-[#333] font-medium rounded-md transition-colors flex items-center gap-2 text-xs border border-border-secondary"
                              >
                                <Plus className="w-3 h-3" /> Add Diagram
                              </button>
                              <button 
                                onClick={() => {
                                  const newInteractives = [...(activeLesson.interactives || []), { id: Date.now().toString(), type: 'embed', title: 'New Interactive Embed', url: '' } as any];
                                  updateLesson(activeLesson.id, { interactives: newInteractives });
                                }}
                                className="px-3 py-1.5 bg-bg-tertiary text-text-primary hover:bg-[#333] font-medium rounded-md transition-colors flex items-center gap-2 text-xs border border-border-secondary"
                              >
                                <Plus className="w-3 h-3" /> Add Embed
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {activeLesson.interactives?.map((interactive, idx) => (
                              <div key={interactive.id} className="bg-bg-primary border border-border-secondary rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between p-3 border-b border-border-secondary bg-bg-secondary">
                                  <input 
                                    type="text" 
                                    value={interactive.title}
                                    onChange={(e) => {
                                      const newInteractives = [...(activeLesson.interactives || [])];
                                      newInteractives[idx].title = e.target.value;
                                      updateLesson(activeLesson.id, { interactives: newInteractives });
                                    }}
                                    className="bg-transparent border-none text-sm font-medium text-text-primary focus:ring-0 outline-none w-1/2"
                                    placeholder="Interactive Title"
                                  />
                                  <button 
                                    onClick={() => {
                                      const newInteractives = activeLesson.interactives?.filter(i => i.id !== interactive.id);
                                      updateLesson(activeLesson.id, { interactives: newInteractives });
                                    }}
                                    className="text-text-secondary hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="p-4">
                                  {interactive.type === 'drawing' ? (
                                    <div className="h-[400px]">
                                      <DrawingBoard 
                                        initialData={interactive.data} 
                                        onChange={(data) => {
                                          const newInteractives = [...(activeLesson.interactives || [])];
                                          newInteractives[idx].data = data;
                                          updateLesson(activeLesson.id, { interactives: newInteractives });
                                        }} 
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <input 
                                        type="text" 
                                        value={interactive.url || ''}
                                        onChange={(e) => {
                                          const newInteractives = [...(activeLesson.interactives || [])];
                                          newInteractives[idx].url = e.target.value;
                                          updateLesson(activeLesson.id, { interactives: newInteractives });
                                        }}
                                        placeholder="Enter embed URL (e.g., PhET simulation, GeoGebra, YouTube)"
                                        className="w-full px-4 py-2 bg-bg-secondary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary text-sm mb-2"
                                      />
                                      {interactive.url && (
                                        <div className="aspect-video rounded-lg overflow-hidden border border-border-secondary bg-bg-secondary">
                                          <iframe src={interactive.url} className="w-full h-full border-0" allowFullScreen />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Tutor Notes</label>
                          <div data-color-mode="light" className="rounded-md overflow-hidden border border-border-secondary">
                            <MDEditor
                              value={activeLesson.tutorNotes || ""}
                              onChange={(val) => updateLesson(activeLesson.id, { tutorNotes: val || '' })}
                              preview="edit"
                              height={200}
                              className="w-full bg-bg-primary border-none focus-within:ring-0 transition-all font-sans text-sm"
                            />
                            <p className="text-xs font-medium text-text-secondary mt-2 p-2">Add extra notes, tips, or summaries for your students.</p>
                          </div>
                        </div>
                      </div>

                      {/* Resources Section */}
                      <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-6">
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border-primary">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-bg-tertiary text-text-primary rounded-full flex items-center justify-center border border-border-secondary">
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-semibold text-text-primary">Resources & Attachments</h3>
                          </div>
                          <button 
                            onClick={() => {
                              const newResources = [...(activeLesson.resources || []), { title: 'New Resource', url: '' }];
                              updateLesson(activeLesson.id, { resources: newResources });
                            }}
                            className="px-4 py-2 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex items-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Resource
                          </button>
                        </div>

                        {(!activeLesson.resources || activeLesson.resources.length === 0) && (
                          <div className="text-center py-8 px-4 bg-bg-primary rounded-xl border border-border-secondary border-dashed">
                            <p className="text-text-secondary font-medium text-sm">No resources added yet. Add links or files for your students to download.</p>
                          </div>
                        )}

                        {activeLesson.resources?.map((res, rIndex) => (
                          <div key={rIndex} className="flex items-center gap-4 bg-bg-primary p-4 rounded-md border border-border-secondary">
                            <div className="flex-1 space-y-3">
                              <input
                                type="text"
                                value={res.title}
                                onChange={e => {
                                  const newResources = [...(activeLesson.resources || [])];
                                  newResources[rIndex].title = e.target.value;
                                  updateLesson(activeLesson.id, { resources: newResources });
                                }}
                                placeholder="Resource Title (e.g. Cheat Sheet PDF)"
                                className="w-full px-4 py-2 bg-bg-secondary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary text-sm"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={res.url}
                                  onChange={e => {
                                    const newResources = [...(activeLesson.resources || [])];
                                    newResources[rIndex].url = e.target.value;
                                    updateLesson(activeLesson.id, { resources: newResources });
                                  }}
                                  placeholder="URL or upload a file ->"
                                  className="flex-1 px-4 py-2 bg-bg-secondary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-medium text-text-primary text-sm"
                                />
                                <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-bg-tertiary hover:bg-[#333] border border-border-secondary rounded-md transition-colors text-sm font-medium text-text-primary">
                                  <Upload className="w-4 h-4" />
                                  <input type="file" className="sr-only" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const newResources = [...(activeLesson.resources || [])];
                                        newResources[rIndex].url = reader.result as string;
                                        if (newResources[rIndex].title === 'New Resource') {
                                          newResources[rIndex].title = file.name;
                                        }
                                        updateLesson(activeLesson.id, { resources: newResources });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} />
                                </label>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const newResources = activeLesson.resources?.filter((_, i) => i !== rIndex);
                                updateLesson(activeLesson.id, { resources: newResources });
                              }}
                              className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Questions Section */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-bg-secondary text-text-primary rounded-full flex items-center justify-center border border-border-primary">
                              <HelpCircle className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-semibold text-text-primary">Interactive Questions</h3>
                          </div>
                          <button 
                            onClick={() => addQuestion(activeLesson.id)}
                            className="px-4 py-2 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors flex items-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Question
                          </button>
                        </div>

                        {activeLesson.questions?.length === 0 && (
                          <div className="text-center py-12 px-4 bg-bg-primary rounded-xl border border-border-secondary border-dashed">
                            <div className="w-12 h-12 bg-bg-secondary text-text-muted rounded-md flex items-center justify-center mx-auto mb-4 border border-border-primary">
                              <HelpCircle className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-semibold text-text-primary mb-2">No questions yet</h4>
                            <p className="text-text-secondary font-medium max-w-sm mx-auto mb-6 text-sm">Add interactive questions to test your students' knowledge and keep them engaged.</p>
                            <button onClick={() => addQuestion(activeLesson.id)} className="px-4 py-2 bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover font-medium rounded-md transition-colors text-sm">
                              Create First Question
                            </button>
                          </div>
                        )}

                    {activeLesson.questions?.map((q, qIndex) => (
                      <div key={q.id} className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-6 relative group">
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              if (qIndex > 0) {
                                const newQuestions = [...(activeLesson.questions || [])];
                                const temp = newQuestions[qIndex];
                                newQuestions[qIndex] = newQuestions[qIndex - 1];
                                newQuestions[qIndex - 1] = temp;
                                updateLesson(activeLesson.id, { questions: newQuestions });
                              }
                            }}
                            disabled={qIndex === 0}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                            title="Move Up"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          </button>
                          <button 
                            onClick={() => {
                              if (qIndex < (activeLesson.questions?.length || 0) - 1) {
                                const newQuestions = [...(activeLesson.questions || [])];
                                const temp = newQuestions[qIndex];
                                newQuestions[qIndex] = newQuestions[qIndex + 1];
                                newQuestions[qIndex + 1] = temp;
                                updateLesson(activeLesson.id, { questions: newQuestions });
                              }
                            }}
                            disabled={qIndex === (activeLesson.questions?.length || 0) - 1}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                            title="Move Down"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          <button 
                            onClick={() => {
                              const newQuestion = { ...q, id: "q_" + Math.random().toString(36).substr(2, 9) };
                              const newQuestions = [...(activeLesson.questions || [])];
                              newQuestions.splice(qIndex + 1, 0, newQuestion);
                              updateLesson(activeLesson.id, { questions: newQuestions });
                            }}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
                            title="Duplicate Question"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setQuestionToDelete({ lessonId: activeLesson.id, questionId: q.id })}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-8 h-8 bg-bg-tertiary text-text-primary rounded-full flex items-center justify-center font-semibold text-sm border border-border-secondary">
                            {qIndex + 1}
                          </div>
                          <select
                            value={q.type}
                            onChange={e => {
                              const newType = e.target.value as any;
                              let updates: Partial<Question> = { type: newType };
                              if (newType === 'multiple-choice' || newType === 'poll') {
                                updates.options = q.options && q.options.length > 0 ? q.options : ['Option 1', 'Option 2'];
                                if (newType === 'multiple-choice' && !updates.options.includes(q.correctAnswer || '')) {
                                  updates.correctAnswer = updates.options[0];
                                }
                              } else if (newType === 'true-false') {
                                updates.correctAnswer = ['True', 'False'].includes(q.correctAnswer || '') ? q.correctAnswer : 'True';
                              } else if (newType === 'flashcard') {
                                updates.front = q.front || 'Term';
                                updates.back = q.back || 'Definition';
                              } else if (newType === 'checklist') {
                                updates.items = q.items && q.items.length > 0 ? q.items : ['Item 1', 'Item 2'];
                              }
                              updateQuestion(activeLesson.id, q.id, updates);
                            }}
                            className="px-4 py-2 bg-bg-primary border border-border-secondary rounded-md text-sm font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] appearance-none"
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="text">Text Input</option>
                            <option value="true-false">True / False</option>
                            <option value="flashcard">Flashcard</option>
                            <option value="checklist">Checklist</option>
                            <option value="poll">Poll</option>
                          </select>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={q.question}
                            onChange={e => updateQuestion(activeLesson.id, q.id, { question: e.target.value })}
                            placeholder={q.type === 'flashcard' ? "Flashcard Title (Optional)" : q.type === 'checklist' ? "Checklist Title" : "Enter your question..."}
                            className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-all outline-none font-semibold text-lg text-text-primary"
                          />
                        </div>

                        {q.type === 'multiple-choice' && (
                          <div className="space-y-4 pl-12">
                            {q.options?.map((opt, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-4">
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`}
                                  checked={q.correctAnswer === opt}
                                  onChange={() => updateQuestion(activeLesson.id, q.id, { correctAnswer: opt })}
                                  className="w-5 h-5 text-text-primary border border-border-secondary focus:ring-[#EDEDED] cursor-pointer bg-bg-secondary"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={e => {
                                    const newOptions = [...(q.options || [])];
                                    newOptions[oIndex] = e.target.value;
                                    // Update correct answer if it was this option
                                    const newCorrect = q.correctAnswer === opt ? e.target.value : q.correctAnswer;
                                    updateQuestion(activeLesson.id, q.id, { options: newOptions, correctAnswer: newCorrect });
                                  }}
                                  className="flex-1 px-4 py-2 bg-bg-primary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-colors text-sm font-medium text-text-primary"
                                />
                                <button 
                                  onClick={() => {
                                    const newOptions = q.options?.filter((_, i) => i !== oIndex);
                                    updateQuestion(activeLesson.id, q.id, { options: newOptions });
                                  }}
                                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newOptions = [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`];
                                updateQuestion(activeLesson.id, q.id, { options: newOptions });
                              }}
                              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors ml-9"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}
                        
                        {q.type === 'text' && (
                          <div className="pl-12">
                            <label className="block text-sm font-medium text-text-primary mb-2">Correct Answer (Exact match)</label>
                            <input
                              type="text"
                              value={q.correctAnswer || ""}
                              onChange={e => updateQuestion(activeLesson.id, q.id, { correctAnswer: e.target.value })}
                              placeholder="Enter the correct answer..."
                              className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-colors text-sm font-medium text-text-primary"
                            />
                          </div>
                        )}

                        {q.type === 'true-false' && (
                          <div className="space-y-4 pl-12">
                            {['True', 'False'].map((opt) => (
                              <div key={opt} className="flex items-center gap-4">
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`}
                                  checked={q.correctAnswer === opt}
                                  onChange={() => updateQuestion(activeLesson.id, q.id, { correctAnswer: opt })}
                                  className="w-5 h-5 text-text-primary border border-border-secondary focus:ring-[#EDEDED] cursor-pointer bg-bg-secondary"
                                />
                                <span className="text-base font-semibold text-text-primary">{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'flashcard' && (
                          <div className="space-y-6 pl-12">
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">Front (Term)</label>
                              <input
                                type="text"
                                value={q.front || ""}
                                onChange={e => updateQuestion(activeLesson.id, q.id, { front: e.target.value })}
                                placeholder="Enter the term..."
                                className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-colors text-sm font-medium text-text-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">Back (Definition)</label>
                              <textarea
                                value={q.back || ""}
                                onChange={e => updateQuestion(activeLesson.id, q.id, { back: e.target.value })}
                                placeholder="Enter the definition..."
                                rows={3}
                                className="w-full px-4 py-3 bg-bg-primary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-colors text-sm font-medium resize-y text-text-primary"
                              />
                            </div>
                          </div>
                        )}

                        {q.type === 'checklist' && (
                          <div className="space-y-4 pl-12">
                            {q.items?.map((item, iIndex) => (
                              <div key={iIndex} className="flex items-center gap-4">
                                <div className="w-5 h-5 border border-border-secondary rounded flex-shrink-0 bg-bg-secondary" />
                                <input
                                  type="text"
                                  value={item}
                                  onChange={e => {
                                    const newItems = [...(q.items || [])];
                                    newItems[iIndex] = e.target.value;
                                    updateQuestion(activeLesson.id, q.id, { items: newItems });
                                  }}
                                  placeholder="Checklist item..."
                                  className="flex-1 px-4 py-2 bg-bg-primary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-colors text-sm font-medium text-text-primary"
                                />
                                <button 
                                  onClick={() => {
                                    const newItems = q.items?.filter((_, i) => i !== iIndex);
                                    updateQuestion(activeLesson.id, q.id, { items: newItems });
                                  }}
                                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newItems = [...(q.items || []), "New Item"];
                                updateQuestion(activeLesson.id, q.id, { items: newItems });
                              }}
                              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors ml-9"
                            >
                              + Add Item
                            </button>
                          </div>
                        )}

                        {q.type === 'poll' && (
                          <div className="space-y-4 pl-12">
                            {q.options?.map((opt, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-4">
                                <div className="w-5 h-5 rounded-full border border-border-secondary flex-shrink-0 bg-bg-secondary" />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={e => {
                                    const newOptions = [...(q.options || [])];
                                    newOptions[oIndex] = e.target.value;
                                    updateQuestion(activeLesson.id, q.id, { options: newOptions });
                                  }}
                                  placeholder={`Poll Option ${oIndex + 1}`}
                                  className="flex-1 px-4 py-2 bg-bg-primary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] transition-colors text-sm font-medium text-text-primary"
                                />
                                <button 
                                  onClick={() => {
                                    const newOptions = q.options?.filter((_, i) => i !== oIndex);
                                    updateQuestion(activeLesson.id, q.id, { options: newOptions });
                                  }}
                                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newOptions = [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`];
                                updateQuestion(activeLesson.id, q.id, { options: newOptions });
                              }}
                              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors ml-9"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar for Lesson */}
                <div className="space-y-6">
                  <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary space-y-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-primary">
                      <div className="w-8 h-8 bg-bg-tertiary text-text-primary rounded-full flex items-center justify-center border border-border-secondary">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-semibold text-text-primary">Resources</h3>
                    </div>

                    <div className="space-y-4">
                      {activeLesson.resources?.map((res, rIndex) => (
                        <div key={rIndex} className="bg-bg-primary p-4 rounded-md border border-border-secondary space-y-3 relative group">
                          <button 
                            onClick={() => {
                              const newResources = activeLesson.resources?.filter((_, i) => i !== rIndex);
                              updateLesson(activeLesson.id, { resources: newResources });
                            }}
                            className="absolute top-2 right-2 p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
                            <input
                              type="text"
                              value={res.title}
                              onChange={e => {
                                const newResources = [...(activeLesson.resources || [])];
                                newResources[rIndex].title = e.target.value;
                                updateLesson(activeLesson.id, { resources: newResources });
                              }}
                              placeholder="e.g. Cheat Sheet PDF"
                              className="w-full px-3 py-2 bg-bg-secondary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] font-medium text-sm text-text-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">URL</label>
                            <input
                              type="text"
                              value={res.url}
                              onChange={e => {
                                const newResources = [...(activeLesson.resources || [])];
                                newResources[rIndex].url = e.target.value;
                                updateLesson(activeLesson.id, { resources: newResources });
                              }}
                              placeholder="https://..."
                              className="w-full px-3 py-2 bg-bg-secondary border border-border-secondary rounded-md focus:outline-none focus:ring-1 focus:ring-[#EDEDED] focus:border-[#EDEDED] font-medium text-sm text-text-primary"
                            />
                          </div>
                        </div>
                      ))}

                      <button 
                        onClick={() => {
                          const newResources = [...(activeLesson.resources || []), { title: 'New Resource', url: '' }];
                          updateLesson(activeLesson.id, { resources: newResources });
                        }}
                        className="w-full py-2 bg-bg-primary border border-border-secondary text-text-primary font-medium rounded-md hover:bg-bg-tertiary transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Resource
                      </button>
                    </div>
                  </div>

                  <div className="bg-bg-tertiary p-6 text-text-primary rounded-xl border border-border-secondary">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-bg-secondary text-text-primary rounded-full flex items-center justify-center border border-border-secondary">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-semibold">Lesson Tips</h3>
                    </div>
                    <ul className="space-y-3 text-sm font-medium text-text-secondary">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-text-primary flex-shrink-0" />
                        Keep videos under 10 minutes for better retention.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-text-primary flex-shrink-0" />
                        Use Markdown to format your text with headings and bold text.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-text-primary flex-shrink-0" />
                        Add at least one interactive question to test knowledge.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-text-primary flex-shrink-0" />
                        Teaching STEM? Use the "Math Equation" and "3D Model" interactive blocks!
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary p-8 max-w-md w-full rounded-xl shadow-2xl border border-border-primary"
          >
            <h3 className="text-xl font-semibold text-text-primary mb-4">Delete Course?</h3>
            <p className="text-text-secondary font-medium mb-8 text-sm">
              Are you sure you want to delete "{courseData.title || 'this course'}"? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-bg-primary border border-border-secondary text-text-primary font-medium rounded-md hover:bg-bg-tertiary transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (courseData.id) onDelete(courseData.id);
                }}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Yes, Delete Course
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary p-8 max-w-md w-full rounded-xl shadow-2xl border border-border-primary"
          >
            <h3 className="text-xl font-semibold text-text-primary mb-4">Delete Lesson?</h3>
            <p className="text-text-secondary font-medium mb-8 text-sm">
              Are you sure you want to delete this lesson? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setLessonToDelete(null)}
                className="px-4 py-2 bg-bg-primary border border-border-secondary text-text-primary font-medium rounded-md hover:bg-bg-tertiary transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteLesson(lessonToDelete);
                  setLessonToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Yes, Delete Lesson
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary p-8 max-w-md w-full rounded-xl shadow-2xl border border-border-primary"
          >
            <h3 className="text-xl font-semibold text-text-primary mb-4">Delete Question?</h3>
            <p className="text-text-secondary font-medium mb-8 text-sm">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 bg-bg-primary border border-border-secondary text-text-primary font-medium rounded-md hover:bg-bg-tertiary transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteQuestion(questionToDelete.lessonId, questionToDelete.questionId);
                  setQuestionToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Yes, Delete Question
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
