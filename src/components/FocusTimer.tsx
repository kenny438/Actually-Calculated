import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(5 * 60);
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="relative">
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shadow-sm hover:scale-105 active:scale-95",
          isActive ? "bg-bg-tertiary border-border-hover text-text-primary" : "bg-bg-secondary border-border-primary text-text-muted hover:border-border-hover hover:text-text-secondary"
        )}
      >
        <motion.div
          animate={isActive ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Timer className="w-4 h-4" />
        </motion.div>
        <span className="hidden sm:inline text-sm font-bold">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-64 bg-bg-primary rounded-2xl border border-border-primary shadow-xl p-4 z-50"
          >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary flex items-center gap-2 text-sm tracking-tight">
              {isBreak ? <Coffee className="w-4 h-4 text-text-muted" /> : <Timer className="w-4 h-4 text-text-muted" />}
              {isBreak ? "Break Time" : "Focus Mode"}
            </h3>
            <div className="flex gap-1 bg-bg-secondary p-1 rounded-lg border border-border-primary">
              <button 
                onClick={() => { setIsBreak(false); setTimeLeft(25 * 60); setIsActive(false); }}
                className={cn("px-2 py-1 text-xs font-bold rounded-md transition-colors", !isBreak ? "bg-bg-tertiary text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary")}
              >
                25m
              </button>
              <button 
                onClick={() => { setIsBreak(true); setTimeLeft(5 * 60); setIsActive(false); }}
                className={cn("px-2 py-1 text-xs font-bold rounded-md transition-colors", isBreak ? "bg-bg-tertiary text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary")}
              >
                5m
              </button>
            </div>
          </div>
          
          <div className="text-5xl font-black text-center text-text-primary mb-6 font-mono tracking-tighter">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={toggleTimer}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm",
                isActive ? "bg-bg-tertiary hover:bg-bg-secondary text-text-primary border border-border-secondary" : "bg-bg-inverted hover:bg-bg-inverted-hover text-text-inverted shadow-sm"
              )}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? "Pause" : "Start"}
            </button>
            <button 
              onClick={resetTimer}
              className="p-2.5 bg-bg-secondary border border-border-primary text-text-muted rounded-xl hover:bg-bg-tertiary hover:text-text-secondary transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
