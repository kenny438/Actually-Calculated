import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Mail, Lock, ArrowRight, GraduationCap, Star, Sparkles, Zap, Brain } from 'lucide-react';
import { TermsOfService } from './TermsOfService';
import { triggerConfetti } from '../lib/utils';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOver12, setIsOver12] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && !isOver12) {
      addToast('You must be at least 12 years old to join.', 'error');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
          triggerConfetti();
          addToast('Account created successfully!', 'success');
        } else {
          // If email confirmation is enabled in Supabase
          addToast('Account created! Please check your email to verify your account.', 'success');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
             addToast('Please check your email to verify your account before signing in.', 'error');
             return;
          }
          throw error;
        }
        addToast('Successfully signed in!', 'success');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      addToast(error.message || "An error occurred during authentication.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-primary relative">
      {/* Left Side - Branding/Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary p-12 relative overflow-hidden flex-col justify-between border-r border-border-primary">
        {/* Interactive background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: mousePosition.x * 20, 
              y: mousePosition.y * 20 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-bg-tertiary rounded-full mix-blend-screen filter blur-3xl opacity-20" 
          />
          <motion.div 
            animate={{ 
              x: mousePosition.x * -30, 
              y: mousePosition.y * -30 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute top-1/2 right-0 w-96 h-96 bg-[#333] rounded-full mix-blend-screen filter blur-3xl opacity-20" 
          />
          <motion.div 
            animate={{ 
              x: mousePosition.x * 40, 
              y: mousePosition.y * -40 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#444] rounded-full mix-blend-screen filter blur-3xl opacity-20" 
          />
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-14 h-14 bg-bg-tertiary rounded-2xl flex items-center justify-center transform -rotate-6 shadow-xl hover:rotate-0 transition-transform duration-300 cursor-pointer border border-border-secondary">
              <GraduationCap className="w-8 h-8 text-text-primary" />
            </div>
            <span className="text-4xl font-black text-text-primary tracking-tight">CALCULATED</span>
          </motion.div>

          <div className="mt-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-5xl xl:text-7xl font-black text-text-primary leading-[1.1] mb-6">
                Unlock your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EDEDED] via-[#888] to-[#444]">
                  learning potential
                </span>
              </h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-text-secondary font-medium max-w-md leading-relaxed flex items-center gap-2"
            >
              <Brain className="w-6 h-6 text-text-primary" />
              Join thousands mastering new skills through interactive, gamified courses.
            </motion.p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-4 bg-bg-primary/50 backdrop-blur-md p-6 rounded-3xl border border-border-secondary hover:bg-bg-tertiary/50 transition-colors cursor-pointer group">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.img 
                  key={i} 
                  src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                  alt="Student" 
                  className="w-12 h-12 rounded-full border-4 border-[#111] relative hover:-translate-y-1 hover:scale-110 hover:z-10 transition-all" 
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-text-primary mb-1 group-hover:scale-110 transition-transform origin-left">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm font-bold text-text-secondary">Loved by 10,000+ learners</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        {/* Mobile background blobs */}
        <div className="lg:hidden absolute top-20 left-20 w-64 h-64 bg-bg-tertiary rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob pointer-events-none" />
        <div className="lg:hidden absolute top-40 right-20 w-64 h-64 bg-[#333] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none" />
        <div className="lg:hidden absolute -bottom-8 left-40 w-64 h-64 bg-[#444] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-bg-secondary rounded-2xl flex items-center justify-center transform -rotate-6 shadow-lg border border-border-secondary">
              <GraduationCap className="w-8 h-8 text-text-primary" />
            </div>
            <span className="text-3xl font-black text-text-primary tracking-tight">CALCULATED</span>
          </div>

          <div className="bg-bg-secondary p-8 sm:p-10 relative overflow-hidden group rounded-3xl border border-border-primary shadow-2xl">
            {/* Fun decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-bg-tertiary rounded-full mix-blend-screen opacity-20 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#333] rounded-full mix-blend-screen opacity-20 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'signup' : 'signin'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-4xl font-black text-text-primary mb-2 flex items-center justify-center gap-2">
                    {isSignUp ? (
                      <>Create Account <Sparkles className="w-8 h-8 text-text-secondary" /></>
                    ) : (
                      <>Welcome Back! <Zap className="w-8 h-8 text-text-secondary" /></>
                    )}
                  </h2>
                  <p className="text-base font-bold text-text-muted">
                    {isSignUp ? 'Start your epic learning journey today' : 'Ready to level up your skills?'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <form onSubmit={handleAuth} className="space-y-6 relative z-10">
              <motion.div
                initial={false}
                animate={{ x: isSignUp ? 0 : [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <label className="block text-sm font-black text-text-secondary mb-2 uppercase tracking-widest">Email</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 group-focus-within/input:text-text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-bg-primary border-2 border-border-secondary rounded-2xl focus:ring-4 focus:ring-[#EDEDED]/10 focus:border-[#EDEDED] transition-all outline-none font-bold text-text-primary placeholder-[#444] text-lg hover:border-border-hover"
                    placeholder="you@example.com"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={false}
                animate={{ x: isSignUp ? 0 : [0, 5, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <label className="block text-sm font-black text-text-secondary mb-2 uppercase tracking-widest">Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 group-focus-within/input:text-text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-bg-primary border-2 border-border-secondary rounded-2xl focus:ring-4 focus:ring-[#EDEDED]/10 focus:border-[#EDEDED] transition-all outline-none font-bold text-text-primary placeholder-[#444] text-lg hover:border-border-hover"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>

              <AnimatePresence>
                {isSignUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, scale: 0.9 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.9 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-4 p-4 bg-bg-primary rounded-2xl border-2 border-border-secondary hover:border-border-hover transition-colors">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          id="age-check"
                          type="checkbox"
                          checked={isOver12}
                          onChange={(e) => setIsOver12(e.target.checked)}
                          className="w-6 h-6 text-text-primary border-2 border-border-hover rounded-lg focus:ring-[#EDEDED] cursor-pointer transition-transform hover:scale-110 bg-bg-secondary"
                        />
                      </div>
                      <label htmlFor="age-check" className="text-sm font-bold text-text-secondary cursor-pointer select-none leading-relaxed">
                        I certify that I am at least <span className="font-black text-text-primary bg-bg-tertiary px-2 py-0.5 rounded-md">12 years of age</span> and agree to the <button type="button" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="text-text-primary hover:text-white hover:underline font-black decoration-2 underline-offset-2">Terms of Service</button>.
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                onHoverStart={() => setIsHoveringBtn(true)}
                onHoverEnd={() => setIsHoveringBtn(false)}
                className="w-full py-5 text-xl flex items-center justify-center gap-3 relative overflow-hidden group/btn bg-bg-inverted text-text-inverted rounded-2xl font-black hover:bg-bg-inverted-hover transition-colors"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <motion.div
                      animate={{ x: isHoveringBtn ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center relative z-10">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-base font-black text-text-secondary hover:text-text-primary hover:underline underline-offset-4 transition-all hover:scale-105"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {isTermsOpen && (
        <div className="fixed inset-0 z-50 bg-bg-primary overflow-y-auto">
          <TermsOfService onBack={() => setIsTermsOpen(false)} />
        </div>
      )}

      <div className="absolute bottom-4 left-0 w-full text-center text-[#444] text-xs font-medium px-4 pointer-events-none">
        by (BUSSIN)Bureau de l’Unité des Systèmes et Intelligence Numérique industries
      </div>
    </div>
  );
}
