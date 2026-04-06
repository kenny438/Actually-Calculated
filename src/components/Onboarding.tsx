import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, GraduationCap } from "lucide-react";

export interface OnboardingData {
  age: number;
  isAdult: boolean;
  canCreateCourses: boolean;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [age, setAge] = useState<string>("");
  const [isAdult, setIsAdult] = useState<boolean>(false);
  const [canCreateCourses, setCanCreateCourses] = useState<boolean>(false);

  const isValid = age !== "" && parseInt(age) > 0;

  const handleSubmit = () => {
    if (isValid) {
      onComplete({
        age: parseInt(age),
        isAdult,
        canCreateCourses
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950 pointer-events-none"></div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-zinc-800/50 relative z-10"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center transform -rotate-6 shadow-inner mb-6 border border-zinc-700/50 relative group">
            <div className="absolute inset-0 bg-zinc-800/50 rounded-2xl blur-xl group-hover:bg-zinc-700/50 transition-colors"></div>
            <GraduationCap className="w-10 h-10 text-zinc-100 relative z-10" />
          </div>
          <h1 className="text-4xl font-bold text-zinc-100 mb-4 tracking-tight">Welcome to CALCULATED</h1>
          <p className="text-lg text-zinc-400 font-medium">Let's set up your profile to get started.</p>
        </div>

        <div className="space-y-6 mb-10">
          <div>
            <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-widest">Your Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-zinc-800/50 bg-zinc-950/50 text-zinc-100 focus:border-zinc-600/50 focus:ring-1 focus:ring-zinc-600/50 transition-all font-bold placeholder-zinc-700 shadow-inner"
              placeholder="e.g. 25"
              min="1"
            />
          </div>

          <label className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-600/50 bg-zinc-950/50 cursor-pointer transition-all group shadow-inner">
            <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isAdult ? 'bg-bg-inverted border-zinc-300' : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'}`}>
              {isAdult && <Check className="w-4 h-4 text-text-inverted" />}
            </div>
            <input 
              type="checkbox" 
              checked={isAdult}
              onChange={(e) => setIsAdult(e.target.checked)}
              className="hidden"
            />
            <div>
              <p className="font-bold text-zinc-100 group-hover:text-zinc-300 transition-colors">I am an adult</p>
              <p className="text-sm text-zinc-500 font-medium">Confirm you are 18 years or older</p>
            </div>
          </label>

          <label className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-600/50 bg-zinc-950/50 cursor-pointer transition-all group shadow-inner">
            <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${canCreateCourses ? 'bg-bg-inverted border-zinc-300' : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'}`}>
              {canCreateCourses && <Check className="w-4 h-4 text-text-inverted" />}
            </div>
            <input 
              type="checkbox" 
              checked={canCreateCourses}
              onChange={(e) => setCanCreateCourses(e.target.checked)}
              className="hidden"
            />
            <div>
              <p className="font-bold text-zinc-100 group-hover:text-zinc-300 transition-colors">Enable Course Creation</p>
              <p className="text-sm text-zinc-500 font-medium">I want to create and publish my own courses</p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            isValid 
              ? 'bg-bg-inverted text-text-inverted hover:bg-bg-inverted-hover active:scale-[0.98] shadow-sm' 
              : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
          }`}
        >
          {isValid ? "Let's Go!" : "Please enter your age"}
        </button>
      </motion.div>

      <div className="absolute bottom-4 left-0 w-full text-center text-zinc-600 text-xs font-bold px-4 pointer-events-none tracking-widest uppercase">
        by (BUSSIN)Bureau de l’Unité des Systèmes et Intelligence Numérique industries
      </div>
    </div>
  );
}
