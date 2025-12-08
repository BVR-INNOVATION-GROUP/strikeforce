/**
 * Profile Header Component - displays avatar and edit button
 */
"use client";

import React from "react";
import Avatar from "@/src/components/core/Avatar";
import Button from "@/src/components/core/Button";
import Card from "@/src/components/core/Card";
import { Edit, Upload, Loader2 } from "lucide-react";
import { UserI } from "@/src/models/user";

export interface Props {
    user: UserI;
    isEditing: boolean;
    uploading?: boolean;
    onEditClick: () => void;
    onUploadClick: () => void;
}

/**
 * Profile header with avatar and edit button
 */
const ProfileHeader = ({
    user,
    isEditing,
    uploading = false,
    onEditClick,
    onUploadClick,
}: Props) => {
    return (
        <Card title="Profile Picture">
            <div className="flex items-center gap-6">
                <Avatar
                    src={user.profile.avatar}
                    name={user.name}
                    size="lg"
                    className="w-24 h-24"
                />
                {isEditing ? (
                    <div>
                        <Button
                            type="button"
                            className="bg-pale text-primary"
                            onClick={onUploadClick}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} className="mr-2" />
                                    Change Photo
                                </>
                            )}
                        </Button>
                        <p className="text-xs opacity-60 mt-2">
                            JPG, PNG, GIF or WebP. Max size 5MB
                        </p>
                    </div>
                ) : (
                    <Button
                        className="bg-primary  rounded-full"
                        onClick={onEditClick}
                        disabled={uploading}
                    >
                        <Edit size={14} className="" />
                        Edit Profile
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default ProfileHeader;

