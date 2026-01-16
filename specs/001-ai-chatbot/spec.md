# Feature Specification: Todo AI Chatbot

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft
**Phase**: III - AI Chatbot Integration

## Overview

This specification defines the Todo AI Chatbot - a natural language interface for managing tasks. Users interact with an AI assistant via a floating chat panel that understands commands in plain English (and Roman Urdu) and executes them through MCP tools.

### Related Specifications

| Specification | Path | Description |
|---------------|------|-------------|
| Overview | [overview.md](./overview.md) | System goals and scope |
| Architecture | [architecture.md](./architecture.md) | End-to-end architecture |
| Primary Agent | [agents/primary-agent.md](./agents/primary-agent.md) | Agent definition |
| Agent Behavior | [agents/agent-behavior.md](./agents/agent-behavior.md) | NLP behavior rules |
| MCP Server | [mcp/server.md](./mcp/server.md) | Server specification |
| MCP Tools | [mcp/tools.md](./mcp/tools.md) | Tool definitions |
| Chat Endpoint | [api/chat-endpoint.md](./api/chat-endpoint.md) | API specification |
| Database Schema | [database/chat-schema.md](./database/chat-schema.md) | Conversation storage |
| Chat UI | [frontend/chat-ui.md](./frontend/chat-ui.md) | UI components |
| Frontend Integration | [frontend/integration.md](./frontend/integration.md) | Integration rules |
| Security | [security.md](./security.md) | Security requirements |
| Error Handling | [errors.md](./errors.md) | Error specification |

---

## User Scenarios & Testing

### User Story 1 - Add a Task via Chat (Priority: P1)

User wants to quickly add a task without navigating the UI. They type a natural language command like "add buy groceries" or "remind me to call mom tomorrow" and the AI creates the task.

**Why this priority**: Task creation is the most fundamental operation. Without it, the chatbot has no value. This is the core MVP functionality.

**Independent Test**: Can be fully tested by opening the chat, typing "add buy milk", and verifying the task appears in both the chat response and the Todo list.

**Acceptance Scenarios**:

1. **Given** user is authenticated and chat is open, **When** user types "add buy groceries", **Then** task "buy groceries" is created and AI confirms "I've added 'buy groceries' to your list."
2. **Given** user is authenticated, **When** user types "add milk, eggs, and bread", **Then** AI asks for clarification on whether to create one or three tasks.
3. **Given** user is authenticated, **When** user types "add" with no title, **Then** AI asks "What would you like to add?"

---

### User Story 2 - View Tasks via Chat (Priority: P1)

User wants to see their tasks without leaving the chat context. They type "show my tasks" or "what's on my list?" and see a formatted list.

**Why this priority**: Viewing tasks is essential for users to understand their current state before taking actions like completing or deleting.

**Independent Test**: Can be tested by creating tasks via UI, then opening chat and typing "show my tasks" to verify all tasks are listed.

**Acceptance Scenarios**:

1. **Given** user has 3 tasks (2 pending, 1 completed), **When** user types "show my tasks", **Then** AI lists all 3 tasks with status indicators.
2. **Given** user has no tasks, **When** user types "what's on my list?", **Then** AI responds "You don't have any tasks yet. Would you like to add one?"
3. **Given** user has tasks, **When** user types "show completed tasks", **Then** AI filters to show only completed tasks.

---

### User Story 3 - Complete a Task via Chat (Priority: P2)

User wants to mark a task as done using natural language. They type "complete buy groceries" or "done with the first one" and the task is marked complete.

**Why this priority**: After viewing tasks, completing them is the natural next action. This completes the core task lifecycle.

**Independent Test**: Can be tested by creating a task, then typing "complete [task name]" and verifying the task status changes.

**Acceptance Scenarios**:

1. **Given** user has task "buy groceries" (pending), **When** user types "complete buy groceries", **Then** task is marked complete and AI confirms.
2. **Given** user has task "buy groceries" (already completed), **When** user types "complete buy groceries", **Then** AI toggles it back to pending and confirms.
3. **Given** no task matches "groceries", **When** user types "complete groceries", **Then** AI says "I couldn't find a task called 'groceries'. Would you like me to show your tasks?"

---

### User Story 4 - Delete a Task via Chat (Priority: P2)

User wants to remove a task entirely. They type "delete buy groceries" or "remove that task" and the task is deleted after confirmation.

**Why this priority**: Users need the ability to remove tasks they no longer need. Requires confirmation for destructive actions.

**Independent Test**: Can be tested by creating a task, typing "delete [task name]", confirming, and verifying task is removed.

**Acceptance Scenarios**:

1. **Given** user has task "buy groceries", **When** user types "delete buy groceries", **Then** AI asks "Are you sure you want to delete 'buy groceries'?"
2. **Given** AI asked for confirmation, **When** user types "yes", **Then** task is deleted and AI confirms.
3. **Given** AI asked for confirmation, **When** user types "no" or "cancel", **Then** task is NOT deleted and AI acknowledges.

---

### User Story 5 - Search Tasks via Chat (Priority: P3)

User wants to find specific tasks by keyword. They type "find tasks with groceries" or "search for mom" and see matching results.

**Why this priority**: Useful for users with many tasks, but not essential for MVP. Enhances discoverability.

**Independent Test**: Can be tested by creating multiple tasks, then searching by keyword and verifying correct matches.

**Acceptance Scenarios**:

1. **Given** user has tasks "buy groceries", "call mom about groceries", **When** user types "search groceries", **Then** both tasks are shown.
2. **Given** no tasks contain "vacation", **When** user types "find vacation tasks", **Then** AI says "I couldn't find any tasks matching 'vacation'."

---

### User Story 6 - Ask About Account via Chat (Priority: P3)

User wants to confirm their identity. They type "who am I?" or "what's my email?" and see their account info.

**Why this priority**: Nice-to-have personalization. Helps users verify they're logged in correctly.

**Independent Test**: Can be tested by signing in and typing "who am I?" to verify correct email is shown.

**Acceptance Scenarios**:

1. **Given** user is authenticated as john@example.com, **When** user types "who am I?", **Then** AI responds with their name and email.
2. **Given** user asks "what's my email?", **Then** AI responds with just the email address.

---

### User Story 7 - Continue Conversation After Refresh (Priority: P2)

User refreshes the page or returns later. Their previous conversation is preserved and they can continue where they left off.

**Why this priority**: Essential for user experience - losing context is frustrating. Required for stateless architecture to feel stateful.

**Independent Test**: Can be tested by having a conversation, refreshing, and verifying messages are restored.

**Acceptance Scenarios**:

1. **Given** user had a conversation yesterday, **When** user opens chat today, **Then** previous messages are loaded.
2. **Given** user is on conversation 1, **When** user starts typing "add new task", **Then** message is added to same conversation.

---

### Edge Cases

- What happens when user sends an empty message? → AI asks "I didn't catch that. What would you like to do?"
- What happens when AI service is down? → User sees "I'm temporarily unavailable. Please try again shortly."
- What happens when user tries to access another user's task? → Returns 404 (not 403) to prevent information disclosure.
- What happens when rate limit is exceeded? → User sees "You're sending messages too quickly. Please wait a moment."
- What happens when message is too long (>2000 chars)? → Message is rejected with validation error.
- What happens when user types in Roman Urdu? → AI understands and responds appropriately.

---

## Requirements

### Functional Requirements

#### Core Chat

- **FR-001**: System MUST provide a floating chat icon on all authenticated pages
- **FR-002**: System MUST open a chat panel when icon is clicked
- **FR-003**: System MUST allow users to send text messages up to 2000 characters
- **FR-004**: System MUST display user messages aligned right (blue background)
- **FR-005**: System MUST display AI messages aligned left (gray background)
- **FR-006**: System MUST show a typing indicator while waiting for AI response
- **FR-007**: System MUST auto-scroll to newest messages

#### AI Agent

- **FR-010**: System MUST use OpenAI Agents SDK with Gemini API
- **FR-011**: System MUST interpret natural language intent without rigid patterns
- **FR-012**: System MUST use MCP tools for all task operations
- **FR-013**: System MUST ask for confirmation before delete operations
- **FR-014**: System MUST handle ambiguous requests by asking clarifying questions
- **FR-015**: System MUST respond in the same language the user used

#### MCP Tools

- **FR-020**: System MUST provide `add_task` tool with title and optional description
- **FR-021**: System MUST provide `list_tasks` tool with optional status filter
- **FR-022**: System MUST provide `toggle_task_completion` tool by task ID
- **FR-023**: System MUST provide `delete_task` tool by task ID
- **FR-024**: System MUST provide `search_tasks` tool with keyword and optional status filter
- **FR-025**: System MUST provide `get_my_user_info` tool

#### Data Persistence

- **FR-030**: System MUST create a new conversation when user sends first message (if none exists)
- **FR-031**: System MUST persist all messages to database
- **FR-032**: System MUST load conversation history on chat open
- **FR-033**: System MUST update conversation.updated_at on each new message

#### Security

- **FR-040**: System MUST require valid JWT for all chat API requests
- **FR-041**: System MUST validate URL user_id matches JWT user_id
- **FR-042**: System MUST filter all data queries by authenticated user_id
- **FR-043**: System MUST return 404 (not 403) for cross-user access attempts
- **FR-044**: System MUST NOT expose system prompt or internal errors to users

### Key Entities

- **Conversation**: A chat session belonging to a user. Contains: id, user_id, created_at, updated_at.
- **Message**: An individual chat message. Contains: id, user_id, conversation_id, role (user/assistant), content, created_at.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add a task via chat in under 5 seconds (excluding AI response time)
- **SC-002**: AI correctly interprets intent for 90%+ of common commands (add, list, complete, delete)
- **SC-003**: Chat panel opens in under 200ms
- **SC-004**: Conversation history loads in under 500ms (for conversations with <100 messages)
- **SC-005**: 0% of users can access another user's data (security audit pass)
- **SC-006**: AI response is returned within 5 seconds for 95% of requests
- **SC-007**: Chat works correctly on mobile devices (responsive design)
- **SC-008**: All accessibility requirements met (ARIA labels, keyboard navigation, 4.5:1 contrast)

### Technical Success Criteria

- **SC-010**: All MCP tools return consistent response format
- **SC-011**: All errors are user-friendly (no technical jargon exposed)
- **SC-012**: Chat operations do NOT interfere with Todo CRUD UI
- **SC-013**: Frontend state is managed independently from Todo state
- **SC-014**: Database queries all include user_id filter

---

## Non-Goals (Out of Scope)

| Item | Reason |
|------|--------|
| Voice input | Complexity; text-first MVP |
| File attachments | Not needed for task management |
| Multiple conversations switching | Single conversation per user is sufficient |
| Task due dates/reminders | Future enhancement, not Phase III |
| Task categories/tags | Future enhancement |
| Shared tasks between users | Security complexity |
| Offline support | Requires significant infrastructure |
| Real-time sync across devices | Future enhancement |

---

## Assumptions

1. User is already authenticated via Better Auth (Phase II)
2. Tasks table already exists with user_id foreign key
3. Gemini API key is available and configured
4. PostgreSQL (Neon) database is available
5. OpenAI SDK is compatible with Gemini API via base_url configuration

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini API rate limits | Users see errors | Implement rate limiting on our side first |
| AI misinterprets intent | Wrong action taken | Confirm destructive actions; ask for clarification |
| Long AI response times | Poor UX | Show typing indicator; consider streaming |
| Prompt injection attacks | Security breach | Harden system prompt; never execute user-provided code |
| Database connection issues | Chat unavailable | Graceful error handling; retry logic |
