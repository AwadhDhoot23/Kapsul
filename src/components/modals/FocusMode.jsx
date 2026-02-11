import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ExternalLink,
    CheckCircle2,
    Trash2,
    Tag as TagIcon,
    X,
    Video,
    ListVideo,
    Link as LinkIcon,
    Clock,
    User
} from 'lucide-react';
import { updateItem, deleteItem } from '@/lib/firestore';
import { toast } from 'sonner';
import { cn, formatRelativeTime } from '@/lib/utils';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

// Helper function to format duration (seconds to MM:SS or HH:MM:SS)
const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Media Focus View (for Videos, Playlists, Links)
function MediaFocusView({ item, onClose, onUpdate, onDelete }) {
    const queryClient = useQueryClient();

    const handleMarkComplete = async () => {
        try {
            await updateItem(item.id, { isCompleted: !item.isCompleted });
            toast.success(item.isCompleted ? 'Marked as active' : 'Marked as completed');
            queryClient.invalidateQueries({ queryKey: ['items'] });
            onClose();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteItem(item.id);
                toast.success('Item deleted');
                queryClient.invalidateQueries({ queryKey: ['items'] });
                queryClient.invalidateQueries({ queryKey: ['stories'] });
                onClose();
            } catch (error) {
                toast.error('Failed to delete item');
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 transition-colors"
                aria-label="Close"
            >
                <X className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            </button>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                {/* Thumbnail */}
                <div className="relative aspect-video max-w-4xl mx-auto mb-8 rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-xl bg-zinc-900">
                    {item.thumbnail ? (
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center p-12 overflow-hidden relative bg-zinc-950`}>
                            {/* Dotted Pattern Background */}
                            <div className="absolute inset-0 z-0 opacity-[0.1]" style={{
                                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                                backgroundSize: '24px 24px'
                            }}></div>

                            {/* Light Reflecting Animation (Cinematic Sweep) */}
                            <motion.div
                                animate={{
                                    x: ['-200%', '200%'],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "circOut",
                                    repeatDelay: 4
                                }}
                                className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -skew-x-20"
                            />

                            {/* Typographic Link Focus */}
                            {item.type === 'link' && (
                                <div className="relative z-20 text-center max-w-2xl px-6">
                                    {item.domain && (
                                        <p className="text-zinc-500 font-bold text-sm tracking-[0.4em] uppercase opacity-60">
                                            {item.domain}
                                        </p>
                                    )}
                                </div>
                            )}

                        </div>
                    )}

                </div>

                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                    {/* Main Title Below Media */}
                    <h1 className="text-2xl sm:text-4xl font-serif font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                        {item.title}
                    </h1>

                    {/* Metadata */}
                    <div className="space-y-2 sm:space-y-3">
                        {/* Channel Info */}
                        {(item.channel || item.channelTitle) && (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div>
                                    <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                        {item.channel || item.channelTitle}
                                    </p>
                                    {(item.type === 'video' || item.type === 'playlist') && (
                                        <p className="text-[10px] sm:text-xs text-zinc-500">
                                            {item.subscriberCount || 'YouTube Channel'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Metadata */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-sm text-zinc-600 dark:text-zinc-400">
                            {item.domain && (
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.domain}</span>
                                </div>
                            )}
                            {item.duration && (
                                <div className="flex items-center gap-2">
                                    <span>{formatDuration(item.duration)}</span>
                                </div>
                            )}
                            {item.videoCount && (
                                <span>{item.videoCount} videos</span>
                            )}
                            <div className="flex items-center gap-2">
                                <span>{formatRelativeTime(item.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="border-t border-b border-zinc-200 dark:border-zinc-800 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                Tags
                            </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(item.tags && item.tags.length > 0) ? (
                                item.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500">No tags</p>
                            )}
                        </div>
                    </div>


                    {/* Why You Saved This Section */}
                    {item.whySaved && (
                        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100"></span>
                                Why you saved this
                            </h3>
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                                <p className="text-base text-zinc-900 dark:text-zinc-100 leading-relaxed font-serif">
                                    {item.whySaved}
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Action Footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
                    <Button
                        onClick={() => window.open(item.url, '_blank')}
                        className="flex-1 min-w-[200px] h-12 text-base font-semibold bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-all"
                    >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        {item.type === 'video' && 'Watch on YouTube'}
                        {item.type === 'playlist' && 'View Playlist'}
                        {item.type === 'link' && 'Visit Link'}
                        {item.type === 'note' && 'Read Note'}
                    </Button>
                    <Button
                        onClick={handleMarkComplete}
                        variant="outline"
                        className="h-12"
                    >
                        <CheckCircle2 className={cn("w-5 h-5 mr-2", item.isCompleted && "text-green-500")} />
                        {item.isCompleted ? 'Mark Active' : 'Mark Complete'}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="outline"
                        className="h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>
        </div >
    );
}

// Note Focus View (with Editor and AI Placeholder)
function NoteFocusView({ item, onClose }) {
    const [title, setTitle] = useState(item.title || '');
    const [content, setContent] = useState(item.content || '');
    const [tags, setTags] = useState(item.tags || []);
    const [newTag, setNewTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    // Auto-save with debounce (reduced to 1s)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (title !== item.title || content !== item.content || JSON.stringify(tags) !== JSON.stringify(item.tags)) {
                setIsSaving(true);
                try {
                    // Generate preview from content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;
                    const plainText = tempDiv.textContent || tempDiv.innerText || '';
                    const preview = plainText.slice(0, 120) + (plainText.length > 120 ? '...' : '');

                    await updateItem(item.id, {
                        title,
                        content,
                        preview,
                        tags
                    });
                    queryClient.invalidateQueries({ queryKey: ['items'] });
                } catch (error) {
                    console.error('Auto-save failed:', error);
                } finally {
                    setIsSaving(false);
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, content, tags]);

    // Save immediately on close
    const handleClose = async () => {
        if (title !== item.title || content !== item.content || JSON.stringify(tags) !== JSON.stringify(item.tags)) {
            setIsSaving(true);
            try {
                // Generate preview from content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                const plainText = tempDiv.textContent || tempDiv.innerText || '';
                const preview = plainText.slice(0, 120) + (plainText.length > 120 ? '...' : '');

                await updateItem(item.id, {
                    title,
                    content,
                    preview,
                    tags
                });
                queryClient.invalidateQueries({ queryKey: ['items'] });
            } catch (error) {
                console.error('Final save failed:', error);
            }
        }
        onClose();
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                await deleteItem(item.id);
                toast.success('Note deleted');
                queryClient.invalidateQueries({ queryKey: ['items'] });
                queryClient.invalidateQueries({ queryKey: ['stories'] });
                onClose();
            } catch (error) {
                toast.error('Failed to delete note');
            }
        }
    };

    const handleMarkComplete = async () => {
        try {
            await updateItem(item.id, { isCompleted: !item.isCompleted });
            toast.success(item.isCompleted ? 'Marked as active' : 'Marked as completed');
            queryClient.invalidateQueries({ queryKey: ['items'] });
            onClose();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            {/* Header Bar */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
                <div className="flex-1 flex items-center gap-2 sm:gap-4 overflow-hidden">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Note"
                        className="text-lg sm:text-xl font-serif font-semibold border-0 focus-visible:ring-0 px-0 bg-transparent truncate"
                    />
                    {isSaving && (
                        <span className="text-[10px] sm:text-xs text-zinc-500 shrink-0">Saving...</span>
                    )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        onClick={handleMarkComplete}
                        variant="ghost"
                        size="sm"
                        className="h-8 sm:h-9 px-2 sm:px-3"
                    >
                        <CheckCircle2 className={cn("w-4 h-4 sm:mr-2", item.isCompleted && "text-green-500")} />
                        <span className="hidden sm:inline">{item.isCompleted ? 'Active' : 'Complete'}</span>
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="ghost"
                        size="sm"
                        className="h-8 sm:h-9 px-2 sm:px-3 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                    <Button
                        onClick={handleClose}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Tags Bar */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-6 py-3">
                <div className="flex flex-wrap items-center gap-2">
                    <TagIcon className="w-4 h-4 text-zinc-500" />
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="pl-2 pr-1 flex items-center gap-1"
                        >
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className="hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                    <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                        className="h-7 w-32 text-xs border-zinc-300 dark:border-zinc-700"
                    />
                </div>
            </div>

            {/* Two-Panel Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Panel - Editor */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Start writing your note..."
                    />
                </div>


            </div>
        </div>
    );
}

// Main FocusMode Component
export function FocusMode({ item, onClose }) {
    if (!item) return null;

    const isNote = item.type === 'note';

    return (
        <Dialog open={!!item} onOpenChange={onClose}>
            <DialogContent className={cn(
                "p-0 gap-0 border-0 outline-none [&>button]:hidden overflow-hidden", // Hide default shadcn close button
                isNote
                    ? "max-w-[95vw] w-[95vw] h-[90vh] bg-white dark:bg-zinc-950"
                    : "max-w-5xl bg-white dark:bg-zinc-950 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800"
            )}>
                <DialogTitle className="sr-only">
                    {item.title || 'Focus Mode'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Viewing {item.type} in focus mode
                </DialogDescription>

                {isNote ? (
                    <NoteFocusView item={item} onClose={onClose} />
                ) : (
                    <MediaFocusView item={item} onClose={onClose} />
                )}
            </DialogContent>
        </Dialog>
    );
}
