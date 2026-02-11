import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LayoutGrid, CheckCircle2, Search, Link2, Video, FileText } from 'lucide-react';

export function ThemePreview({ mode, isActive, onClick }) {
    const isDark = mode === 'dark';

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative w-full aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all duration-300",
                isActive
                    ? "border-zinc-900 dark:border-zinc-100 shadow-2xl ring-4 ring-zinc-900/10 dark:ring-zinc-100/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xl"
            )}
        >
            {/* Background */}
            <div className={cn(
                "absolute inset-0 transition-colors duration-300",
                isDark ? "bg-zinc-950" : "bg-zinc-50"
            )} />

            {/* Content Container (Mini Dashboard) */}
            <div className="absolute inset-2 flex gap-2 pointer-events-none select-none">

                {/* Mini Sidebar */}
                <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        "w-1/4 h-full rounded-lg border flex flex-col p-2 gap-2",
                        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                    )}
                >
                    {/* Sidebar Header */}
                    <div className={cn(
                        "h-4 w-12 rounded-full mb-2",
                        isDark ? "bg-zinc-800" : "bg-zinc-100"
                    )} />

                    {/* Sidebar Items */}
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={cn(
                            "h-2 w-full rounded-full",
                            isDark ? "bg-zinc-800/50" : "bg-zinc-100"
                        )} />
                    ))}

                    {/* Sidebar Bottom (User) */}
                    <div className={cn(
                        "mt-auto h-6 w-full rounded-md",
                        isDark ? "bg-zinc-800" : "bg-zinc-100"
                    )} />
                </motion.div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-2">

                    {/* Header */}
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={cn(
                            "h-8 w-full rounded-lg border flex items-center px-3 justify-between",
                            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white/50 border-zinc-200"
                        )}
                    >
                        <div className={cn(
                            "h-2 w-16 rounded-full",
                            isDark ? "bg-zinc-800" : "bg-zinc-200"
                        )} />
                        <div className={cn(
                            "h-4 w-4 rounded-full",
                            isDark ? "bg-zinc-800" : "bg-zinc-200"
                        )} />
                    </motion.div>

                    {/* Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-2 content-start">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className={cn(
                                    "aspect-square rounded-lg border p-2 flex flex-col gap-2",
                                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200",
                                    i === 2 ? "col-span-2 aspect-[2/1]" : "" // Featured item
                                )}
                            >
                                <div className={cn(
                                    "w-full h-1/2 rounded-md opacity-50",
                                    isDark ? "bg-zinc-800" : "bg-zinc-100"
                                )} />
                                <div className={cn(
                                    "h-2 w-3/4 rounded-full",
                                    isDark ? "bg-zinc-800" : "bg-zinc-100"
                                )} />
                                <div className={cn(
                                    "h-2 w-1/2 rounded-full",
                                    isDark ? "bg-zinc-800" : "bg-zinc-100"
                                )} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Indicator & Label */}
            <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center gap-2">
                <span className={cn(
                    "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border backdrop-blur-md transition-all",
                    isActive
                        ? (isDark ? "bg-white text-black border-white" : "bg-black text-white border-black")
                        : (isDark ? "bg-black/50 text-zinc-400 border-zinc-800" : "bg-white/50 text-zinc-500 border-zinc-200")
                )}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
            </div>

            {/* Selection Checkmark */}
            {isActive && (
                <div className="absolute top-3 right-3">
                    <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shadow-lg",
                        isDark ? "bg-white text-black" : "bg-black text-white"
                    )}>
                        <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                    </div>
                </div>
            )}
        </motion.button>
    );
}
