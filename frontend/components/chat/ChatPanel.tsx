"use client";

/**
 * Chat panel container component.
 * Fixed position overlay panel with header, messages, and input.
 */
import { useEffect, useCallback } from "react";
import { ChatMessage } from "@/lib/chat-api";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface ChatPanelProps {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSend: (message: string) => void;
  onReset: () => void;
  onClearError: () => void;
}

export function ChatPanel({
  isOpen,
  messages,
  isLoading,
  error,
  onClose,
  onSend,
  onReset,
  onClearError,
}: ChatPanelProps) {
  // Handle Escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when panel is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Chat panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chat with TodoBot"
        className="fixed bottom-4 right-4 w-[calc(100%-32px)] max-w-[400px] h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 md:bottom-24 md:right-6"
      >
        {/* Header */}
        <ChatHeader onClose={onClose} onReset={onReset} />

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={onClearError}
              className="text-red-400 hover:text-red-600"
              aria-label="Dismiss error"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Message list */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Input */}
        <ChatInput
          onSend={onSend}
          disabled={isLoading}
          placeholder="Ask me to manage your tasks..."
        />
      </div>
    </>
  );
}
