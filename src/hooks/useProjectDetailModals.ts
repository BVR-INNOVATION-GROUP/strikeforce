/**
 * Custom hook for project detail modal state management
 */
import { useState } from "react";

export interface ProjectDetailModals {
  isMilestoneModalOpen: boolean;
  isEditMilestoneModalOpen: boolean;
  selectedMilestoneId: string | null;
  isEditModalOpen: boolean;
  showReassignConfirm: boolean;
  showDeleteConfirm: boolean;
  showReassignProjectModal: boolean;
  isChatModalOpen: boolean;
  selectedApplicationId: string | null;
  isApplicationDetailModalOpen: boolean;
  selectedApplicationDetailId: number | null;
  openMilestoneModal: () => void;
  closeMilestoneModal: () => void;
  openEditMilestoneModal: (milestoneId: string) => void;
  closeEditMilestoneModal: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  openReassignConfirm: (applicationId: string) => void;
  closeReassignConfirm: () => void;
  openDeleteConfirm: () => void;
  closeDeleteConfirm: () => void;
  openReassignProjectModal: () => void;
  closeReassignProjectModal: () => void;
  selectedChatApplicationId: number | null;
  openChatModal: (applicationId?: number) => void;
  closeChatModal: () => void;
  openApplicationDetailModal: (applicationId: number) => void;
  closeApplicationDetailModal: () => void;
  isRecommendModalOpen: boolean;
  selectedRecommendApplicationId: number | null;
  openRecommendModal: (applicationId: number) => void;
  closeRecommendModal: () => void;
  isAcceptConfirmOpen: boolean;
  selectedAcceptApplicationId: number | null;
  openAcceptConfirm: (applicationId: number) => void;
  closeAcceptConfirm: () => void;
  isRejectConfirmOpen: boolean;
  selectedRejectApplicationId: number | null;
  openRejectConfirm: (applicationId: number) => void;
  closeRejectConfirm: () => void;
  isDeleteMilestoneConfirmOpen: boolean;
  selectedDeleteMilestoneId: string | null;
  openDeleteMilestoneConfirm: (milestoneId: string) => void;
  closeDeleteMilestoneConfirm: () => void;
}

/**
 * Hook for managing project detail modal states
 */
export function useProjectDetailModals(): ProjectDetailModals {
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isEditMilestoneModalOpen, setIsEditMilestoneModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showReassignConfirm, setShowReassignConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReassignProjectModal, setShowReassignProjectModal] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedChatApplicationId, setSelectedChatApplicationId] = useState<
    number | null
  >(null);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [selectedRecommendApplicationId, setSelectedRecommendApplicationId] = useState<
    number | null
  >(null);
  const [isAcceptConfirmOpen, setIsAcceptConfirmOpen] = useState(false);
  const [selectedAcceptApplicationId, setSelectedAcceptApplicationId] = useState<
    number | null
  >(null);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [selectedRejectApplicationId, setSelectedRejectApplicationId] = useState<
    number | null
  >(null);
  const [isApplicationDetailModalOpen, setIsApplicationDetailModalOpen] = useState(false);
  const [selectedApplicationDetailId, setSelectedApplicationDetailId] = useState<number | null>(null);
  const [isDeleteMilestoneConfirmOpen, setIsDeleteMilestoneConfirmOpen] = useState(false);
  const [selectedDeleteMilestoneId, setSelectedDeleteMilestoneId] = useState<string | null>(null);

  return {
    isMilestoneModalOpen,
    isEditMilestoneModalOpen,
    selectedMilestoneId,
    isEditModalOpen,
    showReassignConfirm,
    showDeleteConfirm,
    showReassignProjectModal,
    isChatModalOpen,
    selectedApplicationId,
    selectedChatApplicationId,
    isApplicationDetailModalOpen,
    selectedApplicationDetailId,
    openMilestoneModal: () => setIsMilestoneModalOpen(true),
    closeMilestoneModal: () => setIsMilestoneModalOpen(false),
    openEditMilestoneModal: (milestoneId: string) => {
      setSelectedMilestoneId(milestoneId);
      setIsEditMilestoneModalOpen(true);
    },
    closeEditMilestoneModal: () => {
      setIsEditMilestoneModalOpen(false);
      setSelectedMilestoneId(null);
    },
    openEditModal: () => setIsEditModalOpen(true),
    closeEditModal: () => setIsEditModalOpen(false),
    openApplicationDetailModal: (applicationId: number) => {
      setSelectedApplicationDetailId(applicationId);
      setIsApplicationDetailModalOpen(true);
    },
    closeApplicationDetailModal: () => {
      setIsApplicationDetailModalOpen(false);
      setSelectedApplicationDetailId(null);
    },
    openReassignConfirm: (applicationId: string) => {
      setSelectedApplicationId(applicationId);
      setShowReassignConfirm(true);
    },
    closeReassignConfirm: () => {
      setShowReassignConfirm(false);
      setSelectedApplicationId(null);
    },
    openDeleteConfirm: () => setShowDeleteConfirm(true),
    closeDeleteConfirm: () => setShowDeleteConfirm(false),
    openReassignProjectModal: () => setShowReassignProjectModal(true),
    closeReassignProjectModal: () => setShowReassignProjectModal(false),
    openChatModal: (applicationId?: number) => {
      setSelectedChatApplicationId(applicationId || null);
      setIsChatModalOpen(true);
    },
    closeChatModal: () => {
      setIsChatModalOpen(false);
      setSelectedChatApplicationId(null);
    },
    isRecommendModalOpen,
    selectedRecommendApplicationId,
    openRecommendModal: (applicationId: number) => {
      setSelectedRecommendApplicationId(applicationId);
      setIsRecommendModalOpen(true);
    },
    closeRecommendModal: () => {
      setIsRecommendModalOpen(false);
      setSelectedRecommendApplicationId(null);
    },
    isAcceptConfirmOpen,
    selectedAcceptApplicationId,
    openAcceptConfirm: (applicationId: number) => {
      setSelectedAcceptApplicationId(applicationId);
      setIsAcceptConfirmOpen(true);
    },
    closeAcceptConfirm: () => {
      setIsAcceptConfirmOpen(false);
      setSelectedAcceptApplicationId(null);
    },
    isRejectConfirmOpen,
    selectedRejectApplicationId,
    openRejectConfirm: (applicationId: number) => {
      setSelectedRejectApplicationId(applicationId);
      setIsRejectConfirmOpen(true);
    },
    closeRejectConfirm: () => {
      setIsRejectConfirmOpen(false);
      setSelectedRejectApplicationId(null);
    },
    isDeleteMilestoneConfirmOpen,
    selectedDeleteMilestoneId,
    openDeleteMilestoneConfirm: (milestoneId: string) => {
      setSelectedDeleteMilestoneId(milestoneId);
      setIsDeleteMilestoneConfirmOpen(true);
    },
    closeDeleteMilestoneConfirm: () => {
      setIsDeleteMilestoneConfirmOpen(false);
      setSelectedDeleteMilestoneId(null);
    },
  };
}


