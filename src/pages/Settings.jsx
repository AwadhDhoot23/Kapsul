import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ThemeLandingPreview } from '@/components/settings/ThemeLandingPreview';
import { GlobalSearch } from '@/components/modals/GlobalSearch';
import { getUserItems } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { GridPattern } from '@/components/ui/grid-pattern';
import { LogOut, Trash2, Download, ShieldAlert, Monitor, User, HardDrive, Edit2, Check, Info, Globe, Zap, Command } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { user, signOut, updateProfile } = useAuthStore();
    const [stats, setStats] = useState({ total: 0 });
    const [userItems, setUserItems] = useState([]);

    // UI State
    const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const navigate = useNavigate();

    // Profile Edit State
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState(user?.displayName || '');
    const nameInputRef = useRef(null);

    useEffect(() => {
        if (user?.displayName) setNameDraft(user.displayName);
    }, [user?.displayName]);

    // Keyboard Shortcuts (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsGlobalSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleNewItem = (tab) => {
        navigate('/?open=capture');
    };

    // Fetch items for stats + export
    useEffect(() => {
        if (!user?.uid) return;
        const unsubscribe = getUserItems(user.uid, {}, (items) => {
            setStats({ total: items.length });
            setUserItems(items);
        });
        return () => unsubscribe();
    }, [user?.uid]);

    // Cinematic Fade Transition
    const handleThemeChange = (newTheme) => {
        if (theme === newTheme || isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setTheme(newTheme);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
        }, 300);
    };

    const handleSaveName = async () => {
        if (!nameDraft.trim()) return;
        setIsEditingName(false);
        if (nameDraft === user.displayName) return;

        const result = await updateProfile({ displayName: nameDraft.trim() });
        if (result.success) {
            toast.success('Profile updated');
        } else {
            toast.error('Failed to update profile');
            setNameDraft(user.displayName);
        }
    };

    const handleExportData = () => {
        if (userItems.length === 0) {
            toast.error("No items to export.");
            return;
        }

        toast.promise(
            new Promise((resolve) => {
                setTimeout(() => {
                    const dataStr = JSON.stringify(userItems, null, 2);
                    const blob = new Blob([dataStr], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `kapsul-backup-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    resolve();
                }, 1000);
            }),
            {
                loading: 'Preparing your data...',
                success: 'Backup downloaded!',
                error: 'Export failed'
            }
        );
    };

    const handleDeleteAll = async () => {
        if (!user?.uid) return;

        if (window.confirm("ARE YOU SURE?\n\nThis will permanently delete ALL your captured items. This action cannot be undone.")) {
            try {
                const { deleteAllUserItems } = await import('@/lib/firestore');
                await deleteAllUserItems(user.uid);
                toast.success("Vault purged successfully");
                // Force a small delay to ensure firestore propagation before redirect
                setTimeout(() => {
                    navigate('/');
                }, 500);
            } catch (error) {
                console.error("Purge failed:", error);
                toast.error("Failed to purge vault. Please try again.");
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            }
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden relative transition-colors duration-500">

            {/* Cinematic Fade Overlay */}
            <div
                className={`fixed inset-0 z-[100] pointer-events-none bg-black transition-opacity duration-300 ${isTransitioning ? 'opacity-20' : 'opacity-0'}`}
            />

            {/* Background Grid Pattern - FIXED and CONSISTENT */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
                <GridPattern
                    width={40}
                    height={40}
                    className="text-zinc-300/40 dark:text-zinc-800/40 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
                />
            </div>

            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onNewItem={handleNewItem} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                <Header
                    onMenuClick={() => setCollapsed(false)}
                    onSearchClick={() => setIsGlobalSearchOpen(true)}
                />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex-1 overflow-y-auto p-4 md:p-12 pb-32"
                >
                    <div className="max-w-6xl mx-auto space-y-16">

                        {/* Header Section */}
                        <motion.div variants={sectionVariants} className="space-y-4">
                            <h1 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 font-serif">Settings</h1>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Configure your personal second brain environment.</p>
                            <Separator className="bg-zinc-300 dark:bg-zinc-800" />
                        </motion.div>

                        {/* 1. Profile Section */}
                        <motion.section variants={sectionVariants} className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 shadow-sm">
                                    <User className="w-4 h-4" />
                                </div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-[11px]">Identity</h2>
                            </div>

                            <Card className="border-2 border-zinc-300 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-950 overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:border-zinc-400 dark:hover:border-zinc-700">
                                <CardContent className="p-0 flex flex-col sm:flex-row items-stretch">
                                    <div className="p-10 flex flex-col sm:flex-row items-center gap-10 flex-1">
                                        <Avatar className="h-28 w-28 border-4 border-zinc-100 dark:border-zinc-900 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                            <AvatarImage src={user?.photoURL} />
                                            <AvatarFallback className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-black text-4xl uppercase">
                                                {user?.displayName?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="space-y-4 text-center sm:text-left flex-1 min-w-0">
                                            {isEditingName ? (
                                                <div className="flex items-center gap-3 justify-center sm:justify-start">
                                                    <Input
                                                        ref={nameInputRef}
                                                        value={nameDraft}
                                                        onChange={(e) => setNameDraft(e.target.value)}
                                                        className="h-12 font-bold text-2xl max-w-[300px] border-zinc-300 focus-visible:ring-zinc-900 focus-visible:ring-offset-0 bg-zinc-50 dark:bg-zinc-900"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                                    />
                                                    <Button size="icon" variant="default" onClick={handleSaveName} className="h-12 w-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black">
                                                        <Check className="w-6 h-6" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center sm:justify-start gap-4 group/name cursor-pointer" onClick={() => setIsEditingName(true)}>
                                                    <h3 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">{user?.displayName || 'User'}</h3>
                                                    <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 opacity-0 group-hover/name:opacity-100 transition-all">
                                                        <Edit2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm font-bold text-zinc-500">
                                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-black">{user?.email}</span>
                                                <span className="hidden sm:inline opacity-20">•</span>
                                                <span className="text-[10px] uppercase tracking-widest">{stats.total} saved items in vault</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 sm:border-l-2 border-t-2 sm:border-t-0 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={signOut}
                                            className="font-black text-[11px] uppercase tracking-[0.2em] border-2 border-zinc-300 dark:border-zinc-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all h-14 px-8 shadow-sm rounded-full"
                                        >
                                            <LogOut className="w-5 h-5 mr-3" />
                                            Disconnect Session
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.section>

                        {/* 2. Appearance Section */}
                        <motion.section variants={sectionVariants} className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 shadow-sm">
                                    <Monitor className="w-4 h-4" />
                                </div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-[11px]">Visual Mode</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                <motion.div whileHover={{ y: -5 }} className="space-y-4">
                                    <div className="p-2 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] transition-all hover:border-zinc-900 dark:hover:border-zinc-100 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl">
                                        <ThemeLandingPreview
                                            mode="light"
                                            isActive={theme === 'light'}
                                            onClick={() => handleThemeChange('light')}
                                        />
                                    </div>
                                    <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Light Minimal</p>
                                </motion.div>
                                <motion.div whileHover={{ y: -5 }} className="space-y-4">
                                    <div className="p-2 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] transition-all hover:border-zinc-900 dark:hover:border-zinc-100 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl">
                                        <ThemeLandingPreview
                                            mode="dark"
                                            isActive={theme === 'dark'}
                                            onClick={() => handleThemeChange('dark')}
                                        />
                                    </div>
                                    <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Deep Space</p>
                                </motion.div>
                            </div>
                        </motion.section>

                        {/* 3. About Section (The Project) */}
                        <motion.section variants={sectionVariants} className="space-y-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 shadow-sm">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-[11px]">About Kapsul OS</h2>
                            </div>

                            <Card className="border-2 border-zinc-300 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-950 overflow-hidden relative rounded-[2.5rem]">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
                                    <Command className="w-64 h-64" />
                                </div>
                                <CardContent className="p-12 space-y-12 relative z-10">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 mb-1">
                                                <Command className="w-10 h-10 text-zinc-900 dark:text-zinc-100" strokeWidth={3} />
                                                <h3 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tighter">KAPSUL <span className="text-zinc-300 dark:text-zinc-700 font-normal not-italic tracking-normal lowercase">v1.1</span></h3>
                                            </div>
                                            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed italic font-serif">
                                                A streamlined digital container designed to capture, organize, and synthesize your digital universe with zero friction.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-pulse" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Core: Optimal</span>
                                            </div>
                                            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                <Globe className="w-4 h-4" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Environment: Live</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Platform', value: 'React Engine', icon: Info },
                                            { label: 'Database', value: 'Firebase Edge', icon: Zap },
                                            { label: 'Security', value: 'TLS Cloud', icon: ShieldAlert }
                                        ].map((item, i) => (
                                            <div key={i} className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center gap-6 group hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all duration-300">
                                                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover:scale-110 transition-transform">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest mb-1">{item.label}</span>
                                                    <span className="text-sm font-bold tracking-tight">{item.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-zinc-100 dark:bg-white/5 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-zinc-200 dark:border-zinc-800">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <h4 className="font-black text-xl tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Global Command</h4>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Type {">"} in Search for system actions.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <kbd className="h-10 px-4 flex items-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-black shadow-sm tracking-widest">CTRL + K</kbd>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Explore Vault</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.section>

                        {/* 4. Data & Safety Control */}
                        <motion.section variants={sectionVariants} className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 shadow-sm">
                                    <HardDrive className="w-4 h-4" />
                                </div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-[11px]">Disaster Recovery</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Card className="border-2 border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all cursor-pointer group shadow-sm rounded-[2rem] overflow-hidden" onClick={handleExportData}>
                                        <CardHeader className="p-10">
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-all duration-300">
                                                <Download className="w-7 h-7" />
                                            </div>
                                            <CardTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">Export Corpus</CardTitle>
                                            <CardDescription className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Generate Full JSON Infrastructure Backup</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Card className="border-2 border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-red-600 dark:hover:border-red-500 transition-all cursor-pointer group shadow-sm rounded-[2rem] overflow-hidden" onClick={handleDeleteAll}>
                                        <CardHeader className="p-10">
                                            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white dark:group-hover:bg-red-500 dark:group-hover:text-white transition-all duration-300">
                                                <Trash2 className="w-7 h-7" />
                                            </div>
                                            <CardTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">Purge Vault</CardTitle>
                                            <CardDescription className="text-xs font-bold text-red-900/40 uppercase tracking-widest">Permanent Deletion Sequence • No Recovery</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </motion.div>
                            </div>
                        </motion.section>

                        <div className="text-center pt-12 pb-20">
                            <p className="text-[11px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-[0.6em] mb-4">
                                Engineered with Absolute Focus
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <span className="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
                                <span className="text-[11px] font-serif italic text-zinc-300 dark:text-zinc-700">Kapsul OS / build 24.11</span>
                                <span className="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Modals */}
            <GlobalSearch
                isOpen={isGlobalSearchOpen}
                onClose={() => setIsGlobalSearchOpen(false)}
                onOpenCapture={(tab) => { navigate('/'); }}
                onFocusItem={(item) => navigate('/')}
            />
        </div>
    );
}
