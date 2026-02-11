import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Plus } from 'lucide-react';

export function ThemeLandingPreview({ mode, isActive, onClick }) {
    const isDark = mode === 'dark';

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 transition-all duration-300",
                isActive
                    ? "border-zinc-900 dark:border-zinc-100 shadow-xl ring-2 ring-zinc-900/5 dark:ring-zinc-100/5"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
            )}
        >
            {/* Background */}
            <div className={cn(
                "absolute inset-0 transition-colors duration-500",
                isDark ? "bg-zinc-950" : "bg-zinc-50"
            )} />

            {/* Mini Landing Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none p-4">

                {/* Icon Circle */}
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-3 border transition-colors duration-300",
                    isDark
                        ? "bg-zinc-900 border-zinc-800 text-zinc-500"
                        : "bg-white border-zinc-200 text-zinc-400"
                )}>
                    <Plus className="w-4 h-4" />
                </div>

                {/* Text Lines */}
                <div className={cn(
                    "w-24 h-2 rounded-full mb-1.5 transition-colors duration-300",
                    isDark ? "bg-zinc-800" : "bg-zinc-300"
                )} />
                <div className={cn(
                    "w-16 h-1.5 rounded-full mb-4 opacity-60 transition-colors duration-300",
                    isDark ? "bg-zinc-800" : "bg-zinc-300"
                )} />

                {/* Button */}
                <div className={cn(
                    "h-6 px-4 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm",
                    isDark ? "bg-zinc-100" : "bg-zinc-900"
                )}>
                    <div className={cn(
                        "w-12 h-1 rounded-full",
                        isDark ? "bg-zinc-400" : "bg-zinc-500"
                    )} />
                </div>
            </div>

            {/* Active Indicator Label */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border backdrop-blur-md",
                    isDark ? "bg-white/10 text-zinc-300 border-zinc-800" : "bg-black/5 text-zinc-600 border-zinc-200"
                )}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
            </div>

            {/* Selection Checkmark (Subtle) */}
            {isActive && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}
        </motion.button>
    );
}
