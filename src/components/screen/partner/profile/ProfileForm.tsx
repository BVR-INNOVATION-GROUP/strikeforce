/**
 * Profile Form Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import Button from "@/src/components/core/Button";
import Avatar from "@/src/components/core/Avatar";
import { Save, Upload } from "lucide-react";
import { UserI } from "@/src/models/user";

export interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  phone: string;
  location: string;
}

export interface Props {
  user: UserI;
  formData: ProfileFormData;
  saving: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Profile form section
 */
const ProfileForm = ({ user, formData, saving, onChange, onSubmit }: Props) => {
  return (
    <>
      {/* Profile Picture */}
      <Card title="Profile Picture">
        <div className="flex items-center gap-6">
          <Avatar src={user.profile.avatar} name={user.name} size="lg" />
          <div>
            <Button type="button" className="bg-pale text-primary">
              <Upload size={16} className="mr-2" />
              Upload Photo
            </Button>
            <p className="text-xs text-muted mt-2">
              JPG, PNG or GIF. Max size 2MB
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card title="Personal Information">
        <div className="space-y-4">
          <Input
            title="Full Name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
          <Input
            title="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
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
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button type="submit" onClick={onSubmit} className="bg-primary" disabled={saving}>
          <Save size={16} className="mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </>
  );
};

export default ProfileForm;









