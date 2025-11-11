/**
 * Profile Form Component - edit/view mode for personal information
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import Button from "@/src/components/core/Button";
import { Save } from "lucide-react";
import { UserI } from "@/src/models/user";

export interface ProfileFormData {
  name: string;
  bio: string;
  phone: string;
  location: string;
  skills: string;
}

export interface Props {
  user: UserI;
  formData: ProfileFormData;
  isEditing: boolean;
  saving: boolean;
  onChange: (field: keyof ProfileFormData, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Profile form with edit/view mode
 */
const ProfileForm = ({
  user,
  formData,
  isEditing,
  saving,
  onChange,
  onSave,
  onCancel,
}: Props) => {
  return (
    <Card title="Personal Information">
      {isEditing ? (
        <div className="space-y-4">
          <Input
            title="Full Name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
          <Input
            title="Email"
            type="email"
            value={user.email}
            disabled
            className="opacity-60"
          />
          <Input
            title="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
          <Input
            title="Location"
            value={formData.location}
            onChange={(e) => onChange("location", e.target.value)}
          />
          <TextArea
            title="Bio"
            value={formData.bio}
            onChange={(e) => onChange("bio", e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
          />

          {/* Skills for Students */}
          {user.role === "student" && (
            <div>
              <Input
                title="Skills (comma-separated)"
                value={formData.skills}
                onChange={(e) => onChange("skills", e.target.value)}
                placeholder="e.g., javascript, react, nodejs, typescript"
              />
              {user.profile.skills && user.profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-pale-primary text-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              className="bg-pale text-primary rounded-full"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className="bg-primary rounded-full"
              disabled={saving}
            >
              <Save size={16} className="mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm opacity-60 mb-1">Full Name</p>
            <p className="font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-sm opacity-60 mb-1">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          {user.profile.phone && (
            <div>
              <p className="text-sm opacity-60 mb-1">Phone</p>
              <p className="font-semibold">{user.profile.phone}</p>
            </div>
          )}
          {user.profile.location && (
            <div>
              <p className="text-sm opacity-60 mb-1">Location</p>
              <p className="font-semibold">{user.profile.location}</p>
            </div>
          )}
          {user.profile.bio && (
            <div>
              <p className="text-sm opacity-60 mb-1">Bio</p>
              <p className="whitespace-pre-wrap">{user.profile.bio}</p>
            </div>
          )}
          {/* Skills for Students (read-only) */}
          {user.role === "student" &&
            user.profile.skills &&
            user.profile.skills.length > 0 && (
              <div>
                <p className="text-sm opacity-60 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {user.profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-pale-primary text-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </Card>
  );
};

export default ProfileForm;

