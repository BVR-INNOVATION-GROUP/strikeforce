/**
 * Signature Pad Component
 * Uses react-signature-canvas for signature capture
 */
"use client";

import React, { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import Button from "@/src/components/core/Button";
import { RotateCcw, X } from "lucide-react";

export interface SignaturePadProps {
  onSignatureChange?: (signatureData: string | null) => void;
  initialSignature?: string | null;
  width?: number;
  height?: number;
  backgroundColor?: string;
  penColor?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Signature pad component for capturing digital signatures
 */
const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  initialSignature = null,
  width = 600,
  height = 200,
  backgroundColor = "#ffffff",
  penColor = "#000000",
  disabled = false,
  className = "",
}) => {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Load initial signature if provided
  useEffect(() => {
    if (initialSignature && sigPadRef.current && isEmpty) {
      sigPadRef.current.fromDataURL(initialSignature);
      setIsEmpty(false);
    }
  }, [initialSignature, isEmpty]);

  // Check if canvas is empty
  const checkEmpty = () => {
    if (sigPadRef.current) {
      const empty = sigPadRef.current.isEmpty();
      setIsEmpty(empty);
      if (onSignatureChange) {
        onSignatureChange(empty ? null : sigPadRef.current.toDataURL());
      }
    }
  };

  // Handle signature end
  const handleEnd = () => {
    checkEmpty();
  };

  // Clear signature
  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setIsEmpty(true);
      if (onSignatureChange) {
        onSignatureChange(null);
      }
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div
        className="relative border-2 border-custom rounded-lg overflow-hidden bg-white"
        style={{ width: `${width}px`, maxWidth: "100%" }}
      >
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            width,
            height,
            className: "signature-canvas",
            style: {
              backgroundColor,
              cursor: disabled ? "not-allowed" : "crosshair",
            },
          }}
          penColor={penColor}
          onEnd={handleEnd}
          backgroundColor={backgroundColor}
          disabled={disabled}
        />
        {disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
            <p className="text-sm text-secondary">Signature locked</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleClear}
          disabled={disabled || isEmpty}
          className="bg-pale text-primary text-sm px-3 py-1.5"
        >
          <RotateCcw size={14} className="mr-1" />
          Clear
        </Button>
        {isEmpty && !disabled && (
          <p className="text-xs text-secondary">Please sign above</p>
        )}
        {!isEmpty && !disabled && (
          <p className="text-xs text-green-600">✓ Signature captured</p>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;

