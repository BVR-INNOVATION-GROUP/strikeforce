/**
 * Hook for managing toast notifications using Sonner
 * Replaces custom Toast component and alert() calls
 */
import { useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook for managing toast notifications
 * Provides consistent API for showing toast messages.
 * Callbacks are stable across renders so effects that depend on them do not re-run every tick.
 */
export const useToast = () => {
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
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
    },
    []
  );

  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  const showInfo = useCallback((message: string) => {
    toast.info(message);
  }, []);

  const closeToast = useCallback(() => {
    // Sonner handles dismissal automatically
  }, []);

  return {
    showToast,
    closeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
