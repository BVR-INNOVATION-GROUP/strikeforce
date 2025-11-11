/**
 * Profile Header Component - displays avatar and edit button
 */
"use client";

import React from "react";
import Avatar from "@/src/components/core/Avatar";
import Button from "@/src/components/core/Button";
import Card from "@/src/components/core/Card";
import { Edit, Upload } from "lucide-react";
import { UserI } from "@/src/models/user";

export interface Props {
    user: UserI;
    isEditing: boolean;
    onEditClick: () => void;
    onUploadClick: () => void;
}

/**
 * Profile header with avatar and edit button
 */
const ProfileHeader = ({
    user,
    isEditing,
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
                        <Button type="button" className="bg-pale text-primary" onClick={onUploadClick}>
                            <Upload size={16} className="mr-2" />
                            Change Photo
                        </Button>
                        <p className="text-xs opacity-60 mt-2">
                            JPG, PNG or GIF. Max size 2MB
                        </p>
                    </div>
                ) : (
                    <Button
                        className="bg-primary  rounded-full"
                        onClick={onEditClick}
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

