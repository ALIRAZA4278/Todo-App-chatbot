/**
 * Chat API client for AI Chatbot.
 * Per specs/001-ai-chatbot/contracts/chat-api.yaml
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================================
// Types
// ============================================================================

/**
 * Chat message type.
 */
export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/**
 * Conversation type.
 */
export interface Conversation {
  id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Chat request type.
 */
export interface ChatRequest {
  message: string;
  conversation_id?: number | null;
}

/**
 * Chat response type.
 */
export interface ChatResponse {
  conversation_id: number;
  message: ChatMessage;
}

/**
 * Conversation list response type.
 */
export interface ConversationListResponse {
  conversations: Conversation[];
}

/**
 * Message list response type.
 */
export interface MessageListResponse {
  messages: ChatMessage[];
}

/**
 * API error type.
 */
export interface ChatApiError {
  detail: string;
}

/**
 * Custom error class for Chat API errors.
 */
export class ChatApiException extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "ChatApiException";
  }
}

// ============================================================================
// API Request Helper
// ============================================================================

/**
 * Make an authenticated API request to chat endpoints.
 */
async function chatApiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Parse response
  const data = await response.json();

  // Handle errors
  if (!response.ok) {
    throw new ChatApiException(
      response.status,
      data.detail || "An unexpected error occurred"
    );
  }

  return data as T;
}

// ============================================================================
// Chat API Methods
// ============================================================================

export const chatApi = {
  /**
   * Send a chat message to the AI assistant.
   * POST /api/{userId}/chat
   */
  sendMessage: async (
    userId: string,
    message: string,
    token: string,
    conversationId?: number | null
  ): Promise<ChatResponse> => {
    const body: ChatRequest = {
      message,
      conversation_id: conversationId ?? undefined,
    };

    return chatApiRequest<ChatResponse>(`/api/${userId}/chat`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * List all conversations for the user.
   * GET /api/{userId}/conversations
   */
  listConversations: async (
    userId: string,
    token: string
  ): Promise<ConversationListResponse> => {
    return chatApiRequest<ConversationListResponse>(
      `/api/${userId}/conversations`,
      token
    );
  },

  /**
   * Get messages for a specific conversation.
   * GET /api/{userId}/conversations/{conversationId}/messages
   */
  getMessages: async (
    userId: string,
    conversationId: number,
    token: string
  ): Promise<MessageListResponse> => {
    return chatApiRequest<MessageListResponse>(
      `/api/${userId}/conversations/${conversationId}/messages`,
      token
    );
  },
};
