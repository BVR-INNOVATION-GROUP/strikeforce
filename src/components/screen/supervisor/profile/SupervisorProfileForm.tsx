/**
 * Supervisor Profile Form Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import Button from "@/src/components/core/Button";
import Avatar from "@/src/components/core/Avatar";
import { UserI } from "@/src/models/user";
import { Upload } from "lucide-react";

export interface Props {
  user: UserI;
  formData: {
    name: string;
    email: string;
    bio: string;
    phone: string;
    location: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

/**
 * Form fields for supervisor profile
 */
const SupervisorProfileForm = ({ user, formData, onFieldChange }: Props) => {
  return (
    <>
      <Card title="Profile Picture">
        <div className="flex items-center gap-6">
          <Avatar src={user.profile.avatar} name={user.name} size="lg" />
          <div>
            <Button type="button" className="bg-pale text-primary">
              <Upload size={16} className="mr-2" />
              Upload Photo
            </Button>
            <p className="text-sm text-secondary mt-2">JPG, PNG or GIF. Max size 2MB</p>
          </div>
        </div>
      </Card>

      <Card title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            title="Full Name"
            value={formData.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
          />
          <Input
            title="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
          />
          <Input
            title="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
          />
          <Input
            title="Location"
            value={formData.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
          />
        </div>
        <TextArea
          title="Bio"
          value={formData.bio}
          onChange={(e) => onFieldChange("bio", e.target.value)}
          rows={4}
          className="mt-4"
        />
      </Card>
    </>
  );
};

export default SupervisorProfileForm;






