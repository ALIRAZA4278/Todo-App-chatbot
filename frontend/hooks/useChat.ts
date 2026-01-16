"use client";

/**
 * Custom hook for chat state management.
 * Per specs/001-ai-chatbot/plan.md - Phase 7: Frontend Chatbot UI
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { chatApi, ChatMessage, ChatApiException } from "@/lib/chat-api";
import { getApiToken } from "@/lib/auth";
import { useSession } from "@/lib/auth";

// ============================================================================
// Types
// ============================================================================

export interface UseChatReturn {
  /** Array of chat messages */
  messages: ChatMessage[];
  /** Current conversation ID */
  conversationId: number | null;
  /** Whether chat panel is open */
  isOpen: boolean;
  /** Whether a message is being sent */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Send a new message */
  sendMessage: (text: string) => Promise<void>;
  /** Open the chat panel */
  openChat: () => void;
  /** Close the chat panel */
  closeChat: () => void;
  /** Clear the current error */
  clearError: () => void;
  /** Reset the conversation (start new) */
  resetConversation: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const CONVERSATION_ID_KEY = "chat_conversation_id";

// ============================================================================
// Hook Implementation
// ============================================================================

export function useChat(): UseChatReturn {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if we've loaded history
  const historyLoadedRef = useRef(false);

  // ============================================================================
  // Load conversation from localStorage
  // ============================================================================

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const storedId = localStorage.getItem(CONVERSATION_ID_KEY);
    if (storedId) {
      const parsedId = parseInt(storedId, 10);
      if (!isNaN(parsedId)) {
        setConversationId(parsedId);
      }
    }
  }, []);

  // ============================================================================
  // Load message history when chat opens
  // ============================================================================

  useEffect(() => {
    if (!isOpen || !conversationId || !userId || historyLoadedRef.current) {
      return;
    }

    const loadHistory = async () => {
      try {
        const token = await getApiToken();
        if (!token) return;

        const response = await chatApi.getMessages(userId, conversationId, token);
        setMessages(response.messages);
        historyLoadedRef.current = true;
      } catch (err) {
        // If conversation not found, clear stored ID
        if (err instanceof ChatApiException && err.status === 404) {
          localStorage.removeItem(CONVERSATION_ID_KEY);
          setConversationId(null);
          setMessages([]);
        }
        console.error("Failed to load chat history:", err);
      }
    };

    loadHistory();
  }, [isOpen, conversationId, userId]);

  // ============================================================================
  // Actions
  // ============================================================================

  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId || !text.trim()) return;

      const trimmedText = text.trim();
      setError(null);
      setIsLoading(true);

      // Optimistically add user message
      const tempUserMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        role: "user",
        content: trimmedText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      try {
        const token = await getApiToken();
        if (!token) {
          throw new Error("Not authenticated");
        }

        const response = await chatApi.sendMessage(
          userId,
          trimmedText,
          token,
          conversationId
        );

        // Update conversation ID if new
        if (!conversationId) {
          setConversationId(response.conversation_id);
          localStorage.setItem(
            CONVERSATION_ID_KEY,
            response.conversation_id.toString()
          );
        }

        // Replace temp user message with actual and add assistant response
        setMessages((prev) => {
          // Remove temp message
          const withoutTemp = prev.filter((m) => m.id !== tempUserMessage.id);

          // Add real user message (we don't get it from response, keep our version)
          // Add assistant response
          return [
            ...withoutTemp,
            { ...tempUserMessage, id: response.message.id - 1 }, // Approximate real ID
            response.message,
          ];
        });
      } catch (err) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));

        if (err instanceof ChatApiException) {
          if (err.status === 401) {
            setError("Session expired. Please sign in again.");
          } else if (err.status === 429) {
            setError("Too many messages. Please wait a moment.");
          } else {
            setError(err.detail || "Failed to send message.");
          }
        } else {
          setError("Failed to send message. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userId, conversationId]
  );

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetConversation = useCallback(() => {
    localStorage.removeItem(CONVERSATION_ID_KEY);
    setConversationId(null);
    setMessages([]);
    historyLoadedRef.current = false;
    setError(null);
  }, []);

  return {
    messages,
    conversationId,
    isOpen,
    isLoading,
    error,
    sendMessage,
    openChat,
    closeChat,
    clearError,
    resetConversation,
  };
}
