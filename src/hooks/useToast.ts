/**
 * Hook for managing toast notifications using Sonner
 * Replaces custom Toast component and alert() calls
 */
import { toast } from "sonner";

/**
 * Hook for managing toast notifications
 * Provides consistent API for showing toast messages
 */
export const useToast = () => {
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "info":
      default:
        toast.info(message);
        break;
    }
  };

  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showWarning = (message: string) => {
    toast.warning(message);
  };

  const showInfo = (message: string) => {
    toast.info(message);
  };

  // Legacy API compatibility - closeToast is no-op with Sonner
  const closeToast = () => {
    // Sonner handles dismissal automatically
  };

  return {
    showToast,
    closeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
