import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-bg-primary z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-bg-inverted/20 blur-xl rounded-full" />
          <Loader2 className="w-12 h-12 text-text-primary animate-spin relative z-10" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-medium text-text-primary tracking-tight">CALCULATED</h2>
          <p className="text-sm text-text-muted mt-1">Loading your workspace...</p>
        </div>
      </motion.div>
    </div>
  );
}
