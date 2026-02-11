import React from 'react';
import { BaseCard } from './BaseCard';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import { ListVideo } from 'lucide-react';

// Extract playlist ID from URL
const getPlaylistId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
};

// Mock count generator based on ID
const getMockCount = (id) => {
    if (!id) return 12;
    return (id.charCodeAt(0) % 20) + 5;
};

export function PlaylistCard({
    id,
    url,
    thumbnail,
    videoCount,
    title,
    description,
    channel,
    channelTitle,
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
    const playlistId = getPlaylistId(url);
    const [imgError, setImgError] = React.useState(false);
    const [fallbackThumbnail, setFallbackThumbnail] = React.useState(null);

    // Use provided thumbnail, or fallback state
    const displayThumbnail = !imgError ? thumbnail : fallbackThumbnail;
    const displayCount = videoCount || getMockCount(id);
    const displayChannel = channelTitle || channel;

    // Fetch fallback thumbnail (first video) if main one fails
    React.useEffect(() => {
        if (imgError && playlistId && !fallbackThumbnail) {
            const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
            if (!API_KEY) return;

            fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${API_KEY}`)
                .then(res => res.json())
                .then(data => {
                    if (data.items?.[0]?.snippet?.thumbnails) {
                        const thumbs = data.items[0].snippet.thumbnails;
                        setFallbackThumbnail(thumbs.maxres?.url || thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url);
                    }
                })
                .catch(() => { }); // Silent fail
        }
    }, [imgError, playlistId, fallbackThumbnail]);

    return (
        <BaseCard
            id={id}
            type="playlist"
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
            {/* Thumbnail Section with Overlay */}
            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                {displayThumbnail ? (
                    <>
                        <img
                            src={displayThumbnail}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={() => !fallbackThumbnail && setImgError(true)}
                        />
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center opacity-80" />
                )}

                {/* Playlist Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-full p-4 border border-white/20 shadow-xl group-hover:scale-105 transition-transform duration-300">
                        <ListVideo className="w-8 h-8 text-white drop-shadow-md" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Video Count Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-sm border border-white/10 flex items-center gap-1.5 shadow-lg">
                    <ListVideo className="w-3 h-3" />
                    {displayCount} videos
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

                {/* Channel Name */}
                {displayChannel && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {displayChannel}
                    </p>
                )}

                {/* Description */}
                {description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {description}
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
