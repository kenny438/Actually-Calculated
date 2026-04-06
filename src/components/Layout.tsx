import React, { useState, useEffect } from "react";
import { Search, Bell, Menu, ChevronDown, X, LogOut, BookOpen, Users, GraduationCap, BadgeCheck, Home, Settings, HelpCircle, Sun, Moon } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "./ui/Toast";
import { FocusTimer } from "./FocusTimer";
import { usePlatform } from "../hooks/usePlatform";

import { UserProfile } from "../data/mockData";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile?: UserProfile;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  userProfile,
  searchQuery = "",
  setSearchQuery
}: LayoutProps) {
  const { addToast } = useToast();
  const platform = usePlatform();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navLinks = [
    { id: "home", label: "Home", icon: Home },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "my-learning", label: "My Learning", icon: GraduationCap },
    { id: "groups", label: "Groups", icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 font-sans text-zinc-100">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl h-screen sticky top-0">
        <div className="p-4 flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("home")}>
          <div className="w-8 h-8 bg-bg-inverted rounded-xl flex items-center justify-center group-hover:bg-bg-inverted-hover transition-colors shadow-sm">
            <GraduationCap className="w-5 h-5 text-text-inverted" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">Calculated</span>
        </div>
        
        <div className="px-3 py-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-100 transition-colors" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery?.(e.target.value);
                if (activeTab !== 'courses') setActiveTab('courses');
              }}
              className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600/50 focus:ring-1 focus:ring-zinc-600/50 transition-all shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-bold text-zinc-500 bg-zinc-800/50 rounded border border-zinc-700/50">⌘K</kbd>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-zinc-500 mb-3 px-2 uppercase tracking-wider">Menu</div>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all",
                activeTab === link.id 
                  ? "bg-zinc-800/50 text-zinc-100 border border-zinc-700/50 shadow-sm" 
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800/50 space-y-1 bg-zinc-950/80 backdrop-blur-md">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-zinc-400 rounded-xl hover:bg-zinc-900/50 hover:text-zinc-200 transition-all border border-transparent hover:border-zinc-800/50"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-zinc-400 rounded-xl hover:bg-zinc-900/50 hover:text-zinc-200 transition-all border border-transparent hover:border-zinc-800/50"
          >
            <img src={userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.avatarSeed || 'default'}`} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-zinc-700/50" />
            <span className="flex-1 text-left truncate">{userProfile?.username || 'Profile'}</span>
            {userProfile && ["mgethmikadinujakumarathunga@gmail.com", "thewantab2012@gmail.com", "therevisionplan@gmail.com"].includes(userProfile.email || "") && (
              <BadgeCheck className="w-4 h-4 text-zinc-100" />
            )}
          </button>
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('app:signout'));
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-zinc-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex flex-col w-full">
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 pt-[env(safe-area-inset-top)]">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("home")}>
              <div className="w-7 h-7 bg-bg-inverted rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4 h-4 text-text-inverted" />
              </div>
              <span className="text-base font-bold tracking-tight text-zinc-100">Calculated</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl transition-colors"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <FocusTimer />
            </div>
          </div>
        </header>

        {/* Main Content Area Mobile */}
        <main className="flex-1 flex flex-col w-full pb-20">
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Bottom Navigation Bar for Mobile */}
        <div className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2",
          platform === 'ios' 
            ? "bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-800/50 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]" 
            : "bg-zinc-950 border-t border-zinc-800/50 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
        )}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all",
                platform === 'android' && "active:bg-zinc-800/50",
                activeTab === link.id 
                  ? "text-zinc-100" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <link.icon className={cn("w-6 h-6", activeTab === link.id && "fill-zinc-800/50")} />
              <span className="text-[10px] font-medium tracking-wide">{link.label}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all",
              platform === 'android' && "active:bg-zinc-800/50",
              activeTab === "profile" 
                ? "text-zinc-100" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <img src={userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.avatarSeed || 'default'}`} alt="Avatar" className={cn("w-6 h-6 rounded-full object-cover border-2", activeTab === "profile" ? "border-zinc-100" : "border-transparent")} />
            <span className="text-[10px] font-medium tracking-wide">Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content Area Desktop */}
      <main className="hidden md:flex flex-1 flex-col h-screen overflow-y-auto custom-scrollbar">
        <div className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
