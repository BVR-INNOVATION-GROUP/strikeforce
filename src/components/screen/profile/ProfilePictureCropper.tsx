/**
 * Profile Picture Cropper Component
 * Provides image cropping functionality for profile pictures
 */
"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import Button from "@/src/components/core/Button";
import Modal from "@/src/components/base/Modal";

interface ProfilePictureCropperProps {
  image: string;
  open: boolean;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

const ProfilePictureCropper: React.FC<ProfilePictureCropperProps> = ({
  image,
  open,
  onCropComplete,
  onCancel,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    // Set canvas size to match cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert canvas to blob with 40% quality (0.4)
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.4 // 40% quality
      );
    });
  };

  const handleCrop = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    setProcessing(true);
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImageBlob);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      open={open}
      handleClose={onCancel}
      title="Crop Your Profile Picture"
      actions={[
        <Button
          key="cancel"
          type="button"
          onClick={onCancel}
          className="bg-pale"
          disabled={processing}
        >
          Cancel
        </Button>,
        <Button
          key="apply"
          type="button"
          onClick={handleCrop}
          className="bg-primary text-white"
          disabled={processing || !croppedAreaPixels}
        >
          {processing ? "Processing..." : "Apply Crop & Continue"}
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <p className="text-[0.875rem] opacity-60">
          Adjust the crop area and zoom to get the perfect profile picture
        </p>

        {/* Cropper Container */}
        <div className="relative w-full bg-pale rounded-lg overflow-hidden" style={{ height: "400px" }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square aspect ratio for profile pictures
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
            cropShape="round" // Round crop for profile pictures
            showGrid={true}
            style={{
              containerStyle: {
                width: "100%",
                height: "100%",
                position: "relative",
                backgroundColor: "transparent",
              },
              cropAreaStyle: {
                border: "2px solid rgba(233, 34, 110, 0.8)",
                boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.4)",
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Zoom Control */}
          <div className="space-y-2">
            <label className="text-[0.875rem] font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>Zoom</span>
                <span className="text-xs font-normal opacity-60">(Use to adjust image size)</span>
              </span>
              <span className="text-[0.875rem] font-[600] opacity-80">{(zoom * 100).toFixed(0)}%</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-60 w-8">1x</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-pale rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs opacity-60 w-8">3x</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-pale rounded-lg p-3 border border-custom">
            <p className="text-xs opacity-80">
              💡 <strong>Tip:</strong> Drag the image to reposition it. The profile picture will be cropped to a square format.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProfilePictureCropper;










