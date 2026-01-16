# Research Document: Todo AI Chatbot

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Complete

## Research Summary

This document resolves all technical unknowns for the Phase III AI Chatbot implementation.

---

## Decision 1: OpenAI Agents SDK with Gemini API

**Question**: How to integrate Gemini API with OpenAI Agents SDK?

**Decision**: Use OpenAI SDK with custom base_url pointing to Gemini's OpenAI-compatible endpoint.

**Rationale**:
- Gemini provides an OpenAI-compatible API endpoint
- OpenAI Agents SDK can be configured with custom base_url
- This allows using familiar OpenAI SDK patterns while leveraging Gemini models

**Configuration**:
```python
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
```

**Model to use**: `gemini-2.0-flash-exp` (fast, capable, good for conversational AI)

**Alternatives Considered**:
1. Google's native Gemini SDK - Rejected: doesn't have Agents SDK equivalent
2. LangChain with Gemini - Rejected: adds unnecessary complexity
3. Direct Gemini API calls - Rejected: no agent/tool orchestration

---

## Decision 2: MCP Tool Integration Pattern

**Question**: How do MCP tools integrate with OpenAI Agents SDK?

**Decision**: Define tools as Python functions that are registered with the agent as OpenAI-compatible function definitions.

**Rationale**:
- OpenAI Agents SDK supports function calling
- MCP tools already return consistent `{status, message, data}` format
- Tools are already implemented in `backend/app/mcp_tools.py`

**Implementation Pattern**:
```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new todo task",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Optional task description"}
                },
                "required": ["title"]
            }
        }
    },
    # ... other tools
]
```

**Alternatives Considered**:
1. MCP Server Protocol - Rejected: over-engineered for this use case
2. Custom tool framework - Rejected: unnecessary when OpenAI SDK has built-in support

---

## Decision 3: Conversation State Management

**Question**: How to maintain conversation context across requests?

**Decision**: Stateless server with database-persisted conversation history. Load full history on each request.

**Rationale**:
- Constitution mandates stateless server (no in-memory state)
- Database persistence survives server restarts
- Supports horizontal scaling
- Conversation model stores messages with role and content

**Implementation**:
1. Each request includes optional `conversation_id`
2. If provided, load all messages for that conversation from DB
3. If not provided, create new conversation
4. Append user message and AI response to DB after each exchange

**Alternatives Considered**:
1. Redis session cache - Rejected: violates stateless principle
2. In-memory conversation cache - Rejected: violates stateless principle
3. Client-side conversation storage - Rejected: security risk, can't audit

---

## Decision 4: Agent Architecture

**Question**: Single agent or multiple specialized agents?

**Decision**: Single TodoOrchestratorAgent with all tools registered.

**Rationale**:
- Simpler architecture
- AI model handles intent routing internally
- All 6 tools serve a single domain (task management)
- No need for agent handoffs

**Agent Responsibilities**:
- Understand user intent
- Select appropriate tool(s)
- Chain multiple tools if needed
- Generate user-friendly responses

**Alternatives Considered**:
1. Multiple specialized agents - Rejected: adds complexity without benefit
2. Intent classifier + agent router - Rejected: violates Agent-First principle

---

## Decision 5: Chat Endpoint Design

**Question**: How should the chat endpoint work?

**Decision**: Single POST endpoint that handles everything synchronously.

**Endpoint**: `POST /api/{user_id}/chat`

**Request**:
```json
{
    "message": "add task buy groceries",
    "conversation_id": 123  // optional
}
```

**Response**:
```json
{
    "conversation_id": 123,
    "message": {
        "id": 456,
        "role": "assistant",
        "content": "Task 'Buy groceries' has been added.",
        "created_at": "2026-01-16T19:30:00Z"
    }
}
```

**Rationale**:
- Simple, synchronous pattern
- Single round-trip per user message
- No WebSocket complexity
- Sufficient for MVP

**Alternatives Considered**:
1. WebSocket connection - Rejected: adds complexity, not needed for MVP
2. Server-Sent Events - Rejected: not needed without streaming
3. Separate endpoints for each intent - Rejected: violates Agent-First principle

---

## Decision 6: Frontend Chat Component Architecture

**Question**: How should the chat UI be structured?

**Decision**: Floating chat widget at layout level, independent React state.

**Components**:
```
frontend/components/chat/
├── ChatWidget.tsx       # Main wrapper (icon + panel)
├── ChatIcon.tsx         # Floating button
├── ChatPanel.tsx        # Panel container
├── ChatHeader.tsx       # Header with close button
├── MessageList.tsx      # Scrollable messages
├── MessageBubble.tsx    # Individual message
├── ChatInput.tsx        # Input + send button
├── TypingIndicator.tsx  # Loading dots
└── index.ts             # Exports
```

**State Management**:
- Use custom `useChat` hook
- Independent from Todo state
- No Redux/Zustand needed for this scope

**Rationale**:
- Component separation enables maintainability
- Custom hook isolates chat logic
- No external state library reduces complexity

**Alternatives Considered**:
1. Full-page chat route - Rejected: spec requires overlay panel
2. Global state (Redux) - Rejected: overkill for single feature
3. Third-party chat UI library - Rejected: customization constraints

---

## Decision 7: Database Migration Strategy

**Question**: How to add new tables without breaking existing data?

**Decision**: SQLModel auto-migration with explicit table creation.

**New Tables**:
1. `conversations` - Chat sessions
2. `messages` - Individual chat messages

**Migration Approach**:
1. Define SQLModel classes for Conversation and Message
2. Use `SQLModel.metadata.create_all(engine)` to create tables
3. Tables are additive - no existing data affected

**Rationale**:
- Simple approach for MVP
- SQLModel handles schema creation
- No complex migration tool needed

**Alternatives Considered**:
1. Alembic migrations - Rejected: overkill for additive schema
2. Raw SQL scripts - Rejected: less maintainable

---

## Decision 8: Error Handling Strategy

**Question**: How to handle errors across all layers?

**Decision**: Layered error handling with user-friendly surface messages.

**Layers**:
1. **MCP Tools**: Return `{status: "error", message: "...", data: null}`
2. **Agent**: Translate tool errors to conversational responses
3. **Chat Endpoint**: Return appropriate HTTP status codes
4. **Frontend**: Display error in chat panel with retry option

**Error Flow**:
```
MCP Tool Error → Agent interprets → User-friendly response → Frontend display
```

**Rationale**:
- Each layer handles errors appropriate to its abstraction
- User never sees technical errors
- Logging at backend for debugging

**Alternatives Considered**:
1. Bubble all errors to frontend - Rejected: exposes internals
2. Silent failure - Rejected: poor UX

---

## Decision 9: Authentication in Chat Context

**Question**: How does JWT authentication flow through chat?

**Decision**: Standard JWT verification at endpoint, user_id passed to agent context and tools.

**Flow**:
1. Frontend attaches JWT to Authorization header
2. Chat endpoint extracts and validates JWT
3. Extracts user_id from JWT claims
4. Passes user_id to agent context
5. Agent passes user_id to every MCP tool call

**Security**:
- Tools receive user_id from trusted source (JWT)
- Never trust user_id from user input
- All tool operations scoped to authenticated user

**Rationale**:
- Consistent with existing Phase II auth pattern
- User isolation enforced at every layer

---

## Decision 10: Rate Limiting

**Question**: How to prevent abuse of the chat endpoint?

**Decision**: Simple per-user rate limiting at endpoint level.

**Configuration**:
- 30 requests per minute per user
- Return 429 with user-friendly message on limit exceeded

**Implementation**: Use FastAPI middleware or dependency.

**Rationale**:
- Protects against abuse
- Per-user limits don't affect other users
- Simple to implement

**Alternatives Considered**:
1. Redis-based rate limiting - Rejected: adds dependency
2. IP-based limiting - Rejected: doesn't account for authenticated users

---

## Technical Context (Resolved)

| Item | Value |
|------|-------|
| Language/Version | Python 3.11+, TypeScript 5.x |
| Primary Dependencies | FastAPI, OpenAI SDK, SQLModel, Next.js |
| Storage | Neon PostgreSQL (existing) |
| Testing | pytest (backend), manual (frontend MVP) |
| Target Platform | Web (desktop + mobile responsive) |
| Project Type | Web (frontend + backend monorepo) |
| Performance Goals | <5s AI response time, <200ms UI interactions |
| Constraints | Stateless backend, no WebSockets |
| Scale/Scope | Single user per request, 50 message history limit |

---

## Existing Assets

| Asset | Status | Notes |
|-------|--------|-------|
| Task model | EXISTS | `backend/app/models.py` |
| MCP tools | EXISTS | `backend/app/mcp_tools.py` - all 6 tools implemented |
| JWT auth | EXISTS | `backend/app/dependencies.py` |
| Database | EXISTS | Neon PostgreSQL connected |
| Frontend layout | EXISTS | `frontend/app/(app)/layout.tsx` |
| UI components | EXISTS | `frontend/components/ui/` |

---

## Implementation Readiness

All research questions resolved. Ready to proceed with:
1. Database models for Conversation and Message
2. Chat endpoint implementation
3. Agent configuration
4. Frontend chat components
