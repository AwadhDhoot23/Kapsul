import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Clock, Link2, FileText, Video, ListVideo, Plus, Settings, X, ArrowRight, CornerDownLeft, Moon, Sun, Home, Trash2, Command, ArrowLeft, ArrowDown, ArrowUp, Zap, Keyboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getUserItems } from '@/lib/firestore';
import { MOCK_ITEMS } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/providers/ThemeProvider';

export function GlobalSearch({ isOpen, onClose, onOpenCapture, onFocusItem }) {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const user = useAuthStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState([]);
    const [recentHistory, setRecentHistory] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

    const resultsRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch items when open
    useEffect(() => {
        if (!isOpen) return;

        if (!user?.uid) {
            setItems(MOCK_ITEMS);
            return;
        }

        const unsubscribe = getUserItems(user.uid, {}, (fetchedItems) => {
            setItems(fetchedItems);
        });
        return () => unsubscribe();
    }, [user?.uid, isOpen]);

    const systemCommands = [
        { id: 'cmd-theme', title: 'Toggle Theme', icon: theme === 'dark' ? Sun : Moon, description: 'Switch between light and dark mode', isCommand: true, group: 'System', keywords: ['theme', 'mode', 'dark', 'light'] },
        { id: 'cmd-capture', title: 'Quick Capture', icon: Plus, description: 'Add a new item to your library', isCommand: true, group: 'Action', keywords: ['add', 'new', 'create', 'capture'] },
        { id: 'cmd-settings', title: 'Settings', icon: Settings, description: 'Manage your account preferences', isCommand: true, group: 'System', keywords: ['settings', 'config', 'preferences'] },
        { id: 'cmd-library', title: 'Go to Everything', icon: Home, description: 'View all your nodes and captures', isCommand: true, group: 'Navigation', keywords: ['home', 'library', 'dashboard', 'all'] },
    ];

    // Search results logic
    const results = useMemo(() => {
        if (!searchQuery) return [];
        const lowerQuery = searchQuery.toLowerCase().trim();

        // 1. Filter Commands - STRICT CHECK
        const isCommandSearch = lowerQuery.startsWith('>');
        const cleanQuery = isCommandSearch ? lowerQuery.slice(1).trim() : '';

        // If it starts with '>', it is EXCLUSIVELY a command search
        if (isCommandSearch) {
            return systemCommands.filter(cmd =>
                !cleanQuery ||
                cmd.title.toLowerCase().includes(cleanQuery) ||
                cmd.keywords.some(k => k.includes(cleanQuery))
            ).slice(0, 12);
        }

        // 2. Filter Items (Standard Text Match)
        const queryTerms = lowerQuery.split(/\s+/).filter(Boolean);

        const matchedItems = items.filter(item => {
            // Construct a rich searchable corpus
            let searchableText = [
                item.title,
                item.description,
                item.url,
                item.channelTitle,
                item.type,
                ...(item.tags || []),
            ].filter(Boolean).join(' ').toLowerCase();

            // Add derived keywords from URL (e.g. "github" from github.com, "youtube" from youtu.be)
            if (item.url) {
                try {
                    const urlObj = new URL(item.url);
                    const hostname = urlObj.hostname;
                    const domainParts = hostname.replace('www.', '').split('.');
                    if (domainParts.length > 0) {
                        searchableText += ' ' + domainParts[0]; // e.g. "github", "medium", "twitter"
                    }
                    if (hostname.includes('youtu.be') || hostname.includes('youtube')) {
                        searchableText += ' youtube video';
                    }
                } catch (e) {
                    // Ignore invalid URLs
                }
            }

            // Check if ALL query terms exist in the searchable corpus
            return queryTerms.every(term => searchableText.includes(term));
        });

        return matchedItems.slice(0, 40);
    }, [items, searchQuery, systemCommands]);

    // Handle Item Selection
    const handleSelect = (item) => {
        if (item.isCommand) {
            // Execute Command
            if (item.id === 'cmd-theme') setTheme(theme === 'dark' ? 'light' : 'dark');
            if (item.id === 'cmd-capture') { onClose(); onOpenCapture(); }
            if (item.id === 'cmd-settings') {
                onClose();
                if (user) {
                    navigate('/settings');
                } else {
                    toast.error("Sign in required to access Settings");
                }
            }
            if (item.id === 'cmd-library') { onClose(); navigate('/'); }

            if (item.id !== 'cmd-capture' && item.id !== 'cmd-settings' && item.id !== 'cmd-library') {
                // Keep open for theme toggle? Or close? User preference usually close.
                // Let's close for now unless it's a toggle.
                // Actually theme toggle is nice to see happen, but let's close for consistency.
            }
        } else {
            // Select Item
            addToHistory(item);
            onFocusItem(item);
            onClose();
        }
    };

    const addToHistory = (item) => {
        setRecentHistory(prev => {
            const temp = prev.filter(i => i.id !== item.id);
            return [item, ...temp].slice(0, 4);
        });
    };

    const removeFromHistory = (e, id) => {
        e.stopPropagation();
        setRecentHistory(prev => prev.filter(i => i.id !== id));
    };

    // Keyboard Navigation (2D)
    const handleKeyDown = (e) => {
        // Dynamic columns for commands (2 usually) vs items (3 usually)
        // Hardcoded based on CSS grid below
        const isCommandMode = searchQuery.startsWith('>');
        const width = window.innerWidth;

        let columns = 1;
        if (width >= 640) columns = 2; // sm:grid-cols-2
        if (!isCommandMode && width >= 768) columns = 3; // md:grid-cols-3

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + columns, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - columns, 0));
        } else if (e.key === 'Enter' && results.length > 0) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && resultsRef.current.children[selectedIndex]) {
            resultsRef.current.children[selectedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [selectedIndex]);

    // Helper functions
    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Video className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />;
            case 'playlist': return <ListVideo className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />;
            case 'link': return <Link2 className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />;
            case 'note': return <FileText className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />;
            default: return <FileText className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />;
        }
    };

    const getThumbnail = (item) => {
        if (item.type === 'video' || item.type === 'playlist') return item.thumbnail;
        if (item.type === 'link' && item.image) return item.image;
        return 'Note'; // Placeholder for note/no-image
    };

    const handleShortcutsClose = () => setIsShortcutsOpen(false);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-4xl w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] p-0 gap-0 border-0 sm:border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-950 overflow-hidden shadow-none sm:shadow-2xl flex flex-col">
                    <div className="sr-only">
                        <DialogTitle>Search</DialogTitle>
                        <DialogDescription>Search your knowledge base</DialogDescription>
                    </div>

                    {/* Search Input Area */}
                    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black relative z-10 shrink-0">
                        <button
                            onClick={onClose}
                            className="sm:hidden p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <Search className="hidden sm:block w-6 h-6 text-zinc-400 shrink-0" strokeWidth={2.5} />
                        <Input
                            ref={inputRef}
                            placeholder="Search Anything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 border-0 shadow-none focus-visible:ring-0 text-lg sm:text-xl font-medium px-0 bg-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100 h-auto"
                            autoFocus
                        />
                        <div className="flex items-center gap-1 sm:gap-3">
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                            <button
                                onClick={() => setIsShortcutsOpen(true)}
                                className="hidden sm:block p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                <Keyboard className="w-5 h-5" />
                            </button>
                            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                                <span className="text-xs font-bold text-zinc-500">ESC</span>
                            </div>
                        </div>
                    </div>


                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-zinc-50/50 dark:bg-zinc-950/50 relative">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                        <AnimatePresence mode="wait">
                            {!searchQuery ? (
                                <motion.div
                                    key="default-view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative z-10 p-2 space-y-10 max-w-3xl mx-auto w-full pt-4"
                                >
                                    {/* Recent History */}
                                    {recentHistory.length > 0 && (
                                        <section>
                                            <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Recent History
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6 border-b border-zinc-200 dark:border-zinc-800/50">
                                                {recentHistory.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleSelect(item)}
                                                        className="group flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:shadow-md cursor-pointer transition-all"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
                                                                {getIcon(item.type)}
                                                            </div>
                                                            <div className="flex flex-col truncate">
                                                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.title || 'Untitled'}</span>
                                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{item.type}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => removeFromHistory(e, item.id)}
                                                            className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Quick Actions */}
                                    <section>
                                        <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2">
                                            Quick Actions
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <button
                                                onClick={() => { onClose(); onOpenCapture('video'); }}
                                                className="group flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-zinc-900/50 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:shadow-xl backdrop-blur-sm shadow-sm relative overflow-hidden"
                                            >
                                                <div className="p-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">Add Item</span>
                                            </button>
                                            <button
                                                onClick={() => { onClose(); navigate('/'); }}
                                                className="group flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-zinc-900/50 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:shadow-xl backdrop-blur-sm shadow-sm relative overflow-hidden"
                                            >
                                                <div className="p-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                                    <Home className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">Everything</span>
                                            </button>
                                            <button
                                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                className="group flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-zinc-900/50 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:shadow-xl backdrop-blur-sm shadow-sm relative overflow-hidden"
                                            >
                                                <div className="p-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                                    <Moon className="w-6 h-6 hidden dark:block" />
                                                    <Sun className="w-6 h-6 block dark:hidden" />
                                                </div>
                                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">Theme</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    if (user) {
                                                        navigate('/settings');
                                                    } else {
                                                        toast.error("Sign in required to access Settings");
                                                    }
                                                }}
                                                className="group flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-zinc-900/50 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:shadow-xl backdrop-blur-sm shadow-sm relative overflow-hidden"
                                            >
                                                <div className="p-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                                    <Settings className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">Settings</span>
                                            </button>
                                        </div>
                                    </section>

                                    {/* Infinite Feature Marquee */}
                                    <div className="pt-12 overflow-hidden select-none relative pb-4">
                                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent z-10" />
                                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent z-10" />
                                        <motion.div
                                            className="flex gap-12 whitespace-nowrap"
                                            animate={{ x: [0, -600] }}
                                            transition={{
                                                repeat: Infinity,
                                                ease: "linear",
                                                duration: 30
                                            }}
                                        >
                                            {[...Array(4)].map((_, i) => (
                                                <React.Fragment key={i}>
                                                    <span className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600 font-bold text-[11px] uppercase tracking-[0.2em]">
                                                        <Plus className="w-3.5 h-3.5" /> Quick Capture
                                                    </span>
                                                    <span className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600 font-bold text-[11px] uppercase tracking-[0.2em]">
                                                        <Search className="w-3.5 h-3.5" /> Global Search
                                                    </span>
                                                    <span className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600 font-bold text-[11px] uppercase tracking-[0.2em]">
                                                        <Command className="w-3.5 h-3.5" /> System Command
                                                    </span>
                                                    <span className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600 font-bold text-[11px] uppercase tracking-[0.2em]">
                                                        <Settings className="w-3.5 h-3.5" /> Preferences
                                                    </span>
                                                </React.Fragment>
                                            ))}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ) : results.length > 0 ? (
                                <motion.div
                                    key="search-results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative z-10 space-y-6"
                                >
                                    <div className="flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800 pb-4">
                                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] pl-1">
                                            {searchQuery.startsWith('>') ? 'System Suggestions' : `Results (${results.length})`}
                                        </div>
                                        {searchQuery.startsWith('>') && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                <Zap className="w-3 h-3 text-amber-500" /> Power Mode
                                            </div>
                                        )}
                                    </div>

                                    <div className={cn(
                                        "grid gap-4",
                                        searchQuery.startsWith('>') ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                                    )} ref={resultsRef}>
                                        {results.map((item, index) => {
                                            const isSelected = selectedIndex === index;

                                            if (item.isCommand) {
                                                return (
                                                    <motion.button
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        onClick={() => handleSelect(item)}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                        className={cn(
                                                            "group relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                                                            isSelected
                                                                ? "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xl scale-[1.02] z-20"
                                                                : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-80 hover:border-zinc-900 dark:hover:border-zinc-100 hover:scale-[1.02] hover:shadow-xl hover:opacity-100 hover:z-10"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "p-3 rounded-xl transition-all duration-300",
                                                            isSelected
                                                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black scale-110 rotate-3"
                                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                                        )}>
                                                            <item.icon className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                                                                    {item.title}
                                                                </span>
                                                                <Badge variant="outline" className="text-[9px] h-4 px-1 border-zinc-200 dark:border-zinc-800 text-zinc-400">
                                                                    {item.group}
                                                                </Badge>
                                                            </div>
                                                            <p className={cn(
                                                                "text-[11px] mt-1 font-medium transition-colors",
                                                                isSelected ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"
                                                            )}>
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                        <ArrowRight className={cn(
                                                            "w-5 h-5 ml-auto transition-all self-center",
                                                            isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                                                        )} />
                                                    </motion.button>
                                                );
                                            }

                                            const thumb = getThumbnail(item);
                                            const isNote = thumb === 'Note';
                                            let displayDomain = '';
                                            if (item.type === 'link' && item.url) {
                                                try { displayDomain = new URL(item.url).hostname.replace('www.', ''); } catch (e) { }
                                            }

                                            return (
                                                <motion.button
                                                    key={item.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.1, delay: index * 0.01 }}
                                                    onClick={() => handleSelect(item)}
                                                    onMouseEnter={() => setSelectedIndex(index)} // Only sets index, doesn't force render unless selectedIndex changes
                                                    className={cn(
                                                        "group relative flex flex-col overflow-hidden text-left transition-all duration-200 h-full rounded-xl border-2",
                                                        isSelected
                                                            ? "border-zinc-900 dark:border-zinc-100 shadow-2xl scale-[1.02] z-20 bg-white dark:bg-zinc-900"
                                                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:scale-[1.02] hover:shadow-xl hover:z-10 focus:outline-none"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "aspect-video w-full relative overflow-hidden flex items-center justify-center border-b-2",
                                                        isSelected ? "border-zinc-900/10 dark:border-zinc-100/10" : "border-zinc-200 dark:border-zinc-800",
                                                        isNote ? "bg-zinc-50 dark:bg-zinc-900/30" : "bg-zinc-100 dark:bg-zinc-800"
                                                    )}>
                                                        {thumb && thumb !== 'Note' ? (
                                                            <img
                                                                src={thumb}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-3 p-5 text-center">
                                                                {getIcon(item.type)}
                                                                {isNote && item.preview && (
                                                                    <p className="text-[10px] text-zinc-400 font-medium line-clamp-3 leading-relaxed px-2">
                                                                        {item.preview}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 flex flex-col flex-1 gap-1.5 relative z-10 bg-white/50 dark:bg-zinc-900/50">
                                                        <h4 className="font-bold text-sm leading-tight line-clamp-2 text-zinc-900 dark:text-zinc-50" title={item.title}>
                                                            {item.title || 'Untitled'}
                                                        </h4>
                                                        {displayDomain ? (
                                                            <div className="flex items-center gap-2 mt-auto pt-2">
                                                                <img
                                                                    src={`https://www.google.com/s2/favicons?domain=${new URL(item.url || 'http://google.com').hostname}&sz=32`}
                                                                    alt="favicon"
                                                                    className="w-4 h-4 rounded-sm opacity-80"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                                <span className="text-[11px] font-bold tracking-tight truncate text-zinc-500">{displayDomain}</span>
                                                            </div>
                                                        ) : item.createdAt ? (
                                                            <div className="text-[9px] font-black mt-auto pt-1 uppercase tracking-widest text-zinc-400">
                                                                ADDED {new Date(item.createdAt?.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Power Mode Tip */}
                                    {searchQuery.startsWith('>') && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="p-6 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center"
                                        >
                                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                                Pro Tip: You can trigger commands instantly by typing <span className="text-zinc-900 dark:text-zinc-100 bg-white dark:bg-black px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">{'>'} theme</span> and hitting Enter
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="no-results"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative z-10 pt-24 pb-16 flex flex-col items-center justify-center text-center max-w-sm mx-auto"
                                >
                                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 border-2 border-zinc-200 dark:border-zinc-800 rotate-6">
                                        <Search className="w-8 h-8 text-zinc-400" strokeWidth={3} />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
                                        NOT FOUND
                                    </h3>
                                    <p className="text-zinc-500 font-medium text-sm">
                                        Type <span className="text-zinc-900 dark:text-zinc-100 font-bold">{'>'}</span> for system commands or try a different keyword.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Tip */}
                    <div className="px-6 py-4 bg-white dark:bg-black border-t-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-zinc-400 relative z-20">
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2 group cursor-default">
                                <span className="w-6 h-6 bg-zinc-100 dark:bg-zinc-900 rounded border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[11px] font-black text-zinc-900 dark:text-zinc-100">↵</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Select Item</span>
                            </span>
                            <span className="flex items-center gap-2 group cursor-default">
                                <span className="w-10 h-6 bg-zinc-100 dark:bg-zinc-900 rounded border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[14px] leading-none text-zinc-900 dark:text-zinc-100">↑↓</span>
                                <span className="w-10 h-6 bg-zinc-100 dark:bg-zinc-900 rounded border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[14px] leading-none text-zinc-900 dark:text-zinc-100">←→</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Navigate</span>
                            </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-zinc-300 dark:text-zinc-700">
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <span className="text-[9px] font-black tracking-[0.3em] uppercase">SYSTEM COMMANDS ENABLED</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ShortcutsModal isOpen={isShortcutsOpen} onClose={handleShortcutsClose} />
        </>
    );
}

function ShortcutsModal({ isOpen, onClose }) {
    const shortcuts = [
        {
            section: 'Global', items: [
                { keys: ['Ctrl', 'K'], label: 'Open Command Center' },
                { keys: ['?'], label: 'Show Help Modal' },
                { keys: ['ESC'], label: 'Close Modal' },
            ]
        },
        {
            section: 'Navigation', items: [
                { keys: ['↑', '↓'], label: 'Navigate Grid' },
                { keys: ['←', '→'], label: 'Navigate 2D Results' },
                { keys: ['↵'], label: 'Select / Execute' },
            ]
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl p-0 border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-950 overflow-hidden shadow-3xl">
                <div className="px-8 py-6 border-b-2 border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-black/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg">
                            <Keyboard className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-xl font-black tracking-tight">Shortcuts Hub</DialogTitle>
                    </div>
                </div>

                <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {shortcuts.map((group, idx) => (
                        <motion.div
                            key={group.section}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4">
                                {group.section}
                            </h3>
                            <div className="space-y-3">
                                {group.items.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between group">
                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                                            {item.label}
                                        </span>
                                        <div className="flex gap-1.5">
                                            {item.keys.map((key) => (
                                                <kbd key={key} className="min-w-[28px] h-7 flex items-center justify-center px-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-[11px] font-black text-zinc-900 dark:text-zinc-100 shadow-[0_2px_0_0_rgb(228,228,231)] dark:shadow-[0_2px_0_0_rgb(39,39,42)]">
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="px-8 py-4 bg-zinc-50 dark:bg-black/50 border-t-2 border-zinc-100 dark:border-zinc-900 flex justify-center">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3 text-amber-500" /> Master the interface with hotkeys
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
