/**
 * Signature Pad Component
 * Uses react-signature-canvas for signature capture
 * Supports both drawing and uploading signature images
 */
"use client";

import React, { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import Button from "@/src/components/core/Button";
import { RotateCcw, Upload, PenTool } from "lucide-react";

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

type SignatureMode = "draw" | "upload";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedRef = useRef<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [mode, setMode] = useState<SignatureMode>("draw");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Load initial signature if provided (only when it differs from what we just emitted)
  // This prevents the "signature moves up" bug: when we emit a signature, parent re-renders
  // and passes it back - we must NOT call fromDataURL in that case as it causes position shift
  useEffect(() => {
    if (initialSignature) {
      // Skip if this is the same signature we just emitted (prevents feedback loop / position shift)
      if (initialSignature === lastEmittedRef.current) {
        return;
      }
      // Check if it's a data URL (starts with data:)
      if (initialSignature.startsWith("data:")) {
        // Try to load it based on current mode
        if (mode === "draw" && sigPadRef.current) {
          try {
            sigPadRef.current.fromDataURL(initialSignature);
            setIsEmpty(false);
          } catch (error) {
            // If loading into canvas fails, treat as uploaded image
            setUploadedImage(initialSignature);
            setMode("upload");
            setIsEmpty(false);
          }
        } else if (mode === "upload") {
          setUploadedImage(initialSignature);
          setIsEmpty(false);
        }
      } else {
        // If it's not a data URL, treat as uploaded image
        setUploadedImage(initialSignature);
        setMode("upload");
        setIsEmpty(false);
      }
    } else {
      lastEmittedRef.current = null;
      // Clear signature if initialSignature is null/empty
      if (mode === "draw" && sigPadRef.current) {
        sigPadRef.current.clear();
      }
      setUploadedImage(null);
      setIsEmpty(true);
    }
  }, [initialSignature, mode]);

  // Check if canvas is empty
  const checkEmpty = () => {
    if (mode === "draw" && sigPadRef.current) {
      const empty = sigPadRef.current.isEmpty();
      setIsEmpty(empty);
      if (onSignatureChange) {
        const dataUrl = empty ? null : sigPadRef.current.toDataURL();
        lastEmittedRef.current = dataUrl;
        onSignatureChange(dataUrl);
      }
    } else if (mode === "upload") {
      const empty = !uploadedImage;
      setIsEmpty(empty);
      if (onSignatureChange) {
        const val = empty ? null : uploadedImage;
        lastEmittedRef.current = val;
        onSignatureChange(val);
      }
    }
  };

  // Handle signature end (draw mode)
  const handleEnd = () => {
    checkEmpty();
  };

  // Clear signature
  const handleClear = () => {
    if (mode === "draw" && sigPadRef.current) {
      sigPadRef.current.clear();
      lastEmittedRef.current = null;
      setIsEmpty(true);
      if (onSignatureChange) {
        onSignatureChange(null);
      }
    } else if (mode === "upload") {
      setUploadedImage(null);
      lastEmittedRef.current = null;
      setIsEmpty(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onSignatureChange) {
        onSignatureChange(null);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target?.result as string;
      setUploadedImage(dataURL);
      lastEmittedRef.current = dataURL;
      setIsEmpty(false);
      if (onSignatureChange) {
        onSignatureChange(dataURL);
      }
    };
    reader.onerror = () => {
      alert("Failed to read the image file");
    };
    reader.readAsDataURL(file);
  };

  // Handle mode switch
  const handleModeSwitch = (newMode: SignatureMode) => {
    if (disabled) return;
    
    lastEmittedRef.current = null;
    // Clear current signature when switching modes
    if (mode === "draw" && sigPadRef.current) {
      sigPadRef.current.clear();
    } else if (mode === "upload") {
      setUploadedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    
    setMode(newMode);
    setIsEmpty(true);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex gap-2 border-b border-custom">
        <button
          type="button"
          onClick={() => handleModeSwitch("draw")}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            mode === "draw"
              ? "border-b-2 border-primary text-primary"
              : "text-secondary hover:text-primary"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <PenTool size={16} className="inline mr-2" />
          Draw
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("upload")}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            mode === "upload"
              ? "border-b-2 border-primary text-primary"
              : "text-secondary hover:text-primary"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Upload size={16} className="inline mr-2" />
          Upload
        </button>
      </div>

      {/* Draw Mode */}
      {mode === "draw" && (
        <div
          className="relative border-2 border-custom rounded-lg overflow-hidden bg-white"
          style={{ width: `${width}px`, maxWidth: "100%", minHeight: `${height}px` }}
        >
          <SignatureCanvas
            ref={sigPadRef}
            clearOnResize={false}
            canvasProps={{
              width,
              height,
              className: "signature-canvas",
              style: {
                display: "block",
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
      )}

      {/* Upload Mode */}
      {mode === "upload" && (
        <div className="flex flex-col gap-3">
          <div
            className="relative border-2 border-custom rounded-lg overflow-hidden bg-white flex items-center justify-center"
            style={{ width: `${width}px`, maxWidth: "100%", minHeight: `${height}px` }}
          >
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Uploaded signature"
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: `${height}px` }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Upload size={48} className="text-secondary mb-4" />
                <p className="text-sm text-secondary mb-2">
                  No signature uploaded yet
                </p>
                <p className="text-xs text-secondary">
                  Click the button below to upload an image
                </p>
              </div>
            )}
            {disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                <p className="text-sm text-secondary">Signature locked</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={disabled}
            className="hidden"
            id="signature-upload-input"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="bg-pale text-primary text-sm px-3 py-1.5 w-fit"
          >
            <Upload size={14} className="mr-1" />
            {uploadedImage ? "Change Image" : "Upload Signature Image"}
          </Button>
        </div>
      )}
      
      {/* Action Buttons */}
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
          <p className="text-xs text-secondary">
            Please {mode === "draw" ? "sign above" : "upload an image"} above
          </p>
        )}
        {!isEmpty && !disabled && (
          <p className="text-xs text-green-600">✓ Signature captured</p>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;



