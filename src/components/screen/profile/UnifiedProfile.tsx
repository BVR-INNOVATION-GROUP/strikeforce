/**
 * Unified Profile Component - used by all user roles
 * Displays clean, simple profile with role-specific sections
 */
"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/src/store";
import { UserI } from "@/src/models/user";
import { useToast } from "@/src/hooks/useToast";
import { userProfileService } from "@/src/services/userProfileService";
import OrganizationInfo from "@/src/components/screen/partner/profile/OrganizationInfo";
import { usePartnerProfileData } from "@/src/hooks/usePartnerProfileData";
import ProfileHeader from "./ProfileHeader";
import ProfileForm, { ProfileFormData } from "./ProfileForm";

export interface Props {
    user: UserI;
    onUserUpdate?: (user: UserI) => void;
}

/**
 * Unified profile component for all user roles
 * Shows role-specific sections based on user role
 */
const UnifiedProfile = ({ user, onUserUpdate }: Props) => {
    const { setUser } = useAuthStore();
    const { showSuccess } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<ProfileFormData>({
        name: user.name,
        bio: user.profile.bio || "",
        phone: user.profile.phone || "",
        location: user.profile.location || "",
        skills: user.profile.skills?.join(", ") || "",
    });

    // Partner-specific data - only load if user is a partner
    const partnerData = usePartnerProfileData(
        user.role === "partner" ? user : null
    );
    const organizationInfo =
        user.role === "partner" ? partnerData.organizationInfo : null;

    // Update form when user changes
    useEffect(() => {
        setFormData({
            name: user.name,
            bio: user.profile.bio || "",
            phone: user.profile.phone || "",
            location: user.profile.location || "",
            skills: user.profile.skills?.join(", ") || "",
        });
    }, [user]);

    // Handle save
    const handleSave = async () => {
        setSaving(true);
        try {
            let updatedUser = await userProfileService.updateProfile(user.id, {
                name: formData.name,
                bio: formData.bio,
                phone: formData.phone,
                location: formData.location,
            });

            // Handle skills for students - update in profile directly
            if (user.role === "student" && formData.skills !== undefined) {
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
                // Update via repository to persist skills
                const { userRepository } = await import(
                    "@/src/repositories/userRepository"
                );
                updatedUser = await userRepository.update(user.id, updatedUser);
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
        setFormData({
            name: user.name,
            bio: user.profile.bio || "",
            phone: user.profile.phone || "",
            location: user.profile.location || "",
            skills: user.profile.skills?.join(", ") || "",
        });
        setIsEditing(false);
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

            {/* Profile Header */}
            <ProfileHeader
                user={user}
                isEditing={isEditing}
                onEditClick={() => setIsEditing(true)}
                onUploadClick={() => {
                    showSuccess("Image upload coming soon!");
                }}
            />

            {/* Profile Form */}
            <ProfileForm
                user={user}
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
            {user.role === "partner" && organizationInfo && (
                <OrganizationInfo organizationInfo={organizationInfo} />
            )}

        </div>
    );
};

export default UnifiedProfile;
