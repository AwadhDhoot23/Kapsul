import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pin, ExternalLink, CheckCircle2, Tag, Trash2 } from 'lucide-react';

export function BaseCard({
    id,
    type,
    isPinned = false,
    isCompleted = false,
    isSelected = false,
    selectionMode = false,
    onSelect,
    onPin,
    onClick,
    onDelete,
    onMarkComplete,
    onEditTags,
    children,
    className,
    ...props
}) {
    const handleCardClick = (e) => {
        // Don't trigger if clicking on checkbox or menu
        if (e.target.closest('.card-action')) return;
        onClick?.(id);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className={cn(
                "group relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden cursor-pointer shadow-sm",
                "hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-150",
                isSelected && "ring-2 ring-zinc-900 dark:ring-zinc-100",
                className
            )}
            onClick={handleCardClick}
            {...props}
        >
            {/* Top-Right Corner Actions */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 card-action">
                {/* Pin Icon (only if pinned) */}
                {isPinned && (
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <Pin className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" fill="currentColor" />
                    </div>
                )}

                {/* Checkbox (visible on hover or when selected) - Only if onSelect is provided */}
                {onSelect && (
                    <div className={cn(
                        "transition-opacity duration-200",
                        isSelected || selectionMode ? "opacity-100" : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    )}>
                        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onSelect?.(id)}
                                className="w-4 h-4"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Card Content */}
            {children}

            {/* Bottom-Right 3-Dot Menu */}
            <div className={cn(
                "absolute bottom-2 right-2 z-10 card-action transition-opacity duration-200",
                "opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            )}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-white dark:hover:bg-zinc-900"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(id); }}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>Open</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkComplete?.(id); }}>
                            <CheckCircle2 className={cn("mr-2 h-4 w-4", isCompleted && "text-green-500")} />
                            <span>{isCompleted ? 'Mark as Active' : 'Mark as Complete'}</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin?.(id); }}>
                            <Pin className="mr-2 h-4 w-4" />
                            <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
                            className="text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}
