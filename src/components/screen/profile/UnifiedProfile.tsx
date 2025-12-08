/**
 * Unified Profile Component - used by all user roles
 * Displays clean, simple profile with role-specific sections
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/src/store";
import { UserI } from "@/src/models/user";
import { useToast } from "@/src/hooks/useToast";
import { userProfileService } from "@/src/services/userProfileService";
import { uploadProfilePicture } from "@/src/utils/profilePictureUpload";
import OrganizationInfo from "@/src/components/screen/partner/profile/OrganizationInfo";
import { usePartnerProfileData } from "@/src/hooks/usePartnerProfileData";
import ProfileHeader from "./ProfileHeader";
import ProfileForm, { ProfileFormData } from "./ProfileForm";
import ProfilePictureCropper from "./ProfilePictureCropper";

export interface Props {
    user: UserI;
    onUserUpdate?: (user: UserI) => void;
}

/**
 * Unified profile component for all user roles
 * Shows role-specific sections based on user role
 */
const UnifiedProfile = ({ user, onUserUpdate }: Props) => {
    const { setUser, user: authUser } = useAuthStore();
    const { showSuccess, showError } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageForCrop, setImageForCrop] = useState<string | null>(null);
    const [croppedFile, setCroppedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use prop user or fallback to auth store user
    const currentUser = user || authUser;

    // Helper function to get user ID (handles both 'id' and 'ID' from backend)
    const getUserId = (userObj: UserI | null | undefined): number | null => {
        if (!userObj) return null;
        return (userObj as any).id ?? (userObj as any).ID ?? null;
    };

    // Form state
    const [formData, setFormData] = useState<ProfileFormData>({
        name: currentUser?.name || "",
        bio: currentUser?.profile?.bio || "",
        phone: currentUser?.profile?.phone || "",
        location: currentUser?.profile?.location || "",
        skills: currentUser?.profile?.skills?.join(", ") || "",
    });

    // Partner-specific data - only load if user is a partner
    const partnerData = usePartnerProfileData(
        currentUser?.role === "partner" ? currentUser : null
    );
    const organizationInfo =
        currentUser?.role === "partner" ? partnerData.organizationInfo : null;

    // Update form when user changes
    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                bio: currentUser.profile?.bio || "",
                phone: currentUser.profile?.phone || "",
                location: currentUser.profile?.location || "",
                skills: currentUser.profile?.skills?.join(", ") || "",
            });
        }
    }, [currentUser]);

    // Handle save
    const handleSave = async () => {
        if (!currentUser) {
            showError("User information is not available. Please refresh the page.");
            return;
        }

        setSaving(true);
        try {
            let updatedUser = await userProfileService.updateProfile({
                name: formData.name,
                bio: formData.bio,
                phone: formData.phone,
                location: formData.location,
            });

            // Handle skills for students - update in profile directly
            if (currentUser.role === "student" && formData.skills !== undefined) {
                const skillsArray = formData.skills
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                updatedUser = {
                    ...updatedUser,
                    profile: {
                        ...updatedUser.profile,
                        skills: skillsArray,
                    },
                };
                // Update via repository to persist skills (backend uses token's user_id)
                const { userRepository } = await import(
                    "@/src/repositories/userRepository"
                );
                updatedUser = await userRepository.updateCurrent(updatedUser);
            }

            setUser(updatedUser);
            if (onUserUpdate) {
                onUserUpdate(updatedUser);
            }
            setIsEditing(false);
            showSuccess("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                bio: currentUser.profile?.bio || "",
                phone: currentUser.profile?.phone || "",
                location: currentUser.profile?.location || "",
                skills: currentUser.profile?.skills?.join(", ") || "",
            });
        }
        setIsEditing(false);
    };

    // Handle profile picture upload
    const handleProfilePictureUpload = async (file: File) => {
        setUploading(true);
        try {
            // Ensure user exists
            if (!currentUser) {
                throw new Error("User information is not available. Please refresh the page.");
            }

            // File is already cropped and compressed to 40% by ProfilePictureCropper
            // Get user ID for Cloudinary folder organization (optional)
            const userId = getUserId(currentUser);

            // Upload to Cloudinary (userId is optional for folder organization)
            const avatarUrl = await uploadProfilePicture(
                file,
                userId ? String(userId) : undefined
            );

            // Update user profile with new avatar URL (backend uses token's user_id)
            const updatedUser = await userProfileService.updateProfile({
                avatar: avatarUrl,
            });

            // Update auth store and notify parent
            setUser(updatedUser);
            if (onUserUpdate) {
                onUserUpdate(updatedUser);
            }

            showSuccess("Profile picture updated successfully!");
        } catch (error) {
            console.error("Failed to upload profile picture:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to upload profile picture. Please try again.";
            showError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    // Handle crop complete
    const handleCropComplete = async (croppedImageBlob: Blob) => {
        // Convert blob to file
        const file = new File([croppedImageBlob], "profile-picture.jpg", {
            type: "image/jpeg",
        });
        setCroppedFile(file);
        
        // Close cropper
        setImageForCrop(null);
        
        // Upload the cropped and compressed image
        await handleProfilePictureUpload(file);
        
        // Reset state
        setCroppedFile(null);
    };

    // Handle crop cancel
    const handleCropCancel = () => {
        setImageForCrop(null);
        setCroppedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle file input change
    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Prevent multiple simultaneous uploads
        if (uploading) {
            showError("Please wait for the current upload to complete");
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            showError(
                "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
            );
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError("File size exceeds 5MB limit");
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Read file and show cropper
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageUrl = reader.result as string;
            setImageForCrop(imageUrl);
        };
        reader.readAsDataURL(file);

        // Reset input so the same file can be selected again
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }, 100);
    };

    // Trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full flex flex-col h-full overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex-shrink-0">
                <div className="mb-4">
                    <h1 className="text-[1rem] font-[600] mb-2">Profile</h1>
                    <p className="text-[0.875rem] opacity-60">
                        Manage your personal information
                    </p>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                style={{ display: "none" }}
            />

            {!currentUser ? (
                <div className="w-full flex items-center justify-center p-8">
                    <p className="text-sm opacity-60">Loading user information...</p>
                </div>
            ) : (
                <>
                    {/* Profile Header */}
                    <ProfileHeader
                        user={currentUser}
                        isEditing={isEditing}
                        uploading={uploading}
                        onEditClick={() => setIsEditing(true)}
                        onUploadClick={handleUploadClick}
                    />

                    {/* Profile Form */}
                    <ProfileForm
                        user={currentUser}
                        formData={formData}
                        isEditing={isEditing}
                        saving={saving}
                        onChange={(field, value) =>
                            setFormData({ ...formData, [field]: value })
                        }
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />

                    {/* Role-specific sections */}
                    {currentUser.role === "partner" && organizationInfo && (
                        <OrganizationInfo organizationInfo={organizationInfo} />
                    )}
                </>
            )}

            {/* Profile Picture Cropper Modal */}
            <ProfilePictureCropper
                image={imageForCrop || ""}
                open={!!imageForCrop}
                onCropComplete={handleCropComplete}
                onCancel={handleCropCancel}
            />
        </div>
    );
};

export default UnifiedProfile;
