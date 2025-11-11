/**
 * RecommendModal - Modal for recommending applications to partners
 * Allows multi-selecting partners to recommend to
 */
"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/src/components/base/Modal';
import Button from '@/src/components/core/Button';
import MultiSelect, { OptionI } from '@/src/components/base/MultiSelect';
import { userRepository } from '@/src/repositories/userRepository';

export interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (partnerIds: string[]) => Promise<void>;
  applicationGroupName?: string;
  loading?: boolean;
}

const RecommendModal = ({
  open,
  onClose,
  onConfirm,
  applicationGroupName,
  loading = false,
}: Props) => {
  const [partners, setPartners] = useState<OptionI[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<OptionI[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Load partners when modal opens
  useEffect(() => {
    if (open) {
      loadPartners();
    } else {
      // Reset selection when modal closes
      setSelectedPartners([]);
    }
  }, [open]);

  const loadPartners = async () => {
    try {
      setLoadingPartners(true);
      const users = await userRepository.getAll();
      const partnerUsers = users.filter((u) => u.role === 'partner');
      const partnerOptions: OptionI[] = partnerUsers.map((partner) => ({
        label: partner.name,
        value: partner.id,
      }));
      setPartners(partnerOptions);
    } catch (error) {
      console.error('Failed to load partners:', error);
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedPartners.length === 0) {
      return; // Don't submit if no partners selected
    }
    const partnerIds = selectedPartners.map((p) => String(p.value));
    await onConfirm(partnerIds);
  };

  return (
    <Modal
      open={open}
      handleClose={onClose}
      title="Recommend Application"
      actions={[
        <Button
          key="cancel"
          onClick={onClose}
          className="bg-pale"
          disabled={loading}
        >
          Cancel
        </Button>,
        <Button
          key="confirm"
          onClick={handleConfirm}
          className="bg-primary"
          disabled={loading || selectedPartners.length === 0}
        >
          {loading ? 'Recommending...' : 'Recommend'}
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {applicationGroupName && (
          <p className="text-[0.875rem] opacity-60">
            You are recommending <strong>{applicationGroupName}</strong> to selected partners.
          </p>
        )}
        <MultiSelect
          title="Select Partners to Recommend To"
          options={partners}
          value={selectedPartners}
          onChange={setSelectedPartners}
          placeHolder="Search and select partners..."
        />
        {loadingPartners && (
          <p className="text-[0.875rem] opacity-60">Loading partners...</p>
        )}
      </div>
    </Modal>
  );
};

export default RecommendModal;




