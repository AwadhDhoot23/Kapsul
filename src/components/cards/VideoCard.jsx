import React from 'react';
import { BaseCard } from './BaseCard';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';

// Helper to extract YouTube ID
const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Mock duration generator based on ID (returns seconds)
const getMockDuration = (id) => {
    if (!id) return 600;
    // Generate duration between 3 min and 20 min
    return (id.charCodeAt(0) % 17) * 60 + (id.charCodeAt(id.length - 1) % 60);
};

export function VideoCard({
    id,
    url,
    thumbnail,
    duration,
    title,
    channel,
    tags = [],
    createdAt,
    isPinned,
    isCompleted,
    isSelected,
    onSelect,
    onPin,
    onClick,
    onDelete,
    onMarkComplete,
    onEditTags
}) {
    // Format duration (seconds to MM:SS)
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const videoId = getYouTubeId(url);
    const displayThumbnail = thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

    // Use real duration if available, otherwise mock it for UI demo
    const displayDuration = duration || getMockDuration(id);

    return (
        <BaseCard
            id={id}
            type="video"
            isPinned={isPinned}
            isCompleted={isCompleted}
            isSelected={isSelected}
            onSelect={onSelect}
            onPin={onPin}
            onClick={onClick}
            onDelete={onDelete}
            onMarkComplete={onMarkComplete}
            onEditTags={onEditTags}
        >
            {/* Thumbnail Section */}
            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                {displayThumbnail ? (
                    <img
                        src={displayThumbnail}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if maxres/hq fails, though hq usually exists
                            if (e.target.src.includes('hqdefault')) {
                                e.target.style.display = 'none';
                            }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900">
                        <Video className="w-8 h-8 opacity-50" />
                    </div>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm border border-white/10 shadow-sm">
                    {formatDuration(displayDuration)}
                </div>

                {/* Saved Time Indicator (Hover) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 w-max">
                    <span className="text-[10px] font-medium text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm border border-white/10">
                        {formatRelativeTime(createdAt)}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-3 space-y-2">
                {/* Title */}
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                    {title}
                </h3>

                {/* Channel */}
                {channel && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {channel}
                    </p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map((tag, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 font-normal bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {tags.length > 3 && (
                            <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 font-normal text-zinc-500 border-zinc-200 dark:border-zinc-800"
                            >
                                +{tags.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}
            </div>


        </BaseCard>
    );
}
