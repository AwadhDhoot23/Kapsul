import React from 'react';
import { BaseCard } from './BaseCard';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';

export function LinkCard({
    id,
    url,
    title,
    domain,
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
    // Generate subtle gradient based on domain hash
    const generateGradient = (str) => {
        if (!str) return 'bg-gradient-to-br from-zinc-800 to-zinc-950';

        // Simple hash
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Vibrant gradients for dark mode
        const gradients = [
            'bg-gradient-to-br from-blue-600 to-violet-600',
            'bg-gradient-to-br from-emerald-500 to-teal-500',
            'bg-gradient-to-br from-orange-500 to-red-500',
            'bg-gradient-to-br from-pink-500 to-rose-500',
            'bg-gradient-to-br from-indigo-500 to-cyan-500',
            'bg-gradient-to-br from-fuchsia-600 to-purple-600',
        ];

        return gradients[Math.abs(hash) % gradients.length];
    };

    const gradient = generateGradient(domain || title);

    return (
        <BaseCard
            id={id}
            type="link"
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
            {/* Dotted Pattern Background */}
            <div className={`relative aspect-video w-full flex flex-col items-center justify-center p-6 transition-transform duration-500 group-hover:scale-105 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800`}>
                <div className="absolute inset-0 z-0 opacity-[0.4]" style={{
                    backgroundImage: 'radial-gradient(#a1a1aa 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col items-center">
                    {domain && (
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                            alt={domain}
                            className="w-10 h-10 mb-3 shadow-sm rounded-lg bg-white p-1 ring-1 ring-zinc-200 dark:ring-zinc-800"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    )}

                    {/* Title Overlay (Serif, Large) */}
                    <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100 text-center line-clamp-2 leading-tight drop-shadow-sm">
                        {title}
                    </h3>
                </div>

                {/* Saved Time Indicator (Hover) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 w-max">
                    <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 bg-white/80 dark:bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800">
                        {formatRelativeTime(createdAt)}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-3 space-y-2">
                {/* Full Title Below */}
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                    {title}
                </h4>

                {/* Domain Text */}
                {domain && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {domain}
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
