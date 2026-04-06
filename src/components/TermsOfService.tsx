import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, Scale, UserX, Clock, ArrowLeft } from "lucide-react";

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-6"
    >
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-bold text-zinc-400 hover:text-zinc-100 transition-all mb-8 uppercase tracking-widest bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-800/50 shadow-sm hover:-translate-y-0.5 hover:border-zinc-600/50 hover:shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
      </button>

      <div className="bg-zinc-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-zinc-800/50 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center border border-zinc-700/50 shadow-inner transform -rotate-6 group hover:rotate-0 transition-transform duration-500">
            <Scale className="w-10 h-10 text-zinc-100 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 tracking-tight leading-none mb-2">Terms of Service</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-sm">Last Updated: February 2026</p>
          </div>
        </div>

        <div className="space-y-12 text-zinc-400 leading-relaxed">
          <section className="relative pl-16 group">
            <div className="absolute left-0 top-0 w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center border border-zinc-700/50 shadow-sm transform rotate-3 group-hover:rotate-12 transition-transform duration-300">
              <UserX className="w-6 h-6 text-zinc-100" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-4 uppercase tracking-tight group-hover:text-zinc-300 transition-colors">1. Age Requirement & Eligibility</h2>
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-6 mb-6 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <p className="text-zinc-100 font-bold text-lg mb-2 flex items-center gap-2 relative z-10">
                <ShieldAlert className="w-6 h-6" />
                CRITICAL NOTICE: MINIMUM AGE REQUIREMENT
              </p>
              <p className="text-zinc-300 font-bold relative z-10">
                You MUST be at least 12 years of age to use CALCULATED. If you are under the age of 12, you are strictly prohibited from creating an account or accessing any part of the service.
              </p>
            </div>
            <p className="font-medium text-lg">
              CALCULATED is designed for users who have reached a level of maturity to understand the concepts taught. Users under 12 years old lack the legal capacity and cognitive development required to navigate the complexities of our platform. We take this requirement seriously to ensure a safe environment for our community.
            </p>
          </section>

          <section className="relative pl-16 group">
            <div className="absolute left-0 top-0 w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center border border-zinc-700/50 shadow-sm transform -rotate-3 group-hover:-rotate-12 transition-transform duration-300">
              <Clock className="w-6 h-6 text-zinc-100" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-4 uppercase tracking-tight group-hover:text-zinc-300 transition-colors">2. Why the 12+ Restriction?</h2>
            <p className="mb-6 font-medium text-lg">
              Our 12-year-old age limit is not arbitrary. It is based on several key factors:
            </p>
            <ul className="space-y-4 font-medium text-lg">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-bg-inverted mt-2.5 flex-shrink-0 shadow-sm" />
                <span><span className="text-zinc-200 font-bold">Data Privacy (COPPA):</span> We comply with international data protection laws that restrict the collection of personal information from children under 13.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-bg-inverted mt-2.5 flex-shrink-0 shadow-sm" />
                <span><span className="text-zinc-200 font-bold">Risk Management:</span> Advanced learning involves analyzing complex data and understanding probability. Research suggests that cognitive abilities for these tasks mature significantly around age 12.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-bg-inverted mt-2.5 flex-shrink-0 shadow-sm" />
                <span><span className="text-zinc-200 font-bold">Community Safety:</span> CALCULATED is a social platform. Maintaining an age floor helps us foster a more mature and responsible community interaction.</span>
              </li>
            </ul>
          </section>

          <section className="relative pl-16 group">
            <div className="absolute left-0 top-0 w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center border border-zinc-700/50 shadow-sm transform rotate-6 group-hover:rotate-12 transition-transform duration-300">
              <Scale className="w-6 h-6 text-zinc-100" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-4 uppercase tracking-tight group-hover:text-zinc-300 transition-colors">3. Account Termination</h2>
            <p className="font-medium text-lg">
              If we discover that an account has been created by a user under the age of 12, we will immediately terminate the account and delete all associated data without prior notice. We reserve the right to request proof of age at any time if we have reason to believe a user is underage.
            </p>
          </section>

          <section className="relative pl-16 group">
            <div className="absolute left-0 top-0 w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center border border-zinc-700/50 shadow-sm transform -rotate-6 group-hover:-rotate-12 transition-transform duration-300">
              <ShieldAlert className="w-6 h-6 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-4 uppercase tracking-tight group-hover:text-zinc-300 transition-colors">4. Boring Legal Stuff</h2>
            <p className="text-lg font-bold italic text-zinc-500 bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 shadow-inner">
              By using CALCULATED, you agree that you are not a tiny child. You agree that you will not lie about your age. You agree that if you are caught being 11 years old, you will accept your ban with dignity. We are not responsible for your tears if your account is deleted because you were born in 2015 or later.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t-2 border-zinc-800/50 text-center">
          <p className="text-sm font-bold text-zinc-600 uppercase tracking-[0.3em]">
            BRILLIANT &bull; AN APP BY BUSSIN INDUSTRIES ↈ∭ &bull; &copy; 2026
          </p>
        </div>
      </div>
    </motion.div>
  );
}
