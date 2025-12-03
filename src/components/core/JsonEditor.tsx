"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Copy, Download } from "lucide-react";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";

export interface Props {
  title?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  rows?: number;
  readOnly?: boolean;
}

/**
 * JSON Editor component with syntax highlighting and validation
 */
const JsonEditor = ({
  title,
  value,
  onChange,
  placeholder = '{\n  "key": "value"\n}',
  error,
  className = "",
  rows = 12,
  readOnly = false,
}: Props) => {
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [highlightedContent, setHighlightedContent] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // Validate JSON and update highlighting
  useEffect(() => {
    if (!value.trim()) {
      setIsValid(true);
      setValidationError(null);
      setHighlightedContent("");
      return;
    }

    try {
      JSON.parse(value);
      setIsValid(true);
      setValidationError(null);
    } catch (err) {
      setIsValid(false);
      const errorMessage = err instanceof Error ? err.message : "Invalid JSON";
      setValidationError(errorMessage);
    }

    // Generate highlighted HTML
    const highlighted = highlightJson(value);
    setHighlightedContent(highlighted);
  }, [value]);

  // Sync scroll between textarea and highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Format JSON
  const handleFormat = () => {
    if (!value.trim()) return;

    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
    } catch (err) {
      // Already validated, shouldn't happen
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Highlight JSON syntax
  const highlightJson = (json: string): string => {
    if (!json.trim()) return "";

    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = "json-number";
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "json-key";
            } else {
              cls = "json-string";
            }
          } else if (/true|false/.test(match)) {
            cls = "json-boolean";
          } else if (/null/.test(match)) {
            cls = "json-null";
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  };

  const displayError = error || validationError;
  const hasError = !!displayError;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{title}</p>
          <div className="flex items-center gap-2">
            {value.trim() && (
              <>
                {isValid ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 size={14} />
                    <span>Valid JSON</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <XCircle size={14} />
                    <span>Invalid JSON</span>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={handleFormat}
                  className="text-xs py-1 px-2 bg-pale text-primary"
                  disabled={!isValid || readOnly}
                >
                  Format
                </Button>
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs py-1 px-2 bg-pale text-primary"
                >
                  <Copy size={12} className="mr-1" />
                  Copy
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative bg-paper rounded-lg overflow-hidden">
        {/* Syntax highlighting overlay */}
        {value && (
          <pre
            ref={highlightRef}
            className="absolute inset-0 p-3 m-0 pointer-events-none overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-[1.5] border-0 rounded-lg"
            style={{
              zIndex: 1,
              backgroundColor: "var(--paper, #f9f9f9)",
            }}
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder=""
          rows={rows}
          readOnly={readOnly}
          className={`relative w-full p-3 font-mono text-sm leading-[1.5] bg-transparent border rounded-lg resize-y outline-none ${
            hasError
              ? "border-red-500 focus:border-red-500"
              : isValid && value.trim()
              ? "border-green-500/50 focus:border-primary"
              : "border-custom focus:border-primary"
          } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
          style={{
            color: value ? "transparent" : "inherit",
            caretColor: "var(--text-default, #000)",
            zIndex: 2,
          }}
        />

        {/* Placeholder overlay when empty */}
        {!value && (
          <div className="absolute inset-0 p-3 pointer-events-none font-mono text-sm leading-[1.5] text-muted flex items-start">
            {placeholder}
          </div>
        )}
      </div>

      {displayError && <ErrorMessage message={displayError} />}
    </div>
  );
};

export default JsonEditor;

