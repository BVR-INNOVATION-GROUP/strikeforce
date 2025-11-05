"use client";
import React, { useRef, useEffect, useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Type } from "lucide-react";
import ErrorMessage from "./ErrorMessage";

/**
 * CSS for placeholder styling in contentEditable
 */
const placeholderStyle = `
  .rich-text-editor[contenteditable][data-placeholder]:empty:before {
    content: attr(data-placeholder);
    color: rgba(107, 114, 128, 0.5);
    pointer-events: none;
  }
  .rich-text-editor[contenteditable]:focus {
    outline: none;
  }
  .rich-text-editor[contenteditable]:focus-visible {
    outline: none;
  }
`;

export interface Props {
  title?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
}

/**
 * Minimalist rich text editor with basic formatting
 * Uses contentEditable for simplicity
 */
const RichTextEditor = ({
  title,
  value,
  onChange,
  placeholder = "Enter text...",
  error,
  rows = 6,
}: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [headingSize, setHeadingSize] = useState<string>("p");

  /**
   * Initialize editor with value
   */
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  /**
   * Handle content change
   */
  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  /**
   * Execute formatting command
   * Ensures editor is focused and maintains selection for proper list handling
   */
  const executeCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    // Focus editor first to ensure commands work properly
    editorRef.current.focus();

    // For list commands, ensure we have a selection or create one
    if (command === "insertOrderedList" || command === "insertUnorderedList") {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        // Create a range if no selection exists
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // Collapse to end
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }

    // Execute command
    if (value) {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false);
    }

    // Update heading size state for formatBlock commands
    if (command === "formatBlock") {
      setHeadingSize(value || "p");
    }

    handleInput();
    editorRef.current.focus();
  };

  /**
   * Handle heading size change
   * formatBlock expects tag name without angle brackets
   */
  const handleHeadingChange = (size: string) => {
    const blockTag = size === "p" ? "p" : `h${size}`;
    executeCommand("formatBlock", blockTag);
    setHeadingSize(size);
  };

  /**
   * Handle paste to strip formatting
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
  };

  const toolbarButtons = [
    {
      icon: Bold,
      command: "bold",
      label: "Bold",
      isHeading: false,
    },
    {
      icon: Italic,
      command: "italic",
      label: "Italic",
      isHeading: false,
    },
    {
      icon: Underline,
      command: "underline",
      label: "Underline",
      isHeading: false,
    },
    {
      icon: List,
      command: "insertUnorderedList",
      label: "Bullet List",
      isHeading: false,
    },
    {
      icon: ListOrdered,
      command: "insertOrderedList",
      label: "Numbered List",
      isHeading: false,
    },
  ];

  return (
    <div className="flex flex-col gap-1 w-full">
      <style>{placeholderStyle}</style>
      {title && <p className="mb-3 text-[12px]">{title}</p>}
      <div
        className={`border border-custom rounded-lg overflow-hidden w-full ${error ? "border-red-500" : isFocused ? "border-primary" : ""
          }`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-custom bg-pale flex-wrap">
          {/* Heading size selector */}
          <div className="flex items-center gap-1 border-r border-custom pr-1 mr-1">
            <Type size={14} opacity={0.7} className="flex-shrink-0" />
            <select
              value={headingSize}
              onChange={(e) => handleHeadingChange(e.target.value)}
              className="text-xs bg-transparent border-none outline-none cursor-pointer px-1"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <option value="p">Paragraph</option>
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
              <option value="5">H5</option>
              <option value="6">H6</option>
            </select>
          </div>

          {/* Formatting buttons */}
          {toolbarButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.command}
                type="button"
                onClick={() => executeCommand(button.command)}
                className="p-2 rounded hover:bg-very-pale transition-colors flex-shrink-0"
                title={button.label}
              >
                <Icon size={16} opacity={0.7} />
              </button>
            );
          })}
        </div>

        {/* Editor - fixed height to prevent modal size changes */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="rich-text-editor p-3 outline-none focus:outline-none text-sm overflow-y-auto w-full"
          style={{
            maxHeight: `${rows * 20}px`,
            minHeight: `${rows * 18}px`,
          }}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>
      {/* Error message with fixed height to prevent layout shifts */}
      <div className="mt-1 min-h-[20px]">
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
};

export default RichTextEditor;

