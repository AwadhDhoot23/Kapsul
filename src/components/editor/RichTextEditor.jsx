import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Highlighter,
    Check
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const highlightColors = [
        { name: 'Yellow', value: '#fef08a' }, // yellow-200
        { name: 'Green', value: '#bbf7d0' },  // green-200
        { name: 'Blue', value: '#bfdbfe' },   // blue-200
        { name: 'Pink', value: '#fbcfe8' },   // pink-200
        { name: 'Purple', value: '#e9d5ff' }, // purple-200
    ];

    return (
        <div className="flex items-center gap-1 p-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-t-md">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(
                    "h-8 w-8",
                    editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-800' : ''
                )}
                title="Bold (Cmd+B)"
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn(
                    "h-8 w-8",
                    editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-800' : ''
                )}
                title="Italic (Cmd+I)"
            >
                <Italic className="w-4 h-4" />
            </Button>

            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    "h-8 w-8",
                    editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-800' : ''
                )}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                    "h-8 w-8",
                    editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-800' : ''
                )}
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8",
                            editor.isActive('highlight') ? 'bg-zinc-200 dark:bg-zinc-800' : ''
                        )}
                        title="Highlight"
                    >
                        <Highlighter className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem onClick={() => editor.chain().focus().unsetHighlight().run()}>
                        <span className="flex-1">None</span>
                        {!editor.isActive('highlight') && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                    {highlightColors.map((color) => (
                        <DropdownMenuItem
                            key={color.name}
                            onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-700"
                                style={{ backgroundColor: color.value }}
                            />
                            <span className="flex-1">{color.name}</span>
                            {editor.isActive('highlight', { color: color.value }) && <Check className="w-4 h-4" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export const RichTextEditor = ({ content, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
                emptyEditorClass: 'cursor-text before:content-[attr(data-placeholder)] before:text-zinc-400 before:float-left before:pointer-events-none',
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[200px] max-w-none px-3 py-2 tiptap-editor',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <>
            <style>{`
                .tiptap-editor mark {
                    color: #000 !important;
                    padding: 3px 6px !important;
                    border-radius: 4px !important;
                    font-weight: 500 !important;
                }
                
                .tiptap-editor ul,
                .tiptap-editor ol {
                    padding-left: 1.5rem !important;
                    margin: 0.5rem 0 !important;
                }
                
                .tiptap-editor ul li,
                .tiptap-editor ol li {
                    margin: 0.25rem 0 !important;
                }
                
                .tiptap-editor ul {
                    list-style-type: disc !important;
                }
                
                .tiptap-editor ol {
                    list-style-type: decimal !important;
                }
            `}</style>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100">
                <MenuBar editor={editor} />
                <EditorContent editor={editor} />
            </div>
        </>
    );
};

export default RichTextEditor;
