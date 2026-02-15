import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Video, Link as LinkIcon, FileText, ListVideo, X, Loader2, ScanLine, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addItem } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { fetchVideoDetails, fetchPlaylistDetails } from '@/lib/youtube';
import { cn, compressImage } from '@/lib/utils';

export function SmartCaptureModal({ isOpen, onClose, initialTab }) {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState(initialTab);
    const [url, setUrl] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [whySaved, setWhySaved] = useState('');
    const [title, setTitle] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagInput, setNewTagInput] = useState('');
    const [customTag, setCustomTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

    // IMAGE GALLERY STATE
    const [images, setImages] = useState([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Predefined tag suggestions
    const tagSuggestions = ['Work', 'Personal', 'Learning', 'Important', 'Later'];

    // Update activeTab when initialTab prop changes or modal opens
    useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        } else if (isOpen && !initialTab) {
            setActiveTab('video'); // Default fallback
        }

        // Reset form when modal closes
        if (!isOpen) {
            resetForm();
        }
    }, [initialTab, isOpen]);

    // Metadata states
    const [thumbnail, setThumbnail] = useState('');
    const [duration, setDuration] = useState(0);
    const [videoCount, setVideoCount] = useState(0);
    const [channelTitle, setChannelTitle] = useState('');
    const [description, setDescription] = useState('');

    // Mock existing tags (will be fetched from Firestore later)
    const existingTags = ['React', 'Tutorial', 'Web Dev', 'JavaScript', 'Design'];

    // Animation State
    const [flyingImage, setFlyingImage] = useState(null);

    // Auto-fetch Metadata when URL changes
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!url) return;

            if (activeTab === 'video') {
                const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (match && match[1]) {
                    setIsFetchingMetadata(true);
                    const details = await fetchVideoDetails(match[1]);
                    if (details) {
                        setTitle(prev => prev || details.title);
                        setThumbnail(details.thumbnail);
                        setDuration(details.duration);
                        setChannelTitle(details.channelTitle);
                        setChannelTitle(details.channelTitle);
                        setDescription(details.description || ''); // Enable description for AI context
                    }
                    setIsFetchingMetadata(false);
                }
            } else if (activeTab === 'playlist') {
                const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    setIsFetchingMetadata(true);
                    const details = await fetchPlaylistDetails(match[1]);
                    if (details) {
                        setTitle(prev => prev || details.title);
                        setThumbnail(details.thumbnail);
                        setVideoCount(details.videoCount);
                        setChannelTitle(details.channelTitle);
                    }
                    setIsFetchingMetadata(false);
                }
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [url, activeTab]);


    // Auto-detect URL type and switch tabs
    const handleUrlChange = (value) => {
        setUrl(value);

        // YouTube video detection
        if (/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(value)) {
            setActiveTab('video');
        }
        // YouTube playlist detection
        else if (/[?&]list=([a-zA-Z0-9_-]+)/.test(value)) {
            setActiveTab('playlist');
        }
        // Generic URL
        else if (/^https?:\/\/.+/.test(value)) {
            setActiveTab('link');
        }
    };

    // Add tag to selected
    const addTag = (tag) => {
        if (!selectedTags.includes(tag) && selectedTags.length < 20) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Create new tag
    const createNewTag = () => {
        if (newTagInput.trim() && !selectedTags.includes(newTagInput.trim())) {
            setSelectedTags([...selectedTags, newTagInput.trim()]);
            setNewTagInput('');
        }
    };

    // Remove tag
    const removeTag = (tagToRemove) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    // IMAGE UPLOAD HANDLER
    const handleImageUpload = async (file) => {
        if (!user) {
            toast.error('You must be logged in to upload images');
            return;
        }
        setIsUploadingImage(true);
        const toastId = toast.loading('Processing image...');
        try {
            const base64 = await compressImage(file); // Compress & Convert to Base64
            setImages(prev => [...prev, base64]);

            // Trigger animation
            setFlyingImage(base64);
            setTimeout(() => setFlyingImage(null), 1000);

            toast.success('Image added!', { id: toastId });
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to process image', { id: toastId });
        } finally {
            setIsUploadingImage(false);
        }
    };


    // Validate form based on tab
    const validateForm = () => {
        if (activeTab === 'note') {
            if (!title.trim()) {
                toast.error('Please enter a title for your note');
                return false;
            }
            if (!noteContent.trim() || noteContent === '<p></p>') {
                // Allow empty content if there are images
                if (images.length === 0) {
                    toast.error('Please write some content or add images');
                    return false;
                }
            }
        } else {
            if (!url.trim()) {
                toast.error(`Please enter a URL for the ${activeTab}`);
                return false;
            }
            // Basic URL validation
            if (!/^https?:\/\/.+/.test(url)) {
                toast.error('Please enter a valid URL starting with http:// or https://');
                return false;
            }
        }
        return true;
    };

    // Prepare item data based on type
    const prepareItemData = () => {
        const baseData = {
            type: activeTab,
            tags: selectedTags,
        };

        if (activeTab === 'note') {
            // Strip HTML for preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = noteContent;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';

            return {
                ...baseData,
                title,
                content: noteContent, // Store HTML
                preview: plainText.slice(0, 120) + (plainText.length > 120 ? '...' : ''),
                images: images, // Store the array of image URLs
            };
        } else {
            // For video, link, playlist
            const itemData = {
                ...baseData,
                url,
                title: title || 'Untitled',
                thumbnail, // Add fetched thumbnail
                channelTitle, // Add fetched channel title
                description, // Add fetched description
                whySaved: whySaved.trim(), // Add "Why you saved this"
            };

            if (activeTab === 'video') {
                itemData.duration = duration; // Add fetched duration
            } else if (activeTab === 'playlist') {
                itemData.videoCount = videoCount; // Add fetched video count
            }

            if (activeTab === 'link') {
                try {
                    const urlObj = new URL(url);
                    itemData.domain = urlObj.hostname.replace('www.', '');
                } catch (e) {
                    itemData.domain = 'Unknown';
                }
            }

            return itemData;
        }
    };

    // Handle save
    const handleSave = async () => {
        if (!user) {
            toast.error('You must be logged in to save items');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const itemData = prepareItemData();
            await addItem(user.uid, itemData);

            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['stories'] });

            toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} saved successfully!`);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error('Failed to save item. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setUrl('');
        setNoteContent('');
        setWhySaved('');
        setTitle('');
        setSelectedTags([]);
        setNewTagInput('');
        setImages([]);
        // setActiveTab('video'); // Handled by useEffect on open
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[680px] w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] p-0 border-0 sm:border-2 bg-white dark:bg-black shadow-none sm:shadow-[0_20px_80px_rgba(0,0,0,0.3)] sm:dark:shadow-[0_20px_80px_rgba(255,255,255,0.15)] border-zinc-900 dark:border-zinc-100 flex flex-col">
                {/* Premium Header - Unchanged */}
                <DialogHeader className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b-2 border-zinc-900 dark:border-zinc-100 shrink-0">
                    <DialogTitle className="text-2xl sm:text-4xl font-serif font-black text-zinc-950 dark:text-zinc-50 tracking-tighter leading-none">
                        Smart Capture
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 sm:mt-3 font-medium">
                        Save videos, links, notes, or playlists to your library
                    </DialogDescription>
                </DialogHeader>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
                    {/* Tabs with Clean Minimalist Design (Apple-like) */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="flex w-full bg-transparent p-0 border-b border-zinc-200 dark:border-zinc-800">
                            <TabsTrigger
                                value="video"
                                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 pb-3 transition-all hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                <div className="flex items-center gap-2 font-semibold">
                                    <Video className="w-4 h-4" />
                                    <span className="hidden sm:inline">Video</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="link"
                                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 pb-3 transition-all hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                <div className="flex items-center gap-2 font-semibold">
                                    <LinkIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Link</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="note"
                                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 pb-3 transition-all hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                <div className="flex items-center gap-2 font-semibold">
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden sm:inline">Note</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="playlist"
                                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 pb-3 transition-all hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                <div className="flex items-center gap-2 font-semibold">
                                    <ListVideo className="w-4 h-4" />
                                    <span className="hidden sm:inline">Playlist</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        {/* Video Tab */}
                        <TabsContent value="video" className="space-y-5 mt-8">
                            <div className="space-y-2.5 relative">
                                <Label htmlFor="video-url" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">YouTube Video URL</Label>
                                <Input
                                    id="video-url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={url}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    className="font-mono text-sm border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 h-12 bg-zinc-50 dark:bg-zinc-900/50 pr-10 transition-all"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="video-why" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Why you saved this (optional)</Label>
                                <Textarea
                                    id="video-why"
                                    placeholder="Add context for your future self..."
                                    value={whySaved}
                                    onChange={(e) => setWhySaved(e.target.value)}
                                    className="resize-none min-h-[80px] border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 bg-zinc-50 dark:bg-zinc-900/50"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="video-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Title (optional)</Label>
                                <Input
                                    id="video-title"
                                    placeholder="Will be auto-fetched if left empty"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 h-12 bg-zinc-50 dark:bg-zinc-900/50"
                                />
                            </div>
                        </TabsContent>

                        {/* Link Tab */}
                        <TabsContent value="link" className="space-y-5 mt-8">
                            <div className="space-y-2.5">
                                <Label htmlFor="link-url" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Website URL</Label>
                                <Input
                                    id="link-url"
                                    placeholder="https://example.com/article"
                                    value={url}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    className="font-mono text-sm border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 h-12 bg-zinc-50 dark:bg-zinc-900/50 pr-10 transition-all"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="link-why" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Why you saved this (optional)</Label>
                                <Textarea
                                    id="link-why"
                                    placeholder="Add context for your future self..."
                                    value={whySaved}
                                    onChange={(e) => setWhySaved(e.target.value)}
                                    className="resize-none min-h-[80px] border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 bg-zinc-50 dark:bg-zinc-900/50"
                                />
                            </div>
                            <div className="space-y-2.5 relative">
                                <Label htmlFor="link-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Title (optional)</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-6 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-2"
                                    onClick={() => {
                                        if (url) {
                                            try {
                                                const domain = new URL(url).hostname.replace('www.', '');
                                                if (!title) setTitle(domain);
                                            } catch (e) { }
                                        }
                                    }}
                                >
                                    Use Domain
                                </Button>
                                <Input
                                    id="link-title"
                                    placeholder="Will be auto-fetched if left empty"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 h-12 bg-zinc-50 dark:bg-zinc-900/50"
                                />
                            </div>
                        </TabsContent>

                        {/* Note Tab with Rich Text Editor */}
                        <TabsContent value="note" className="space-y-5 mt-8">
                            <div className="space-y-2.5">
                                <Label htmlFor="note-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Title</Label>
                                <Input
                                    id="note-title"
                                    placeholder="Give your note a title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 h-12 font-semibold bg-zinc-50 dark:bg-zinc-900/50"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Content</Label>
                                <RichTextEditor
                                    content={noteContent}
                                    onChange={setNoteContent}
                                    placeholder="Write your thoughts, ideas, or paste images..."
                                    onImagePaste={handleImageUpload}
                                />
                            </div>
                        </TabsContent>

                        {/* Playlist Tab */}
                        <TabsContent value="playlist" className="space-y-5 mt-8">
                            <div className="space-y-2.5 relative">
                                <Label htmlFor="playlist-url" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">YouTube Playlist URL</Label>
                                <Input
                                    id="playlist-url"
                                    placeholder="https://youtube.com/playlist?list=..."
                                    value={url}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    className="font-mono text-sm border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 h-12 bg-zinc-50 dark:bg-zinc-900/50 pr-10"
                                />
                                {isFetchingMetadata && (
                                    <div className="absolute right-3 top-[2.8rem]">
                                        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="playlist-why" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Why you saved this (optional)</Label>
                                <Textarea
                                    id="playlist-why"
                                    placeholder="Add context for your future self..."
                                    value={whySaved}
                                    onChange={(e) => setWhySaved(e.target.value)}
                                    className="resize-none min-h-[80px] border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 bg-zinc-50 dark:bg-zinc-900/50"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="playlist-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Title (optional)</Label>
                                <Input
                                    id="playlist-title"
                                    placeholder="Will be auto-fetched if left empty"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 h-12 bg-zinc-50 dark:bg-zinc-900/50"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Tags Section */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            Tags
                        </Label>


                        {/* Selected Tags */}
                        {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2.5 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border-2 border-zinc-300 dark:border-zinc-700">
                                {selectedTags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="pl-3.5 pr-1.5 py-1.5 text-sm font-semibold flex items-center gap-1.5 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 border-2 border-zinc-950 dark:border-zinc-50 shadow-sm"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="ml-0.5 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full p-1 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Existing Tags */}
                        <div className="flex flex-wrap gap-2">
                            {existingTags
                                .filter(tag => !selectedTags.includes(tag))
                                .map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-zinc-50 dark:hover:text-zinc-950 transition-all font-medium border-2 border-zinc-300 dark:border-zinc-700 px-3 py-1.5"
                                        onClick={() => addTag(tag)}
                                    >
                                        + {tag}
                                    </Badge>
                                ))}
                        </div>

                        {/* New Tag Input */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Create new tag..."
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        createNewTag();
                                    }
                                }}
                                className="text-sm border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 h-11 bg-zinc-50 dark:bg-zinc-900/50"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={createNewTag}
                                disabled={!newTagInput.trim()}
                                className="border-2 border-zinc-900 dark:border-zinc-100 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-zinc-50 dark:hover:text-zinc-950 font-semibold h-11 px-6"
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer with elevated design */}
                <div className="px-8 py-6 border-t-2 border-zinc-900 dark:border-zinc-100 flex justify-between gap-4 bg-zinc-50 dark:bg-zinc-950 items-center relative">

                    {/* Flying Image Animation Layer */}
                    <AnimatePresence>
                        {flyingImage && (
                            <motion.img
                                src={flyingImage}
                                initial={{ opacity: 1, scale: 1, x: 0, y: -200 }}
                                animate={{ opacity: 0, scale: 0.1, x: -300, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute right-1/2 top-0 w-24 h-24 object-cover rounded-lg z-50 pointer-events-none shadow-xl border-2 border-white"
                            />
                        )}
                    </AnimatePresence>

                    {/* Image Counter (Left Side) */}
                    <div>
                        {activeTab === 'note' && (
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <div className="relative">
                                    <ImageIcon className="w-5 h-5" />
                                    {images.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                            {images.length}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-medium">{images.length} Image{images.length !== 1 ? 's' : ''} saved</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold h-11 px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading || isUploadingImage}
                            className="bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-zinc-50 dark:text-zinc-950 font-bold h-11 px-8 shadow-lg border-2 border-zinc-950 dark:border-zinc-50 transition-all"
                        >
                            {isLoading ? 'Saving...' : isUploadingImage ? 'Uploading...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
