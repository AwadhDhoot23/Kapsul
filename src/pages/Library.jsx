import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Grid, List as ListIcon, Trash2, CheckCircle2, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getUserItems, updateItem, deleteItem } from '@/lib/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Masonry from 'react-masonry-css';
import { VideoCard } from '@/components/cards/VideoCard';
import { LinkCard } from '@/components/cards/LinkCard';
import { NoteCard } from '@/components/cards/NoteCard';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { toast } from 'sonner';
import { FocusMode } from '@/components/modals/FocusMode';
import { GlobalSearch } from '@/components/modals/GlobalSearch';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SmartCaptureModal } from '@/components/modals/SmartCaptureModal';
import { GridPattern } from '@/components/ui/grid-pattern';

export default function Library() {
    const user = useAuthStore((state) => state.user);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
    const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [filterType, setFilterType] = useState('all'); // 'all', 'video', 'link', 'note', 'playlist'
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'a-z'
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [focusItem, setFocusItem] = useState(null);

    // Real-time Data Fetching
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;
        setIsLoading(true);
        const unsubscribe = getUserItems(user.uid, {}, (fetchedItems) => {
            setItems(fetchedItems);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user?.uid]);

    // Global search keyboard shortcut (Cmd+K / Ctrl+K)
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

    // Smart Search Logic (Platform-aware + Multi-field)
    const filteredItems = useMemo(() => {
        let result = [...items];

        // 1. Smart Search (if there's a query)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase().trim();

            // Platform-aware keywords - these override type filters
            const platformMap = {
                'youtube': ['video', 'playlist'],
                'web': ['link'],
                'article': ['link'],
                'link': ['link'],
                'note': ['note'],
                'text': ['note'],
                'writing': ['note'],
                'video': ['video'],
                'playlist': ['playlist'],
            };

            // Check if query is a platform/type keyword
            const matchedTypes = platformMap[lowerQuery];
            if (matchedTypes) {
                // Direct type match - show all items of these types
                result = items.filter(item => matchedTypes.includes(item.type));
            } else {
                // Normal multi-field search
                result = result.filter(item => {
                    const searchableFields = [
                        item.title,
                        item.description,
                        item.url,
                        item.channelTitle,
                        item.domain,
                        ...(item.tags || []),
                    ];

                    // For notes, also search inside content (strip HTML)
                    if (item.type === 'note' && item.content) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = item.content;
                        const plainText = tempDiv.textContent || tempDiv.innerText || '';
                        searchableFields.push(plainText);
                    }

                    // Check all fields (exact match)
                    return searchableFields.some(field =>
                        field && String(field).toLowerCase().includes(lowerQuery)
                    );
                });
            }
        }

        // 2. Type Filter (only if no search query or search query isn't a type keyword)
        if (filterType !== 'all' && !searchQuery) {
            result = result.filter(item => item.type === filterType);
        }

        // 1. Sort by Priority/Date/AZ
        result.sort((a, b) => {
            // Priority 1: Pinned items always first
            if (a.isPinned !== b.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);

            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;

            if (sortOrder === 'newest') return dateB - dateA;
            if (sortOrder === 'oldest') return dateA - dateB;
            if (sortOrder === 'a-z') return (a.title || '').localeCompare(b.title || '');
            return 0;
        });

        return result;
    }, [items, searchQuery, filterType, sortOrder]);

    // Selection Handlers
    const toggleSelection = (id) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const clearSelection = () => setSelectedItems(new Set());

    const selectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            clearSelection();
        } else {
            setSelectedItems(new Set(filteredItems.map(i => i.id)));
        }
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) return;

        try {
            await Promise.all([...selectedItems].map(id => deleteItem(id)));
            toast.success(`Deleted ${selectedItems.size} items`);
            clearSelection();
        } catch (error) {
            toast.error('Failed to delete items');
        }
    };

    const handleBulkMarkComplete = async (status) => { // status: true/false
        try {
            await Promise.all([...selectedItems].map(id => updateItem(id, { isCompleted: status })));
            toast.success(`Marked ${selectedItems.size} items as ${status ? 'completed' : 'active'}`);
            clearSelection();
        } catch (error) {
            toast.error('Failed to update items');
        }
    };

    // Card Helper
    const commonProps = (item) => ({
        onPin: async (id) => {
            await updateItem(id, { isPinned: !item.isPinned });
        },
        onDelete: async (id) => {
            if (confirm('Delete this item?')) {
                await deleteItem(id);
                toast.success('Item deleted');
            }
        },
        onMarkComplete: async (id) => {
            await updateItem(id, { isCompleted: !item.isCompleted });
            toast.success(item.isCompleted ? 'Marked as active' : 'Marked as completed');
        },
        onClick: () => setFocusItem(item),
        // Selection Props (Specific to Library)
        isSelected: selectedItems.has(item.id),
        onSelect: () => toggleSelection(item.id),
    });

    return (
        <div className="flex min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-zinc-100 dark:selection:bg-zinc-800">
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                onNewItem={() => setIsCaptureModalOpen(true)}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 relative">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <GridPattern
                        width={32}
                        height={32}
                        x={-1}
                        y={-1}
                        className="stroke-zinc-200/50 dark:stroke-zinc-800/30 [mask-image:linear-gradient(to_bottom,white,transparent)]"
                    />
                </div>

                {/* Main Header (Reused) */}
                <Header
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onMenuClick={() => setSidebarCollapsed(false)}
                    onSearchClick={() => setIsGlobalSearchOpen(true)}
                />

                {/* Library Toolbar (Sticky) */}
                <div className="sticky top-16 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                    <div className="px-6 py-4 space-y-4">
                        {/* Title Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h1 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100">Library</h1>
                                <span className="text-sm text-zinc-500 font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    {filteredItems.length}
                                </span>
                            </div>

                            {/* Bulk Actions */}
                            {selectedItems.size > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-3 py-1.5 rounded-lg shadow-lg"
                                >
                                    <span className="text-sm font-medium border-r border-zinc-700 dark:border-zinc-300 pr-3 mr-1">
                                        {selectedItems.size} selected
                                    </span>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-white/20" onClick={() => handleBulkMarkComplete(true)} title="Mark Complete">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-white/20 text-red-300 hover:text-red-200" onClick={handleBulkDelete} title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-white/20 ml-1" onClick={clearSelection}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            {/* Search & Pills */}
                            <div className="flex flex-1 gap-2 items-center overflow-x-auto no-scrollbar">
                                <div className="relative w-full sm:w-64 shrink-0">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Search library..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-all"
                                    />
                                </div>
                                <div className="flex gap-1.5">
                                    {['all', 'video', 'link', 'note', 'playlist'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${filterType === type
                                                ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900'
                                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort & View */}
                            <div className="flex items-center gap-2 shrink-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9 gap-2">
                                            <SlidersHorizontal className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Sort: {sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuCheckboxItem checked={sortOrder === 'newest'} onCheckedChange={() => setSortOrder('newest')}>
                                            Newest First
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem checked={sortOrder === 'oldest'} onCheckedChange={() => setSortOrder('oldest')}>
                                            Oldest First
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuCheckboxItem checked={sortOrder === 'a-z'} onCheckedChange={() => setSortOrder('a-z')}>
                                            Alphabetical (A-Z)
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {filteredItems.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-zinc-400">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No items found</p>
                            <p className="text-sm">Try adjusting your filters or search query</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' && (
                                <Masonry
                                    breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
                                    className="flex -ml-4 w-auto"
                                    columnClassName="pl-4 bg-clip-padding"
                                >
                                    {filteredItems.map(item => (
                                        <div key={item.id} className="mb-4">
                                            {item.type === 'video' && <VideoCard {...commonProps(item)} {...item} />}
                                            {item.type === 'playlist' && <PlaylistCard {...commonProps(item)} {...item} />}
                                            {item.type === 'link' && <LinkCard {...commonProps(item)} {...item} />}
                                            {item.type === 'note' && <NoteCard {...commonProps(item)} {...item} />}
                                        </div>
                                    ))}
                                </Masonry>
                            )}

                            {viewMode === 'list' && (
                                <div className="space-y-2 max-w-5xl mx-auto">
                                    {filteredItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer group ${selectedItems.has(item.id)
                                                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                }`}
                                            onClick={() => toggleSelection(item.id)}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedItems.has(item.id)
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400'
                                                    }`}
                                            >
                                                {selectedItems.has(item.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>

                                            {/* Icon */}
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                                {item.type === 'video' && <Grid className="w-4 h-4" />}
                                                {item.type === 'playlist' && <ListIcon className="w-4 h-4" />}
                                                {item.type === 'link' && <Grid className="w-4 h-4" />}
                                                {item.type === 'note' && <ListIcon className="w-4 h-4" />}
                                            </div>

                                            {/* Row Content */}
                                            <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); setFocusItem(item); }}>
                                                <h3 className="font-medium text-sm truncate text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                                                <p className="text-xs text-zinc-500 truncate">{item.description || item.url || 'No description'}</p>
                                            </div>

                                            <Badge variant="secondary" className="capitalize text-xs font-normal">{item.type}</Badge>
                                            <span className="text-xs text-zinc-400 w-24 text-right">
                                                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Modals */}
            <SmartCaptureModal
                isOpen={isCaptureModalOpen}
                onClose={() => setIsCaptureModalOpen(false)}
            />
            <GlobalSearch
                isOpen={isGlobalSearchOpen}
                onClose={() => setIsGlobalSearchOpen(false)}
                onOpenCapture={() => setIsCaptureModalOpen(true)}
                onFocusItem={(item) => setFocusItem(item)}
            />
            <FocusMode
                item={focusItem}
                onClose={() => setFocusItem(null)}
            />
        </div>
    );
}
