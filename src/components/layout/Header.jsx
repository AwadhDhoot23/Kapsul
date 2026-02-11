import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LayoutList, LayoutGrid, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';

export function Header({ viewMode, setViewMode, onMenuClick, onSearchClick }) {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    return (
        <header className="sticky top-0 z-30 w-full h-16 border-b border-zinc-300 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 shadow-sm">

            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="lg:hidden text-zinc-600 dark:text-zinc-400"
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Global Search Button - Centered */}
            <div className="flex-1 flex justify-center max-w-2xl mx-auto">
                <button
                    onClick={onSearchClick}
                    className="w-full max-w-md flex items-center gap-3 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-800 rounded-lg transition-colors text-left group shadow-sm"
                >
                    <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
                    <span className="flex-1 text-sm text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">Search everything...</span>
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 bg-white dark:bg-zinc-950 rounded border border-zinc-300 dark:border-zinc-700 font-mono shadow-sm">
                        <span className="text-xs">Ctrl +</span> K
                    </kbd>
                </button>
            </div>

            {/* Right Side: User Menu */}
            <div className="flex items-center gap-2 sm:gap-4">





                {/* User Avatar Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-9 w-9 border border-zinc-300 dark:border-zinc-700">
                                <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">
                                    {user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">
                                    {user?.displayName || 'User'}
                                </p>
                                <p className="text-xs leading-none text-zinc-500">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header >
    );
}
