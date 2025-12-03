/**
 * RichTextEditor - TipTap-based rich text editor component
 * Provides formatting options for text input
 */
"use client";

import React, { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Undo, Redo, Heading1, Heading2, Heading3, Link as LinkIcon, Code, Quote } from "lucide-react";
import Button from "./Button";

export interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  title?: string;
  rows?: number;
}

export interface RichTextEditorRef {
  focus: () => void;
  clear: () => void;
}

/**
 * RichTextEditor component using TipTap
 */
const RichTextEditor = forwardRef<RichTextEditorRef, Props>(
  ({ value, onChange, placeholder, error, className = "", title, rows = 6 }, ref) => {
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          codeBlock: {
            HTMLAttributes: {
              class: "bg-slate-100 rounded p-2 font-mono text-sm",
            },
          },
        }),
        Placeholder.configure({
          placeholder: placeholder || "Start typing...",
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline",
          },
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

    /**
     * Handle link insertion
     */
    const handleAddLink = () => {
      if (linkUrl) {
        editor?.chain().focus().setLink({ href: linkUrl }).run();
        setLinkUrl("");
        setShowLinkInput(false);
      }
    };

    /**
     * Remove link
     */
    const handleRemoveLink = () => {
      editor?.chain().focus().unsetLink().run();
      setShowLinkInput(false);
    };

    if (!editor) {
      return null;
    }

    return (
      <div className={className}>
        {title && <p className="mb-3 text-[12px]">{title}</p>}
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-pale rounded-t-lg border-b border-custom">
          {/* Headings */}
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 ${
              editor.isActive("heading", { level: 1 })
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 ${
              editor.isActive("heading", { level: 2 })
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 ${
              editor.isActive("heading", { level: 3 })
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </Button>
          <div className="w-px h-6 bg-custom mx-1" />
          
          {/* Text Formatting */}
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
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 ${
              editor.isActive("code")
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Inline Code"
          >
            <Code size={16} />
          </Button>
          <div className="w-px h-6 bg-custom mx-1" />
          
          {/* Lists */}
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
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 ${
              editor.isActive("blockquote")
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Quote"
          >
            <Quote size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 ${
              editor.isActive("codeBlock")
                ? "bg-primary text-white"
                : "bg-paper text-primary hover:bg-very-pale"
            }`}
            title="Code Block"
          >
            <Code size={16} />
          </Button>
          <div className="w-px h-6 bg-custom mx-1" />
          
          {/* Link */}
          <div className="relative">
            <Button
              type="button"
              onClick={() => {
                if (editor.isActive("link")) {
                  handleRemoveLink();
                } else {
                  setShowLinkInput(!showLinkInput);
                }
              }}
              className={`p-2 ${
                editor.isActive("link")
                  ? "bg-primary text-white"
                  : "bg-paper text-primary hover:bg-very-pale"
              }`}
              title="Link"
            >
              <LinkIcon size={16} />
            </Button>
            {showLinkInput && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-paper border border-custom rounded-lg shadow-lg z-10 flex gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="px-2 py-1 text-sm border border-custom rounded"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddLink();
                    } else if (e.key === "Escape") {
                      setShowLinkInput(false);
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={handleAddLink}
                  className="px-2 py-1 text-xs bg-primary text-white"
                >
                  Add
                </Button>
              </div>
            )}
          </div>
          <div className="w-px h-6 bg-custom mx-1" />
          
          {/* Undo/Redo */}
          <Button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 bg-paper text-primary hover:bg-very-pale disabled:opacity-50"
            title="Undo"
          >
            <Undo size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 bg-paper text-primary hover:bg-very-pale disabled:opacity-50"
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
