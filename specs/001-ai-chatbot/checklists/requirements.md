# Requirements Checklist: Todo AI Chatbot

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Pending Implementation

## Implementation Checklist

### Backend - Database Schema

- [ ] Create `conversations` table with fields: id, user_id, created_at, updated_at
- [ ] Create `messages` table with fields: id, user_id, conversation_id, role, content, created_at
- [ ] Add foreign key constraints (user_id → user.id, conversation_id → conversations.id)
- [ ] Add indexes on user_id and conversation_id columns
- [ ] Verify CASCADE delete behavior

### Backend - MCP Tools

- [ ] Implement `add_task` tool with user_id isolation
- [ ] Implement `list_tasks` tool with status filter
- [ ] Implement `toggle_task_completion` tool
- [ ] Implement `delete_task` tool
- [ ] Implement `search_tasks` tool with keyword search
- [ ] Implement `get_my_user_info` tool
- [ ] All tools return consistent `{status, message, data}` format
- [ ] All tools validate user_id is provided
- [ ] All tools filter queries by user_id

### Backend - Chat API

- [ ] Create `POST /api/{user_id}/chat` endpoint
- [ ] Validate JWT token on all requests
- [ ] Validate URL user_id matches JWT user_id
- [ ] Create conversation if none exists
- [ ] Save user message to database
- [ ] Initialize OpenAI Agents SDK with Gemini API
- [ ] Pass user_id to agent context
- [ ] Execute agent with MCP tools
- [ ] Save assistant response to database
- [ ] Return response with conversation_id
- [ ] Handle rate limiting (30 req/min)
- [ ] Handle AI service errors gracefully

### Backend - Agent Configuration

- [ ] Create TodoOrchestratorAgent with system prompt
- [ ] Configure Gemini API via OpenAI-compatible base_url
- [ ] Register all 6 MCP tools with agent
- [ ] System prompt includes user isolation rules
- [ ] System prompt includes confirmation rules for delete
- [ ] System prompt includes tone guidelines

### Frontend - Chat Components

- [ ] Create `ChatWidget.tsx` (main wrapper)
- [ ] Create `ChatIcon.tsx` (floating button)
- [ ] Create `ChatPanel.tsx` (panel container)
- [ ] Create `ChatHeader.tsx` (with close button)
- [ ] Create `MessageList.tsx` (scrollable area)
- [ ] Create `MessageBubble.tsx` (individual message)
- [ ] Create `ChatInput.tsx` (input + send button)
- [ ] Create `TypingIndicator.tsx` (loading dots)

### Frontend - Chat Styling

- [ ] Chat icon: 56px circle, fixed bottom-right, z-index 1000
- [ ] Chat panel: 400px width (desktop), 100% - 32px (mobile)
- [ ] User messages: right-aligned, blue background
- [ ] Assistant messages: left-aligned, gray background
- [ ] Typing indicator: 3 animated dots
- [ ] Open/close animations (200ms ease-out)
- [ ] Mobile responsive layout

### Frontend - Chat State

- [ ] Create `useChat` hook for state management
- [ ] Track messages array
- [ ] Track conversationId
- [ ] Track isOpen, isLoading, error states
- [ ] Implement sendMessage function
- [ ] Implement openChat/closeChat functions
- [ ] Auto-scroll to new messages

### Frontend - API Integration

- [ ] Create `chat-api.ts` client
- [ ] Implement sendMessage with auth token
- [ ] Implement getConversations
- [ ] Implement getMessages for conversation
- [ ] Handle 401 by redirecting to sign-in
- [ ] Handle network errors with retry option

### Frontend - Integration

- [ ] Add ChatWidget to authenticated layout
- [ ] Chat available on all /tasks pages
- [ ] Chat NOT available on /signin, /signup
- [ ] Chat state independent from Todo state
- [ ] Todo list refreshes when tasks modified via chat
- [ ] Escape key closes chat panel

### Security

- [ ] JWT validation on all chat endpoints
- [ ] URL user_id vs JWT user_id match
- [ ] 404 returned for cross-user access (not 403)
- [ ] Input sanitization (message max 2000 chars)
- [ ] System prompt hardened against injection
- [ ] API keys server-side only
- [ ] No sensitive data in error messages
- [ ] No sensitive data in logs

### Error Handling

- [ ] Validation errors return 422 with detail
- [ ] Not found returns 404 with detail
- [ ] Auth errors return 401
- [ ] Rate limit returns 429
- [ ] Server errors return 500 with generic message
- [ ] MCP tools return `{status: "error", message, data: null}`
- [ ] AI translates tool errors to user-friendly messages

### Accessibility

- [ ] Chat icon has aria-label
- [ ] Chat panel has role="dialog" and aria-modal
- [ ] Message list has role="log" and aria-live="polite"
- [ ] Input has aria-label
- [ ] Escape key closes panel
- [ ] Tab navigation works
- [ ] Color contrast 4.5:1 minimum
- [ ] Respects prefers-reduced-motion

---

## Testing Checklist

### Unit Tests

- [ ] MCP tool: add_task creates task
- [ ] MCP tool: add_task requires user_id
- [ ] MCP tool: list_tasks returns only user's tasks
- [ ] MCP tool: toggle_task_completion works
- [ ] MCP tool: delete_task removes task
- [ ] MCP tool: search_tasks filters correctly
- [ ] MCP tool: get_my_user_info returns user data

### Integration Tests

- [ ] Chat endpoint creates conversation
- [ ] Chat endpoint saves messages
- [ ] Chat endpoint validates JWT
- [ ] Chat endpoint rejects wrong user_id
- [ ] Full flow: user message → AI response → saved

### E2E Tests

- [ ] Open chat by clicking icon
- [ ] Send message and receive response
- [ ] Add task via chat appears in Todo list
- [ ] Complete task via chat updates Todo list
- [ ] Conversation persists after refresh
- [ ] Error messages display correctly

---

## Acceptance Criteria Status

| ID | Requirement | Status |
|----|-------------|--------|
| FR-001 | Floating chat icon on authenticated pages | [ ] |
| FR-002 | Chat panel opens on click | [ ] |
| FR-003 | Messages up to 2000 chars | [ ] |
| FR-004 | User messages right-aligned blue | [ ] |
| FR-005 | AI messages left-aligned gray | [ ] |
| FR-006 | Typing indicator while waiting | [ ] |
| FR-007 | Auto-scroll to newest | [ ] |
| FR-010 | OpenAI SDK with Gemini API | [ ] |
| FR-011 | Natural language interpretation | [ ] |
| FR-012 | MCP tools for all operations | [ ] |
| FR-013 | Confirm before delete | [ ] |
| FR-014 | Clarifying questions for ambiguity | [ ] |
| FR-015 | Respond in user's language | [ ] |
| FR-020 | add_task tool | [ ] |
| FR-021 | list_tasks tool | [ ] |
| FR-022 | toggle_task_completion tool | [ ] |
| FR-023 | delete_task tool | [ ] |
| FR-024 | search_tasks tool | [ ] |
| FR-025 | get_my_user_info tool | [ ] |
| FR-030 | Create conversation on first message | [ ] |
| FR-031 | Persist all messages | [ ] |
| FR-032 | Load history on chat open | [ ] |
| FR-033 | Update conversation.updated_at | [ ] |
| FR-040 | JWT required | [ ] |
| FR-041 | URL user_id matches JWT | [ ] |
| FR-042 | Filter by authenticated user_id | [ ] |
| FR-043 | 404 for cross-user access | [ ] |
| FR-044 | No system prompt exposure | [ ] |
