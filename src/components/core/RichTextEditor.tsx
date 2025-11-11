/**
 * RichTextEditor - TipTap-based rich text editor component
 * Provides formatting options for text input
 */
"use client";

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Undo, Redo } from "lucide-react";
import Button from "./Button";

export interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export interface RichTextEditorRef {
  focus: () => void;
  clear: () => void;
}

/**
 * RichTextEditor component using TipTap
 */
const RichTextEditor = forwardRef<RichTextEditorRef, Props>(
  ({ value, onChange, placeholder, error, className = "" }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // Disable heading to keep it simple
          heading: false,
        }),
        Placeholder.configure({
          placeholder: placeholder || "Start typing...",
        }),
      ],
      content: value,
      immediatelyRender: false, // Prevent SSR hydration mismatch
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class:
            "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
        },
      },
    });

    // Sync editor content when value prop changes (for reset functionality)
    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, false);
      }
    }, [value, editor]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        editor?.commands.focus();
      },
      clear: () => {
        editor?.commands.clearContent();
      },
    }));

    if (!editor) {
      return null;
    }

    return (
      <div className={className}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-pale rounded-t-lg border-b border-custom">
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 ${
              editor.isActive("bold")
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Bold"
          >
            <Bold size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 ${
              editor.isActive("italic")
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Italic"
          >
            <Italic size={16} />
          </Button>
          <div className="w-px h-6 bg-custom mx-1" />
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 ${
              editor.isActive("bulletList")
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Bullet List"
          >
            <List size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 ${
              editor.isActive("orderedList")
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </Button>
          <div className="w-px h-6 bg-custom mx-1" />
          <Button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 bg-paper text-primary hover:bg-very-pale"
            title="Undo"
          >
            <Undo size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 bg-paper text-primary hover:bg-very-pale"
            title="Redo"
          >
            <Redo size={16} />
          </Button>
        </div>

        {/* Editor Content */}
        <div
          className={`border border-custom rounded-b-lg bg-paper ${
            error ? "border-red-500" : ""
          }`}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}

      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
