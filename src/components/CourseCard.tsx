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
      className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800/50 overflow-hidden cursor-pointer flex flex-col h-full group relative hover:border-zinc-600/50 hover:shadow-sm transition-all"
    >
      {/* Image Header */}
      <div className="relative h-48 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/50">
        {course.image ? (
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
            <BookOpen className="w-12 h-12 opacity-50" />
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 bg-bg-inverted rounded-2xl flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-sm border border-zinc-200"
          >
            <PlayCircle className="w-6 h-6 text-text-inverted ml-0.5" />
          </motion.div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {course.status === 'draft' && (
            <span className="px-2.5 py-1 bg-zinc-900/90 backdrop-blur-md text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-zinc-700/50 shadow-sm cursor-default">
              Draft
            </span>
          )}
          <span className="px-2.5 py-1 bg-bg-inverted/90 backdrop-blur-md text-text-inverted text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-default">
            {course.category}
          </span>
          <span className={cn(
            "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-default border",
            "bg-zinc-800/50 backdrop-blur-md text-zinc-300 border-zinc-700/50"
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
                ? "bg-bg-inverted text-text-inverted border-zinc-200 hover:bg-bg-inverted-hover" 
                : "bg-zinc-900/90 backdrop-blur-md text-zinc-300 border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Star className={cn("w-4 h-4", isWatchlisted && "fill-current")} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-2 group-hover:text-zinc-300 transition-colors line-clamp-2 tracking-tight">
          {course.title}
        </h3>
        
        <p className="text-sm text-zinc-400 font-medium line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2.5 mb-4 group/instructor">
          <div className="w-8 h-8 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
            <img 
              src={course.instructor?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (course.instructor?.avatarSeed || "unknown")} 
              alt={course.instructor?.name || "Unknown Instructor"}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-zinc-500 group-hover/instructor:text-zinc-300 transition-colors flex items-center gap-1">
            {course.instructor?.name || "Unknown Instructor"}
            {["mgethmikadinujakumarathunga@gmail.com", "thewantab2012@gmail.com", "therevisionplan@gmail.com"].includes(course.instructor?.email || "") && (
              <BadgeCheck className="w-3.5 h-3.5 text-zinc-100" />
            )}
          </span>
        </div>

        {/* Stats Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 mt-auto">
          <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-zinc-100" />
              <span className="text-zinc-300">{course.rating.toFixed(1)}</span>
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
            <div className="text-xs font-bold text-zinc-300 bg-zinc-800/50 px-2.5 py-1 rounded-lg border border-zinc-700/50 uppercase tracking-wider">
              {course.price === 0 ? "Free" : formatCurrency(course.price)}
            </div>
          )}
        </div>

        {/* Progress Bar (if enrolled) */}
        {progress !== undefined && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-2 text-zinc-500">
              <span>Progress</span>
              <span className="text-zinc-100">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
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
