import React from "react";
import { Course } from "../data/mockData";
import { cn, formatCurrency } from "../lib/utils";
import { motion } from "motion/react";
import { Star, Users, Clock, PlayCircle, BookOpen, BadgeCheck } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: () => void;
  progress?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, isWatchlisted, onToggleWatchlist, progress }) => {
  return (
    <motion.div 
      onClick={onClick}
      className="bg-bg-secondary/40 backdrop-blur-sm rounded-2xl border border-border-primary overflow-hidden cursor-pointer flex flex-col h-full group relative hover:border-border-hover hover:shadow-sm transition-all"
    >
      {/* Image Header */}
      <div className="relative h-48 w-full bg-bg-primary overflow-hidden border-b border-border-primary">
        {course.image ? (
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-text-muted">
            <BookOpen className="w-12 h-12 opacity-50" />
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 bg-bg-inverted rounded-2xl flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-sm border border-border-secondary"
          >
            <PlayCircle className="w-6 h-6 text-text-inverted ml-0.5" />
          </motion.div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {course.status === 'draft' && (
            <span className="px-2.5 py-1 bg-bg-secondary/90 backdrop-blur-md text-text-secondary text-[10px] font-bold uppercase tracking-wider rounded-lg border border-border-secondary shadow-sm cursor-default">
              Draft
            </span>
          )}
          <span className="px-2.5 py-1 bg-bg-inverted/90 backdrop-blur-md text-text-inverted text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-default">
            {course.category}
          </span>
          <span className={cn(
            "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-default border",
            "bg-bg-tertiary/50 backdrop-blur-md text-text-secondary border-border-secondary"
          )}>
            {course.level}
          </span>
        </div>

        {/* Watchlist Button */}
        {onToggleWatchlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist();
            }}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-xl transition-all shadow-sm z-10 border",
              isWatchlisted 
                ? "bg-bg-inverted text-text-inverted border-border-secondary hover:bg-bg-inverted-hover" 
                : "bg-bg-secondary/90 backdrop-blur-md text-text-secondary border-border-secondary hover:bg-bg-tertiary hover:text-text-primary"
            )}
          >
            <Star className={cn("w-4 h-4", isWatchlisted && "fill-current")} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text-primary leading-tight mb-2 group-hover:text-text-secondary transition-colors line-clamp-2 tracking-tight">
          {course.title}
        </h3>
        
        <p className="text-sm text-text-secondary font-medium line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2.5 mb-4 group/instructor">
          <div className="w-8 h-8 bg-bg-tertiary rounded-full overflow-hidden border border-border-secondary">
            <img 
              src={course.instructor?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (course.instructor?.avatarSeed || "unknown")} 
              alt={course.instructor?.name || "Unknown Instructor"}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-text-muted group-hover/instructor:text-text-secondary transition-colors flex items-center gap-1">
            {course.instructor?.name || "Unknown Instructor"}
            {["mgethmikadinujakumarathunga@gmail.com", "thewantab2012@gmail.com", "therevisionplan@gmail.com"].includes(course.instructor?.email || "") && (
              <BadgeCheck className="w-3.5 h-3.5 text-text-primary" />
            )}
          </span>
        </div>

        {/* Stats Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border-primary mt-auto">
          <div className="flex items-center gap-3 text-xs font-bold text-text-muted uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-text-primary" />
              <span className="text-text-secondary">{course.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{course.students.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{course.lessons.length}</span>
            </div>
          </div>
          
          {progress === undefined && (
            <div className="text-xs font-bold text-text-secondary bg-bg-tertiary/50 px-2.5 py-1 rounded-lg border border-border-secondary uppercase tracking-wider">
              {course.price === 0 ? "Free" : formatCurrency(course.price)}
            </div>
          )}
        </div>

        {/* Progress Bar (if enrolled) */}
        {progress !== undefined && (
          <div className="mt-4 pt-4 border-t border-border-primary">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-2 text-text-muted">
              <span>Progress</span>
              <span className="text-text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-bg-inverted rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
