import React from "react";
import { Enrollment, Course } from "../data/mockData";
import { motion } from "motion/react";
import { PlayCircle, CheckCircle, Clock, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";

interface MyLearningProps {
  enrollments: Enrollment[];
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
}

export function MyLearning({ enrollments, courses, onSelectCourse }: MyLearningProps) {
  const getCourse = (id: string) => courses.find((c) => c.id === id);

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-20 bg-bg-secondary/40 backdrop-blur-sm rounded-2xl border border-border-primary border-dashed">
        <div className="w-20 h-20 bg-bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-border-secondary">
          <BookOpen className="w-10 h-10 text-text-muted" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">You aren't enrolled in any courses yet</h3>
        <p className="text-text-secondary mb-8 font-medium">Start exploring to find your next skill.</p>
        <button 
          onClick={() => onSelectCourse("")} 
          className="bg-bg-inverted hover:bg-bg-inverted-hover text-text-inverted font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm"
        >
          Explore Courses
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => {
          const course = getCourse(enrollment.courseId);
          if (!course) return null;

          return (
            <motion.div 
              key={enrollment.courseId}
              onClick={() => onSelectCourse(course.id)}
              className="bg-bg-secondary/40 backdrop-blur-sm rounded-2xl border border-border-primary overflow-hidden cursor-pointer flex flex-col h-full group hover:border-border-hover hover:shadow-sm transition-all hover:-translate-y-1"
            >
              <div className="relative h-48 w-full bg-bg-tertiary overflow-hidden border-b border-border-primary">
                {course.image ? (
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-text-muted">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-bg-inverted/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <div className="w-12 h-12 bg-bg-inverted rounded-2xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-sm border border-border-secondary">
                    <PlayCircle className="w-6 h-6 text-text-inverted ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-text-primary leading-tight mb-3 line-clamp-2 group-hover:text-text-secondary transition-colors tracking-tight">
                  {course.title}
                </h3>
                
                <p className="text-xs font-bold text-text-muted mb-6 flex items-center gap-2 bg-bg-tertiary w-fit px-2.5 py-1 rounded-lg border border-border-secondary uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-text-muted" /> 
                  Last accessed {new Date(enrollment.lastAccessed).toLocaleDateString()}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                    <span>Progress</span>
                    <span className="text-text-primary">{Math.round(enrollment.progress || 0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000 rounded-full",
                        enrollment.progress >= 100 ? "bg-bg-inverted" : "bg-bg-inverted"
                      )}
                      style={{ width: `${enrollment.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
