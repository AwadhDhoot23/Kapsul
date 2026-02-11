import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
        <div className="flex flex-col h-full max-h-[85vh]">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
                <X className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            </button>

            <div className="flex-1 overflow-y-auto p-8">
                {/* Thumbnail */}
                <div className="relative aspect-video max-w-4xl mx-auto mb-8 rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-xl bg-zinc-900">
                    {item.thumbnail ? (
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center p-12 ${item.type === 'link'
                            ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-zinc-800 to-zinc-900'
                            }`}>
                            {item.type === 'video' && <Video className="w-20 h-20 text-white/50" />}
                            {item.type === 'playlist' && <ListVideo className="w-20 h-20 text-white/50" />}
                            {item.type === 'link' && (
                                <div className="text-center">
                                    {item.domain ? (
                                        <img
                                            src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`}
                                            alt={item.domain}
                                            className="w-24 h-24 mx-auto mb-4 drop-shadow-2xl rounded-xl"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    ) : (
                                        <LinkIcon className="w-20 h-20 text-white/80 mx-auto mb-4" />
                                    )}
                                    <h3 className="text-2xl font-serif font-bold text-white drop-shadow-md line-clamp-2">
                                        {item.title}
                                    </h3>
                                    {item.domain && (
                                        <p className="text-white/80 font-medium mt-2">{item.domain}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Type indicator badge */}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-black/80 text-white border-white/20 backdrop-blur-sm shadow-sm">
                            {item.type === 'video' && 'Video'}
                            {item.type === 'playlist' && 'Playlist'}
                            {item.type === 'link' && 'Link'}
                        </Badge>
                    </div>

                    {/* YouTube Logo for videos and playlists */}
                    {(item.type === 'video' || item.type === 'playlist') && (
                        <div className="absolute top-4 right-4">
                            <div className="bg-white rounded px-2 py-1 flex items-center gap-1.5">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF0000">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                                <span className="text-xs font-semibold text-zinc-900">YouTube</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Title */}
                    <h1 className="text-4xl font-serif font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                        {item.title}
                    </h1>

                    {/* Metadata */}
                    <div className="space-y-3">
                        {/* Channel Info */}
                        {(item.channel || item.channelTitle) && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-serif font-bold border border-zinc-200 dark:border-zinc-700">
                                    {(item.channel || item.channelTitle).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                        {item.channel || item.channelTitle}
                                    </p>
                                    {(item.type === 'video' || item.type === 'playlist') && (
                                        <p className="text-xs text-zinc-500">
                                            {item.subscriberCount || 'YouTube Channel'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {item.domain && (
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    <span>{item.domain}</span>
                                </div>
                            )}
                            {item.duration && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDuration(item.duration)}</span>
                                </div>
                            )}
                            {item.videoCount && (
                                <div className="flex items-center gap-2">
                                    <ListVideo className="w-4 h-4" />

                                    <span>{item.videoCount} videos</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatRelativeTime(item.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="border-t border-b border-zinc-200 dark:border-zinc-800 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <TagIcon className="w-4 h-4" />
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
        <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header Bar */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex items-center justify-between">
                <div className="flex-1 flex items-center gap-4">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Note"
                        className="text-xl font-serif font-semibold border-0 focus-visible:ring-0 px-0 bg-transparent"
                    />
                    {isSaving ? (
                        <span className="text-xs text-zinc-500">Saving...</span>
                    ) : (
                        <span className="text-xs text-zinc-400">{formatRelativeTime(item.createdAt)}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleMarkComplete}
                        variant="ghost"
                        size="sm"
                    >
                        <CheckCircle2 className={cn("w-4 h-4 mr-2", item.isCompleted && "text-green-500")} />
                        {item.isCompleted ? 'Active' : 'Complete'}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                    <Button
                        onClick={handleClose}
                        variant="ghost"
                        size="icon"
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
                "p-0 gap-0 border-0 outline-none [&>button]:hidden", // Hide default shadcn close button
                isNote ? "max-w-[95vw] w-[95vw] h-[90vh]" : "max-w-5xl bg-zinc-950/90 backdrop-blur-xl border-zinc-800"
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
