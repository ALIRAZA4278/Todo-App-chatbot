"use client";

/**
 * Main chat widget wrapper component.
 * Combines ChatIcon and ChatPanel into a complete chat experience.
 */
import { useChat } from "@/hooks/useChat";
import { ChatIcon } from "./ChatIcon";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  const {
    messages,
    isOpen,
    isLoading,
    error,
    sendMessage,
    openChat,
    closeChat,
    clearError,
    resetConversation,
  } = useChat();

  return (
    <>
      {/* Floating chat icon */}
      <ChatIcon onClick={openChat} isOpen={isOpen} />

      {/* Chat panel */}
      <ChatPanel
        isOpen={isOpen}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onClose={closeChat}
        onSend={sendMessage}
        onReset={resetConversation}
        onClearError={clearError}
      />
    </>
  );
}
