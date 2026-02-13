import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { GridPattern } from '@/components/ui/grid-pattern';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Video, Link as LinkIcon, FileText, ListVideo,
    ChevronDown, Filter, CheckCircle2, Trash2, X,
    Search, Info
} from 'lucide-react';
import { VideoCard } from '@/components/cards/VideoCard';
import { LinkCard } from '@/components/cards/LinkCard';
import { NoteCard } from '@/components/cards/NoteCard';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { SmartCaptureModal } from '@/components/modals/SmartCaptureModal';
import { GlobalSearch } from '@/components/modals/GlobalSearch';
import { FocusMode } from '@/components/modals/FocusMode';
import { useAuthStore } from '@/store/authStore';
import { getUserItems, updateItem, deleteItem } from '@/lib/firestore';
import { MOCK_ITEMS } from '@/lib/mockData';
import { toast } from 'sonner';
import Masonry from 'react-masonry-css';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Dashboard() {
    const user = useAuthStore((state) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // UI State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
    const [captureInitialTab, setCaptureInitialTab] = useState('video');
    const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
    const [focusItem, setFocusItem] = useState(null);

    // Filter & View States
    const [viewMode, setViewMode] = useState('active'); // 'active' | 'completed'
    const [filterType, setFilterType] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedItems, setSelectedItems] = useState([]);
    const [bulkSelectMode, setBulkSelectMode] = useState(false);

    // Data State
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        if (!user?.uid) {
            // GUEST MODE: Load mock data
            setItems(MOCK_ITEMS);
            setIsLoading(false);
            return;
        }

        // USER MODE: Fetch from Firestore
        const unsubscribe = getUserItems(user.uid, {}, (fetchedItems) => {
            setItems(fetchedItems);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user?.uid]);


    // Keyboard Shortcuts (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                e.stopPropagation();
                setIsGlobalSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, []);

    // Handle initial modal state from URL
    useEffect(() => {
        if (searchParams.get('open') === 'capture') {
            setIsCaptureModalOpen(true);
            // Clean up the URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('open');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Derived Lists
    const activeItems = useMemo(() => items.filter(i => !i.isCompleted), [items]);
    const completedItems = useMemo(() => items.filter(i => i.isCompleted), [items]);

    const filteredAndSortedItems = useMemo(() => {
        const baseSource = viewMode === 'completed' ? completedItems : activeItems;
        let result = [...baseSource];


        if (filterType !== 'all') result = result.filter(item => item.type === filterType);

        result.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;
            if (sortOrder === 'newest') return dateB - dateA;
            if (sortOrder === 'oldest') return dateA - dateB;
            if (sortOrder === 'a-z') return (a.title || '').localeCompare(b.title || '');
            return 0;
        });

        return result;
    }, [activeItems, completedItems, viewMode, filterType, sortOrder]);

    // Handlers

    // Helper for handling Guest vs User actions
    const handleAction = async (actionFn, successMessage, errorMessage) => {
        if (!user) {
            // Guest Mode: Update local state
            // This expects actionFn to return the new items list or we handle it manually
            // Since the handlers below are specific, let's just make them handle both.
            return;
        }
        try {
            await actionFn();
            if (successMessage) toast.success(successMessage);
        } catch (error) {
            console.error(error);
            if (errorMessage) toast.error(errorMessage);
        }
    };

    const toggleSelection = (id) => {
        if (!bulkSelectMode) setBulkSelectMode(true);
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Update Item Handler (Pin, Complete, etc.)
    const handleUpdateItem = async (id, updates) => {
        if (!user) {
            // Guest Mode: Local Update
            setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
            toast.success('Updated locally (Guest Mode)');
            return;
        }
        // User Mode: Firestore Update
        try {
            await updateItem(id, updates);
        } catch (error) {
            toast.error('Failed to update item');
        }
    };

    // Delete Item Handler
    const handleDeleteItem = async (id) => {
        if (!confirm('Delete this item?')) return;

        if (!user) {
            // Guest Mode: Local Delete
            setItems(prev => prev.filter(item => item.id !== id));
            toast.success('Deleted locally (Guest Mode)');
            return;
        }
        // User Mode: Firestore Delete
        try {
            await deleteItem(id);
            toast.success('Item deleted');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const clearSelection = () => {
        setSelectedItems([]);
        setBulkSelectMode(false);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedItems.length} items?`)) return;

        if (!user) {
            // Guest Mode
            setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
            toast.success(`Deleted ${selectedItems.length} items (Guest Mode)`);
            clearSelection();
            return;
        }

        try {
            await Promise.all(selectedItems.map(id => deleteItem(id)));
            toast.success(`Deleted ${selectedItems.length} items`);
            clearSelection();
        } catch (error) { toast.error('Failed to delete items'); }
    };

    const handleBulkStatusChange = async () => {
        const newStatus = viewMode !== 'completed';

        if (!user) {
            // Guest Mode
            setItems(prev => prev.map(item =>
                selectedItems.includes(item.id) ? { ...item, isCompleted: newStatus } : item
            ));
            toast.success(`Updated ${selectedItems.length} items (Guest Mode)`);
            clearSelection();
            return;
        }

        try {
            await Promise.all(selectedItems.map(id => updateItem(id, { isCompleted: newStatus })));
            toast.success(`Updated ${selectedItems.length} items`);
            clearSelection();
        } catch (error) { toast.error('Failed to update items'); }
    };

    // Hero Section - QUICK ACTIONS (Matched to reference image)
    const HeroSection = () => {
        const openModalWithTab = (tab) => {
            setCaptureInitialTab(tab);
            setIsCaptureModalOpen(true);
        };

        const buttons = [
            { id: 'video', icon: Video, label: 'Save Video' },
            { id: 'link', icon: LinkIcon, label: 'Save Link' },
            { id: 'note', icon: FileText, label: 'Write Note' },
            { id: 'playlist', icon: ListVideo, label: 'Save Playlist' },
        ];

        return (
            <div className="mb-12 p-8 sm:p-12 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] relative overflow-hidden group/hero">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-4xl text-zinc-900 dark:text-zinc-100 mb-2">Quick Actions</h2>
                    <p className="text-sm text-zinc-500 font-medium tracking-tight opacity-70">Start building your knowledge base</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
                    {buttons.map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => openModalWithTab(btn.id)}
                            className="flex flex-col items-center justify-center p-6 sm:p-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-zinc-900 dark:hover:border-zinc-100 transition-all group/btn shadow-sm hover:shadow-xl hover:-translate-y-1"
                        >
                            <btn.icon className="w-6 h-6 text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-zinc-100 mb-4 transition-all duration-300" />
                            <span className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-zinc-100 transition-colors uppercase tracking-[0.15em] text-center">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Filter Toolbar
    const FilterToolbar = () => {
        const sourceItems = viewMode === 'completed' ? completedItems : activeItems;
        const types = [
            { value: 'all', label: 'All', count: sourceItems.length },
            { value: 'video', label: 'Video', count: sourceItems.filter(i => i.type === 'video').length },
            { value: 'link', label: 'Link', count: sourceItems.filter(i => i.type === 'link').length },
            { value: 'note', label: 'Note', count: sourceItems.filter(i => i.type === 'note').length },
            { value: 'playlist', label: 'Playlist', count: sourceItems.filter(i => i.type === 'playlist').length },
        ];

        return (
            <div className="sticky top-16 z-20 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl -mx-6 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 p-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl w-full sm:w-auto">
                        <button
                            onClick={() => { setViewMode('active'); clearSelection(); }}
                            className={cn(
                                "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2",
                                viewMode === 'active' ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            )}
                        >
                            Active <Badge variant="secondary" className="bg-zinc-200 dark:bg-zinc-800 text-[10px] px-1.5 h-4">{activeItems.length}</Badge>
                        </button>
                        <button
                            onClick={() => { setViewMode('completed'); clearSelection(); }}
                            className={cn(
                                "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2",
                                viewMode === 'completed' ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            )}
                        >
                            Completed <Badge variant="secondary" className="bg-zinc-200 dark:bg-zinc-800 text-[10px] px-1.5 h-4">{completedItems.length}</Badge>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {types.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setFilterType(type.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2",
                                    filterType === type.value ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100" : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100"
                                )}
                            >
                                {type.label} <span className="opacity-50 ml-1">({type.count})</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 text-xs font-bold border-zinc-200 dark:border-zinc-800">
                                    Sort: {sortOrder === 'newest' ? 'Newest' : sortOrder === 'oldest' ? 'Oldest' : 'A-Z'}
                                    <ChevronDown className="ml-2 w-3 h-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => setSortOrder('newest')}>Newest</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortOrder('oldest')}>Oldest</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortOrder('a-z')}>A-Z</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        );
    };

    // Bulk Actions Bar - IN FLOW POSITIONING

    const BentoGrid = () => (
        <Masonry
            breakpointCols={{ default: 4, 1280: 3, 1024: 3, 768: 2, 640: 1 }}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
        >
            {filteredAndSortedItems.map(item => {
                const { key, ...restItem } = item;
                const cardProps = {
                    ...restItem,
                    onPin: (id) => handleUpdateItem(id, { isPinned: !item.isPinned }),
                    onDelete: handleDeleteItem,
                    onMarkComplete: (id) => handleUpdateItem(id, { isCompleted: !item.isCompleted }),
                    onClick: () => bulkSelectMode ? toggleSelection(item.id) : setFocusItem(item),
                    isSelected: selectedItems.includes(item.id),
                    onSelect: () => toggleSelection(item.id),
                    selectionMode: bulkSelectMode
                };
                return (
                    <div key={item.id} className="mb-4">
                        {item.type === 'video' && <VideoCard {...cardProps} />}
                        {item.type === 'playlist' && <PlaylistCard {...cardProps} />}
                        {item.type === 'link' && <LinkCard {...cardProps} />}
                        {item.type === 'note' && <NoteCard {...cardProps} />}
                    </div>
                );
            })}
        </Masonry>
    );

    return (
        <div className="flex min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-zinc-100 dark:selection:bg-zinc-800">
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                onNewItem={(tab) => { setCaptureInitialTab(tab || 'video'); setIsCaptureModalOpen(true); }}
            />

            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 relative">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                    <GridPattern width={40} height={40} className="stroke-black dark:stroke-white [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                </div>

                <Header viewMode={viewMode} setViewMode={setViewMode} onMenuClick={() => setSidebarCollapsed(false)} onSearchClick={() => setIsGlobalSearchOpen(true)} />

                <div className="flex-1 p-6 sm:p-8 max-w-[1600px] mx-auto w-full relative z-10">
                    {!user && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10 relative overflow-hidden rounded-3xl p-[2px] group"
                        >
                            {/* Animated Glowing Border - High Contrast Sweep */}
                            <motion.div
                                className="absolute left-1/2 top-1/2 w-[4000px] h-[4000px] bg-[conic-gradient(from_0deg,transparent_0_300deg,#d4d4d8_330deg,#ffffff_345deg,#d4d4d8_360deg)] dark:bg-[conic-gradient(from_0deg,transparent_0_300deg,#3f3f46_330deg,#ffffff_345deg,#3f3f46_360deg)] opacity-40 dark:opacity-50"
                                initial={{ x: "-50%", y: "-50%" }}
                                animate={{ rotate: 360, x: "-50%", y: "-50%" }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="relative bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-2xl rounded-[22px] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">

                                <div className="flex items-center gap-5 text-center sm:text-left w-full sm:w-auto flex-col sm:flex-row">
                                    <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200 dark:ring-zinc-800 text-zinc-900 dark:text-zinc-100 relative">
                                        <Info className="w-6 h-6 relative z-10" strokeWidth={2} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-center sm:justify-start gap-2.5">
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Guest Mode Active</h3>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50">
                                                Trial
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-md">
                                            You're using a temporary session. Sign in now to save your videos, notes, and playlists permanently.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => navigate('/auth')}
                                    className="shrink-0 rounded-xl font-bold uppercase tracking-widest text-[11px] h-12 px-8 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl shadow-zinc-900/10 dark:shadow-zinc-100/10 w-full sm:w-auto"
                                >
                                    Sign In to Save
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    <HeroSection />

                    <div className="mb-6">
                        <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100 mb-1">Everything</h1>
                        <p className="text-sm text-zinc-500 font-medium tracking-tight">
                            {activeItems.length} Active • {completedItems.length} Completed
                        </p>
                    </div>

                    <FilterToolbar />

                    <div className="mt-10">
                        <AnimatePresence mode="wait">
                            {selectedItems.length > 0 && (
                                <motion.div
                                    key="bulk-actions-bar"
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="mb-8 overflow-hidden sticky top-32 z-30"
                                >
                                    <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-2 p-1.5 pl-3 pr-1 sm:p-2 sm:pl-4 sm:pr-2 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                                        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-sm">
                                                    <span className="text-xs font-bold">{selectedItems.length}</span>
                                                </div>
                                                <span className="hidden xs:block text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">Selected</span>
                                            </div>

                                            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

                                            <button
                                                onClick={() => setSelectedItems(selectedItems.length === filteredAndSortedItems.length ? [] : filteredAndSortedItems.map(i => i.id))}
                                                className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap"
                                            >
                                                {selectedItems.length === filteredAndSortedItems.length ? 'None' : 'All'}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleBulkStatusChange}
                                                className="h-9 px-2.5 sm:px-4 text-[10px] sm:text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm"
                                            >
                                                <CheckCircle2 className="w-4 h-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Mark {viewMode === 'completed' ? 'Active' : 'Complete'}</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleBulkDelete}
                                                className="h-9 px-2.5 sm:px-4 text-[10px] sm:text-xs font-bold bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={clearSelection}
                                                className="h-9 w-9 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 whitespace-nowrap"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {filteredAndSortedItems.length > 0 ? (
                            <BentoGrid />
                        ) : (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-zinc-200 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
                                    {filterType !== 'all' ? (
                                        <Search className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                                    ) : viewMode === 'completed' ? (
                                        <CheckCircle2 className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                                    ) : (
                                        <Plus className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.2em] italic pr-[0.2em]">
                                    {filterType !== 'all'
                                        ? "Nothing Found"
                                        : viewMode === 'completed'
                                            ? "No items completed yet"
                                            : (items.length > 0 ? "All items completed" : "Your space is ready")}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-3 mb-10 font-medium max-w-sm mx-auto leading-relaxed">
                                    {filterType !== 'all'
                                        ? "Try clearing filters or searching across all your content."
                                        : viewMode === 'completed'
                                            ? "Focus on your goals and come back when you've finished a task!"
                                            : (items.length > 0
                                                ? "You've finished everything on your plate. Great work!"
                                                : "Capture your first video or note to start building your second brain.")}
                                </p>
                                {filterType !== 'all' ? (
                                    <Button variant="outline" className="h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] border-zinc-200 dark:border-zinc-800" onClick={() => setFilterType('all')}>Clear All Filters</Button>
                                ) : items.length === 0 && (
                                    <Button onClick={() => setIsCaptureModalOpen(true)} className="h-12 px-10 rounded-2xl font-bold uppercase tracking-widest text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl transition-transform hover:scale-105">Start Capturing</Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <SmartCaptureModal
                key={isCaptureModalOpen ? 'modal-open' : 'modal-closed'}
                isOpen={isCaptureModalOpen}
                onClose={() => setIsCaptureModalOpen(false)}
                initialTab={captureInitialTab}
            />
            <GlobalSearch
                isOpen={isGlobalSearchOpen}
                onClose={() => setIsGlobalSearchOpen(false)}
                onOpenCapture={(tab) => { setCaptureInitialTab(tab || 'video'); setIsCaptureModalOpen(true); }}
                onFocusItem={(item) => setFocusItem(item)}
            />
            <FocusMode item={focusItem} onClose={() => setFocusItem(null)} />
        </div>
    );
}
