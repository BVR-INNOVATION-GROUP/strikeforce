/**
 * WebSocket hook for real-time chat with automatic reconnection and recovery
 * Uses exponential backoff for reconnection attempts
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { getAuthToken } from "@/src/utils/config";

export interface WebSocketMessage {
  id?: number;
  sender_id: number;
  group_id: number;
  body: string;
  created_at?: string;
  sender?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface UseWebSocketOptions {
  groupId: number | string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseWebSocketReturn {
  sendMessage: (body: string, type?: string) => void;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  reconnect: () => void;
  disconnect: () => void;
}

const DEFAULT_RECONNECT_INTERVAL = 1000; // Start with 1 second
const MAX_RECONNECT_INTERVAL = 30000; // Max 30 seconds
const MAX_RECONNECT_ATTEMPTS = 10;

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    groupId,
    onMessage,
    onError,
    onOpen,
    onClose,
    autoReconnect = true,
    reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
    maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(autoReconnect);
  const currentIntervalRef = useRef(reconnectInterval);

  const getWebSocketUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsUrl = baseUrl.replace(/^http/, "ws");
    const token = getAuthToken();
    return `${wsUrl}/api/v1/chats/ws?group=${groupId}${token ? `&token=${token}` : ""}`;
  }, [groupId]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setConnectionStatus("connecting");
    const url = getWebSocketUrl();

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;
        currentIntervalRef.current = reconnectInterval; // Reset interval
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
        onError?.(error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed", event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus("disconnected");
        onClose?.();

        // Attempt reconnection if enabled and not a normal closure
        if (
          shouldReconnectRef.current &&
          event.code !== 1000 && // Normal closure
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          
          // Exponential backoff
          const delay = Math.min(
            currentIntervalRef.current * Math.pow(2, reconnectAttemptsRef.current - 1),
            MAX_RECONNECT_INTERVAL
          );

          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error("Max reconnection attempts reached");
          setConnectionStatus("error");
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setConnectionStatus("error");
      
      // Retry connection
      if (
        shouldReconnectRef.current &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptsRef.current++;
        const delay = Math.min(
          currentIntervalRef.current * Math.pow(2, reconnectAttemptsRef.current - 1),
          MAX_RECONNECT_INTERVAL
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }, [getWebSocketUrl, onMessage, onError, onOpen, onClose, reconnectInterval, maxReconnectAttempts]);

  const sendMessage = useCallback(
    (body: string, type: string = "TEXT") => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({
              body,
              type,
            })
          );
        } catch (error) {
          console.error("Error sending WebSocket message:", error);
        }
      } else {
        console.warn("WebSocket is not connected. Message not sent:", body);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, []);

  const reconnect = useCallback(() => {
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    currentIntervalRef.current = reconnectInterval;
    disconnect();
    setTimeout(() => {
      connect();
    }, 100);
  }, [connect, disconnect, reconnectInterval]);

  useEffect(() => {
    shouldReconnectRef.current = autoReconnect;
    connect();

    return () => {
      disconnect();
    };
  }, [groupId, autoReconnect]); // Reconnect if groupId changes

  return {
    sendMessage,
    isConnected,
    connectionStatus,
    reconnect,
    disconnect,
  };
}







