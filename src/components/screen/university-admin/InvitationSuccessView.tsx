/**
 * Invitation Success View Component
 */
"use client";

import React, { useState } from "react";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { InvitationI } from "@/src/models/invitation";
import { Copy, CheckCircle } from "lucide-react";

export interface Props {
  invitation: InvitationI;
  invitationLink: string;
}

/**
 * Display success view after invitation generation
 */
const InvitationSuccessView = ({ invitation, invitationLink }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm font-medium text-success-dark mb-2">
          ✓ Invitation generated successfully!
        </p>
        <p className="text-xs text-success">
          Send this link to {invitation.email}. It expires on{" "}
          {new Date(invitation.expiresAt).toLocaleDateString()}.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Invitation Link</p>
        <div className="flex gap-2">
          <Input value={invitationLink} readOnly className="flex-1 bg-pale" />
          <Button
            onClick={handleCopyLink}
            className="bg-pale text-primary"
            disabled={copied}
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </Button>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-info-dark">
          <strong>Note:</strong> This link can only be used once. Make sure to
          send it securely to the recipient.
        </p>
      </div>
    </div>
  );
};

export default InvitationSuccessView;








