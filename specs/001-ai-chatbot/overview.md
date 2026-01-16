# Todo AI Chatbot - System Overview

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft
**Constitution Reference**: Phase III Todo AI Chatbot Constitution v2.0.0

## Purpose

The Todo AI Chatbot is an intelligent, conversational interface that enables users to manage their todo tasks entirely through natural language. It extends the existing Full-Stack Todo Application (Phase II) by adding an AI-powered chat experience while reusing all existing infrastructure.

## Phase III Goals

1. **Natural Language Task Management**: Users MUST be able to create, list, complete, delete, and search tasks using conversational commands
2. **Seamless Integration**: The chatbot MUST integrate with the existing Todo backend without duplicating logic or creating parallel systems
3. **Stateless Architecture**: The backend MUST hold zero in-memory state; all context MUST persist in the database
4. **Premium User Experience**: The chat interface MUST feel modern, responsive, and professional
5. **Resume-Safe Conversations**: Users MUST be able to continue conversations after page reloads or server restarts

## Relationship with Existing Todo App

| Component | Phase II (Existing) | Phase III (New) |
|-----------|---------------------|-----------------|
| Task Storage | PostgreSQL via SQLModel | Reuses existing Task model |
| Authentication | Better Auth + JWT | Reuses existing auth system |
| Task CRUD | REST API endpoints | Reuses via MCP tools |
| User Interface | React-based Todo list | Adds floating chat panel |
| Data Isolation | user_id filtering | Extends to conversations |

The chatbot MUST NOT:
- Replace the existing Todo CRUD UI
- Create a separate task storage system
- Bypass existing authentication
- Duplicate business logic

## Supported User Capabilities

### Task Operations

| Capability | Example Phrases |
|------------|-----------------|
| Create task | "add task buy groceries", "create todo for meeting", "remind me to call mom" |
| List all tasks | "show my tasks", "list todos", "what do I have to do" |
| List pending | "show pending tasks", "what's not done yet" |
| List completed | "show completed tasks", "what did I finish" |
| Complete task | "mark buy groceries as done", "complete task 5" |
| Delete task | "delete buy groceries", "remove task 5" |
| Search tasks | "find tasks about groceries", "search for meeting" |

### User Information

| Capability | Example Phrases |
|------------|-----------------|
| Identity query | "who am I", "my email kya hai", "what's my account info" |

### Conversation Features

| Capability | Description |
|------------|-------------|
| Context continuity | Agent remembers previous messages in session |
| Clarification | Agent asks for more info when command is ambiguous |
| Confirmation | Agent confirms all task mutations |

## Explicit Non-Goals

The following features are explicitly OUT OF SCOPE for Phase III:

1. **Task Sharing**: No sharing tasks between users
2. **Categories/Tags**: No task categorization system
3. **Due Dates with Reminders**: No notification system
4. **Real-time Updates**: No WebSocket-based live updates
5. **Voice Input**: Text-only interface
6. **Multi-language Support**: English only
7. **File Attachments**: No file upload to tasks
8. **Analytics/Billing**: No usage tracking or monetization
9. **Multimodal Features**: No image/audio processing

## Stateless AI Philosophy

### Core Principle

The backend server MUST hold zero in-memory state between requests. This enables:
- Horizontal scaling (multiple server instances)
- Safe server restarts without data loss
- Predictable, reproducible behavior

### Implementation Rules

1. **No Server Sessions**: Conversation context MUST be loaded from database on each request
2. **No In-Memory Cache**: Task data MUST be fetched fresh for each operation
3. **Database as Single Source of Truth**: All state changes MUST be persisted immediately
4. **Stateless Agent Execution**: Each agent invocation starts fresh with context from DB

### Request Lifecycle

```
1. User sends message → Frontend
2. Frontend sends POST /api/{user_id}/chat with JWT → Backend
3. Backend verifies JWT, extracts user_id
4. Backend loads conversation history from DB
5. Backend invokes AI agent with:
   - User message
   - Conversation history
   - MCP tools
   - User context (user_id)
6. Agent interprets intent and calls MCP tools
7. MCP tools execute against DB and return results
8. Agent generates response
9. Backend persists user message and AI response to DB
10. Backend returns response to Frontend
11. Frontend displays response in chat UI
```

## Success Criteria

| Criterion | Metric |
|-----------|--------|
| Task Creation | Users can create tasks via natural language in under 3 seconds |
| Task Listing | Users receive task lists within 2 seconds |
| Intent Accuracy | Agent correctly interprets 95%+ of standard task commands |
| Conversation Continuity | Users can resume conversations after page reload |
| Error Recovery | System provides helpful suggestions for all error scenarios |
| UI Responsiveness | Chat panel opens/closes within 200ms |
| Mobile Usability | Chat is fully functional on mobile devices |
