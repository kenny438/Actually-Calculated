const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Typography
    content = content.replace(/font-black/g, 'font-medium');
    content = content.replace(/font-bold/g, 'font-medium');
    content = content.replace(/uppercase tracking-widest/g, 'tracking-wide');
    
    // Borders
    content = content.replace(/border-4/g, 'border');
    content = content.replace(/border-2/g, 'border');
    content = content.replace(/border-b-4/g, 'border');
    
    // Shadows
    content = content.replace(/shadow-\[0_8px_0_rgb\([^\]]+\)\]/g, 'shadow-sm');
    content = content.replace(/shadow-\[0_6px_0_rgb\([^\]]+\)\]/g, 'shadow-sm');
    content = content.replace(/shadow-\[0_4px_0_rgb\([^\]]+\)\]/g, 'shadow-sm');
    
    // Radii
    content = content.replace(/rounded-3xl/g, 'rounded-2xl');
    content = content.replace(/rounded-full/g, 'rounded-full');
    
    // Colors - Indigo to Zinc
    content = content.replace(/bg-indigo-500/g, 'bg-zinc-900');
    content = content.replace(/bg-indigo-600/g, 'bg-zinc-800');
    content = content.replace(/bg-indigo-50/g, 'bg-zinc-50');
    content = content.replace(/bg-indigo-100/g, 'bg-zinc-100');
    content = content.replace(/text-indigo-500/g, 'text-zinc-600');
    content = content.replace(/text-indigo-600/g, 'text-zinc-700');
    content = content.replace(/text-indigo-700/g, 'text-zinc-800');
    content = content.replace(/text-indigo-800/g, 'text-zinc-900');
    content = content.replace(/border-indigo-100/g, 'border-zinc-200');
    content = content.replace(/border-indigo-200/g, 'border-zinc-200');
    content = content.replace(/border-indigo-300/g, 'border-zinc-300');
    content = content.replace(/border-indigo-500/g, 'border-zinc-900');
    content = content.replace(/border-indigo-700/g, 'border-zinc-900');
    content = content.replace(/ring-indigo-500/g, 'ring-zinc-900');
    
    // Colors - Emerald to Muted Sand/Beige
    content = content.replace(/bg-emerald-400/g, 'bg-[#d4b88a]');
    content = content.replace(/bg-emerald-500/g, 'bg-[#c7a16b]');
    content = content.replace(/bg-emerald-50/g, 'bg-[#fdfbf7]');
    content = content.replace(/bg-emerald-100/g, 'bg-[#f8f4eb]');
    content = content.replace(/text-emerald-500/g, 'text-[#c7a16b]');
    content = content.replace(/text-emerald-600/g, 'text-[#b88b54]');
    content = content.replace(/text-emerald-700/g, 'text-[#9a7146]');
    content = content.replace(/border-emerald-200/g, 'border-[#efe5d2]');
    content = content.replace(/border-emerald-500/g, 'border-[#c7a16b]');
    content = content.replace(/ring-emerald-500/g, 'ring-[#c7a16b]');

    // Colors - Slate to Zinc
    content = content.replace(/bg-slate-/g, 'bg-zinc-');
    content = content.replace(/text-slate-/g, 'text-zinc-');
    content = content.replace(/border-slate-/g, 'border-zinc-');
    
    // Animations
    content = content.replace(/-translate-y-1/g, '');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
