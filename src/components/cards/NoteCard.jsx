import React from 'react';
import { BaseCard } from './BaseCard';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import { FileText } from 'lucide-react';

export function NoteCard({
    id,
    title,
    preview,
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
    // Determine preview text to show
    const displayPreview = preview || 'No content';

    return (
        <BaseCard
            id={id}
            type="note"
            isPinned={isPinned}
            isCompleted={isCompleted}
            isSelected={isSelected}
            onSelect={onSelect}
            onPin={onPin}
            onClick={onClick}
            onDelete={onDelete}
            onMarkComplete={onMarkComplete}
            onEditTags={onEditTags}
            className="group"
        >
            <div className="flex flex-col h-full p-5 pb-10 bg-white dark:bg-zinc-900 transition-colors">

                {/* Header: Icon & Type */}
                <div className="flex items-center gap-2 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Note</span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl font-medium text-zinc-900 dark:text-zinc-50 mb-2 leading-tight">
                    {title}
                </h3>

                {/* Preview Content */}
                <div className="flex-1">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4 font-sans">
                        {displayPreview}
                    </p>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map((tag, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-5 font-normal bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

            </div>

            {/* Saved Time Indicator (Hover) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 w-max">
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800">
                    {formatRelativeTime(createdAt)}
                </span>
            </div>
        </BaseCard>
    );
}
