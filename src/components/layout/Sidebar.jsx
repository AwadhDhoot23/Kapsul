import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutGrid,
    Hash,
    Search,
    Library,
    Settings,
    Plus,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    Zap,
    CheckCircle2,
    Circle,
    Command
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getUserItems } from '@/lib/firestore'; // Import normally at top

export function Sidebar({ collapsed, setCollapsed, onNewItem }) {
    const isMobile = useIsMobile();
    const user = useAuthStore((state) => state.user);

    const [counts, setCounts] = useState({ active: 0, completed: 0, total: 0 });

    useEffect(() => {
        if (!user?.uid) return;

        // Set up real-time listener for all items to count them
        const unsubscribe = getUserItems(user.uid, {}, (items) => {
            const active = items.filter(i => !i.isCompleted).length;
            const completed = items.filter(i => i.isCompleted).length;
            setCounts({
                active,
                completed,
                total: items.length
            });
        });

        return () => unsubscribe();
    }, [user?.uid]);

    // Calculate stats from real-time state
    const { active: activeCount, completed: completedCount, total: totalItems } = counts;
    const streak = 7; // TODO: Calculate actual streak from Firestore in future

    const NavItem = ({ to, icon: Icon, label, badge }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "nav-item flex items-center justify-center px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                        ? "active bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm"
                        : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                )
            }
            title={collapsed ? label : undefined}
        >
            {({ isActive }) => (
                <motion.div
                    initial={false}
                    animate={{ x: 0 }}
                    whileHover={!collapsed ? { x: 4 } : {}}
                    className={cn(
                        "flex items-center w-full",
                        collapsed ? "justify-center" : "gap-3"
                    )}
                >
                    <div className={cn(
                        "flex items-center justify-center p-1.5 rounded-lg transition-all duration-300",
                        isActive ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-transparent text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                    )}>
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    {!collapsed && (
                        <>
                            <span className="whitespace-nowrap flex-1 text-[13px] tracking-tight">
                                {label}
                            </span>
                            {badge > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-[10px] font-black text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full shrink-0 bg-white dark:bg-zinc-900"
                                >
                                    {badge}
                                </motion.span>
                            )}
                        </>
                    )}
                </motion.div>
            )}
        </NavLink>
    );

    // Sidebar content (shared between desktop and mobile)
    const SidebarContent = ({ showMobileClose = false }) => (
        <>
            {/* Header with Logo & Collapse Toggle */}
            <div className={cn(
                "h-24 flex items-center px-4",
                collapsed && !showMobileClose ? "justify-center" : "justify-between"
            )}>
                {collapsed && !showMobileClose ? (
                    <div className="flex flex-col items-center gap-6">
                        <div
                            layoutId="sidebar-logo"
                            className="text-zinc-900 pt-10 dark:text-zinc-100"
                        >
                            <Command className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCollapsed(false)}
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    /* Expanded: Logo + Text (Left) | Toggle (Right) */
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <motion.div
                                layoutId="sidebar-logo"
                                className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg"
                            >
                                <Command className="w-5 h-5" strokeWidth={2.5} />
                            </motion.div>
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-serif font-black text-xl tracking-tighter text-zinc-900 dark:text-zinc-100"
                            >
                                Kapsul
                            </motion.span>
                        </div>

                        {!showMobileClose && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCollapsed(true)}
                                className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* New Capture Button */}
            <div className="px-3 py-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        onClick={() => onNewItem('video')}
                        className={cn(
                            "w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 transition-all shadow-md rounded-xl h-12",
                            collapsed && !showMobileClose ? "p-0 justify-center h-12 shadow-none" : "justify-start gap-3 px-4"
                        )}
                    >
                        <Plus className="w-5 h-5" strokeWidth={3} />
                        {(!collapsed || showMobileClose) && <span className="text-sm font-bold tracking-tight">New Item</span>}
                    </Button>
                </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1.5 py-4">
                <NavItem to="/" icon={LayoutGrid} label="Everything" badge={activeCount} />
                <NavItem to="/settings" icon={Settings} label="Settings" />
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto p-3">
                {(!collapsed || showMobileClose) ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 space-y-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500 font-bold">Total Vault</span>
                                <span className="font-black text-zinc-900 dark:text-zinc-100">{totalItems}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-zinc-500 font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <span>Active</span>
                                </div>
                                <span className="font-black text-zinc-900 dark:text-zinc-100">{activeCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-zinc-500 font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span>Completed</span>
                                </div>
                                <span className="font-black text-zinc-900 dark:text-zinc-100">{completedCount}</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
                            <Zap className="w-5 h-5 opacity-40" />
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
                    </div>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* Mobile: Shadcn Sheet (only render on mobile to prevent desktop backdrop) */}
            {isMobile && (
                <Sheet open={!collapsed} onOpenChange={(open) => setCollapsed(!open)}>
                    <SheetContent side="left" className="p-0 w-64 border-r border-zinc-300 dark:border-zinc-800">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">Main navigation sidebar</SheetDescription>
                        <div className="h-screen flex flex-col">
                            <SidebarContent showMobileClose={true} />
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            {/* Desktop: Sticky Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex h-screen border-r border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out flex-col z-40 sticky top-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)]",
                    collapsed ? "w-[72px]" : "w-64"
                )}
            >
                <SidebarContent showMobileClose={false} />
            </aside>
        </>
    );
}
