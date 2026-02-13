
import React from 'react';
import { motion } from 'framer-motion';
import { Command } from 'lucide-react';

export function Loader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100vh] w-full bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
            <div className="relative flex flex-col items-center">

                {/* Massive Animated Glow */}
                <motion.div
                    className="absolute inset-[-150px] bg-zinc-400/10 dark:bg-zinc-100/5 rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                <div className="relative">
                    {/* Double Rotating Rings */}
                    <motion.div
                        className="absolute inset-[-20px] rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 opacity-40"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />

                    <motion.div
                        className="absolute inset-[-40px] rounded-full border border-zinc-100 dark:border-zinc-900 opacity-20"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Central Premium Logo - Official Command Icon */}
                    <motion.div
                        className="relative z-10 w-28 h-28 bg-zinc-900 dark:bg-zinc-100 rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
                        animate={{
                            rotate: [0, 90, 180, 270, 360],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Command className="w-12 h-12 text-zinc-100 dark:text-zinc-900" strokeWidth={2.5} />

                        {/* Animated Shimmer Overlay */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 dark:from-black/0 dark:via-black/20 dark:to-black/0"
                            animate={{
                                x: ['-200%', '200%']
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    </motion.div>

                    {/* Dynamic Orbiting Dots */}
                    {[0, 1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2.5 h-2.5 bg-zinc-900 dark:bg-zinc-100 rounded-full shadow-lg"
                            style={{
                                top: '50%',
                                left: '50%',
                                marginLeft: '-5px',
                                marginTop: '-5px',
                            }}
                            animate={{
                                transform: [
                                    `rotate(${i * 90}deg) translate(75px) scale(1)`,
                                    `rotate(${i * 90 + 360}deg) translate(75px) scale(0.6)`,
                                ]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 0.3
                            }}
                        />
                    ))}
                </div>

                {/* Loading Text & Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-24 flex flex-col items-center gap-8"
                >
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-xs font-black tracking-[0.8em] uppercase text-zinc-900/40 dark:text-zinc-100/40 pl-[0.8em]">
                            Initializing
                        </h3>
                        <h2 className="text-3xl font-serif font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                            Kapsul
                        </h2>
                    </div>

                    {/* Modern Cinematic Progress Bar */}
                    <div className="relative w-72 h-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-full overflow-hidden shadow-inner border border-zinc-200/20 dark:border-zinc-800/20">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-zinc-950 dark:bg-zinc-100 rounded-full"
                            animate={{
                                width: ["0%", "100%", "0%"],
                                left: ["0%", "0%", "100%"]
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
