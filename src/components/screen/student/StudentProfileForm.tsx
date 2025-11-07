/**
 * Student Profile Form Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import Button from "@/src/components/core/Button";
import Avatar from "@/src/components/core/Avatar";
import { Upload } from "lucide-react";
import { UserI } from "@/src/models/user";

export interface StudentProfileFormData {
  name: string;
  email: string;
  bio: string;
  phone: string;
  location: string;
  skills: string;
}

export interface Props {
  user: UserI;
  formData: StudentProfileFormData;
  onChange: (field: string, value: string) => void;
}

/**
 * Student profile form fields
 */
const StudentProfileForm = ({ user, formData, onChange }: Props) => {
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
            <p className="text-sm text-secondary mt-2">
              JPG, PNG or GIF. Max size 2MB
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <TextArea
          title="Bio"
          value={formData.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          rows={4}
          className="mt-4"
        />
      </Card>

      {/* Skills */}
      <Card title="Skills">
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
      </Card>
    </>
  );
};

export default StudentProfileForm;






