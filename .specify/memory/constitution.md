<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.0.0 → 2.0.0 (MAJOR - Phase III AI Chatbot System Addition)

Modified Principles:
  - Principle VIII "Technology Stack Compliance" → Extended with AI/Agent stack
  - Principle X "Quality Assurance" → Extended with AI/chatbot validation rules

Added Sections:
  - AI Architecture Overview
  - Agent Constitution (Primary Agent + Logical Sub-Agents)
  - MCP Tool Governance
  - Data & Memory Constitution (Conversation, Message models)
  - Natural Language Guarantees
  - Response Quality Standards
  - Error Handling Constitution
  - Frontend UX Constitution (Chat UI)
  - Core Design Principles (Agent-First, Stateless, Tool-Driven, Seamless Integration)
  - Phase III Scope Boundaries

Removed Sections:
  - "Out of Scope" items moved to "In Scope" for Phase III

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section compatible with new AI principles
  ✅ spec-template.md - Requirements section aligns with FR/NFR format + AI requirements
  ✅ tasks-template.md - Phase structure supports AI agent/MCP tool development

Follow-up TODOs: None

================================================================================
-->

# Hackathon Todo – Phase III Constitution

**Phase Name**: Full-Stack AI Chatbot System
**Development Model**: Spec-Driven, Agentic Dev Stack
**Implementation Tooling**: Claude Code + Spec-Kit Plus

This constitution serves as the single source of truth for how the system is designed, built, secured, and evolved. All plans, tasks, implementations, and evaluations MUST comply with this document.

## System Mission

Design and implement a production-grade, AI-powered Todo Management Platform that extends the existing Full-Stack Todo Application by integrating an intelligent, conversational AI chatbot.

The chatbot MUST allow users to manage todos entirely via natural language, using a stateless, scalable backend architecture, powered by OpenAI Agents SDK (using Gemini API key) and MCP (Model Context Protocol) tools.

This system MUST be built using the Agentic Dev Stack workflow with NO manual coding, relying strictly on Spec-Kit Plus and Claude Code.

## Core Design Principles (NON-NEGOTIABLE)

### Agent-First Architecture

All business logic is driven by AI agents. No hard-coded intent routing. AI decides tool usage.

**Rules:**
- The AI agent MUST interpret user intent
- The AI agent MUST select appropriate MCP tools
- No static if/else routing for user commands
- Agent behavior MUST be governed by system prompts, not code branches

### Stateless Server

Backend holds zero in-memory state. All context persists in the database. Safe for horizontal scaling and restarts.

**Rules:**
- Server MUST NOT store conversation state in memory
- Server MUST NOT use server-side sessions for chat context
- All conversation history MUST be loaded from database per request
- System MUST survive server restarts without data loss

### Tool-Driven AI (MCP)

AI can ONLY modify system state via MCP tools. MCP tools are deterministic, stateless, and auditable.

**Rules:**
- AI agent MUST NOT directly access database
- All task mutations MUST go through MCP tools
- MCP tools MUST validate inputs before execution
- MCP tools MUST return structured, predictable outputs

### Seamless Integration

AI chatbot integrates into the existing backend. No parallel systems or duplicated logic.

**Rules:**
- Chatbot MUST reuse existing Task model and database
- Chatbot MUST use existing authentication system
- No separate task storage for AI-created tasks
- All tasks appear in both chat and traditional UI

### Professional UX

Chat UI MUST feel premium, modern, and reliable. AI responses MUST be friendly, concise, and confident.

**Rules:**
- Chat interface MUST clearly separate user and AI messages
- Loading states MUST be visible during AI processing
- Error messages MUST be user-friendly, not technical
- AI responses MUST confirm actions taken

## Existing System Context

The AI chatbot extends the existing Full-Stack Todo Application with:

| Component | Technology | Status |
|-----------|------------|--------|
| Frontend | Next.js (App Router) | Already implemented |
| Backend | Python FastAPI | Already implemented |
| Database | Neon Serverless PostgreSQL | Already implemented |
| ORM | SQLModel | Already implemented |
| Authentication | Better Auth | Already implemented |
| Users | Identified by email/user_id | Already implemented |

The chatbot MUST NOT replace existing logic — it MUST reuse and integrate with it.

## Core Principles (Inherited from Phase II)

### I. Spec-Driven Development (NON-NEGOTIABLE)

All development MUST follow the Agentic Development Stack workflow:

1. Write or update specifications
2. Generate a technical plan from specs
3. Break the plan into tasks
4. Delegate implementation to Claude Code
5. Review outputs and iterate by updating specs

**Rules:**
- Claude Code MUST NEVER implement features not explicitly defined in specs
- Specifications ALWAYS override assumptions
- If a requirement is not written in a spec, it MUST NOT be implemented

### II. Zero Manual Coding

The developer's role is specification authorship, not code authorship.

**Rules:**
- All code MUST be written by Claude Code
- Manual code edits are forbidden
- Developer interaction is limited to: writing specs, reviewing outputs, approving PRs
- Any code written outside Claude Code violates this constitution

### III. Authentication-First Security

Every API interaction MUST be authenticated and authorized.

**Rules:**
- All API endpoints MUST require a valid JWT token
- JWT MUST be sent in the Authorization header as: `Authorization: Bearer <token>`
- Requests without a token MUST return 401 Unauthorized
- Requests with invalid or expired tokens MUST be rejected
- Backend MUST decode JWT to extract user identity
- Both frontend and backend MUST use the same JWT signing secret via `BETTER_AUTH_SECRET`

### IV. User Data Isolation (NON-NEGOTIABLE)

No user may access another user's data under any circumstance.

**Rules:**
- Backend MUST extract `user_id` from the JWT token
- The `user_id` in the URL path MUST match the authenticated user's ID
- Any mismatch MUST result in a 403 Forbidden response
- Every database query MUST filter by authenticated `user_id`
- No cross-user data access is permitted
- AI agent MUST only access authenticated user's tasks and conversations

### V. RESTful API Consistency

The API MUST follow consistent REST conventions.

**Rules:**
- All routes MUST be prefixed with `/api/`
- Every request MUST be authenticated
- Every response MUST only include tasks owned by the authenticated user
- Task ownership MUST be validated on every operation
- HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE (remove)

### VI. Relational Data Integrity

The database schema MUST follow relational best practices.

**Rules:**
- All foreign keys MUST be enforced
- Required fields MUST have NOT NULL constraints
- Indexes MUST exist on frequently queried columns (`user_id`, `completed`, `conversation_id`)
- All database access MUST use SQLModel ORM
- Schema changes MUST be migration-based

### VII. Monorepo Structure

The project MUST be organized as a monorepo with clear layer separation.

**Rules:**
- Frontend and backend MUST be in separate directories (`/frontend/`, `/backend/`)
- Each layer MUST have its own `CLAUDE.md` with layer-specific instructions
- Specs MUST be referenced using `@specs/<path>.md` notation
- Shared configuration MUST be at repository root

### VIII. Technology Stack Compliance

The technology stack is fixed and non-negotiable.

**Frontend:**
- Next.js 16+ using App Router
- TypeScript
- Tailwind CSS
- Better Auth (JavaScript-based authentication)
- Chat UI components

**Backend:**
- Python FastAPI
- SQLModel ORM
- RESTful API architecture
- OpenAI Agents SDK (with Gemini API key via OpenAI-compatible interface)
- MCP tools for AI agent actions

**Database:**
- Neon Serverless PostgreSQL
- SQLModel-managed schema
- Conversation and Message tables for chat persistence

**Authentication:**
- Better Auth (frontend)
- JWT-based verification (backend)

**AI Framework:**
- OpenAI Agents SDK
- Gemini API key via OpenAI-compatible interface
- Agent Runner handles execution

### IX. Separation of Concerns

The system MUST maintain clear boundaries between layers.

**Frontend Responsibilities:**
- UI rendering and routing
- Authentication state management via Better Auth
- JWT token attachment to all API requests
- Client-side validation and user feedback
- Chat UI rendering and message display

**Backend Responsibilities:**
- RESTful API endpoint exposure
- JWT token verification on every request
- Task ownership enforcement
- Database communication via SQLModel
- AI agent orchestration
- MCP tool execution

**Database Responsibilities:**
- Data persistence
- Relational integrity enforcement
- User, task, conversation, and message storage

### X. Quality Assurance

The system MUST meet quality standards before deployment.

**Rules:**
- User data isolation MUST be verified
- Authentication MUST be tested for all endpoints
- Persistent storage MUST be validated
- API behavior MUST be consistent across endpoints
- Frontend and backend concerns MUST remain separated
- AI agent MUST correctly interpret natural language commands
- MCP tools MUST execute without side effects beyond intended action

## AI Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CHAT UI (Browser)                               │
│  User types: "add task buy groceries"                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js + Better Auth)                          │
│  POST /api/{user_id}/chat with JWT token                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                            JWT Token + Message
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (FastAPI)                                   │
│  1. Verify JWT, extract user_id                                              │
│  2. Load conversation history from DB                                        │
│  3. Invoke AI agent with context + MCP tools                                 │
│  4. Agent selects and calls MCP tools                                        │
│  5. Persist new messages to DB                                               │
│  6. Return AI response to frontend                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MCP TOOLS (Stateless)                               │
│  add_task │ list_tasks │ complete_task │ delete_task │ update_task           │
│  get_my_user_info │ search_tasks                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (Neon PostgreSQL)                           │
│  tasks │ conversations │ messages │ user (Better Auth)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Agent Constitution

### Primary Agent: Todo Orchestrator Agent

The system SHALL define a single primary AI agent responsible for:

- Understanding user intent
- Selecting MCP tools
- Chaining multiple tools if needed
- Generating final responses

The agent MUST:

- Never hallucinate data (MUST use MCP tools to verify)
- Never bypass MCP tools for task mutations
- Always confirm user-affecting actions
- Handle ambiguous commands by asking clarification

### Logical Sub-Agents (Behavioral Responsibilities)

These define behavioral modes, NOT separate processes:

| Sub-Agent | Responsibility |
|-----------|----------------|
| Task Management Intelligence | Adds, lists, updates, completes, deletes todos |
| Conversation Context Intelligence | Restores chat context from database, enables continuity |
| User Context Awareness | Understands authenticated user, responds to identity questions |
| Confirmation & UX Intelligence | Produces friendly, professional responses |
| Error Recovery Intelligence | Graceful handling of missing tasks, invalid input |

## MCP Tool Governance

### MCP Server Rules

MCP tools are the ONLY allowed interface for task mutations.

MCP tools MUST:
- Be stateless (no internal memory between calls)
- Validate all inputs before execution
- Persist results to database
- Return structured outputs in consistent format

### Required MCP Tools

| Tool | Purpose | Parameters |
|------|---------|------------|
| `add_task` | Create todo | title (required), description (optional), due_date (optional) |
| `list_tasks` | Retrieve todos | status, limit, offset, sort_by, sort_order |
| `toggle_task_completion` | Mark complete/incomplete | task_id |
| `delete_task` | Remove todo | task_id |
| `get_my_user_info` | Get user account info | (none) |
| `search_tasks` | Search by keyword | keyword, status |

### MCP Tool Response Format

All MCP tools MUST return:

```json
{
  "status": "success" | "error",
  "message": "Human-readable description",
  "data": <relevant data or null>
}
```

## Data & Memory Constitution

### Database Is The Only Memory

The system SHALL persist:
- Tasks
- Conversations
- Messages

No server-side memory, cache, or session state is allowed.

### Required Models

**Task** (existing)

| Field | Type | Constraints |
|-------|------|-------------|
| id | integer | PRIMARY KEY, AUTOINCREMENT |
| user_id | string | FOREIGN KEY → users.id, NOT NULL |
| title | string | NOT NULL, LENGTH 1-200 |
| description | string | NULLABLE, MAX LENGTH 1000 |
| completed | boolean | NOT NULL, DEFAULT false |
| created_at | timestamp | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() |

**Conversation** (new)

| Field | Type | Constraints |
|-------|------|-------------|
| id | integer | PRIMARY KEY, AUTOINCREMENT |
| user_id | string | FOREIGN KEY → users.id, NOT NULL |
| created_at | timestamp | NOT NULL, DEFAULT NOW() |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() |

**Message** (new)

| Field | Type | Constraints |
|-------|------|-------------|
| id | integer | PRIMARY KEY, AUTOINCREMENT |
| user_id | string | FOREIGN KEY → users.id, NOT NULL |
| conversation_id | integer | FOREIGN KEY → conversations.id, NOT NULL |
| role | string | NOT NULL, ENUM: 'user', 'assistant' |
| content | text | NOT NULL |
| created_at | timestamp | NOT NULL, DEFAULT NOW() |

### Required Indexes

- `tasks.user_id` - Query optimization for user task lists
- `tasks.completed` - Filter optimization for completion status
- `conversations.user_id` - Query optimization for user conversations
- `messages.conversation_id` - Query optimization for conversation history
- `messages.user_id` - User isolation enforcement

## Natural Language Guarantees

The agent MUST correctly interpret:

| Intent | Example Phrases |
|--------|-----------------|
| Task creation | "add task buy groceries", "create a todo for meeting", "remind me to call mom" |
| Task listing (all) | "show my tasks", "list todos", "what do I have to do" |
| Task listing (pending) | "show pending tasks", "what's not done", "incomplete todos" |
| Task listing (completed) | "show completed tasks", "what did I finish" |
| Task completion | "mark buy groceries as done", "complete task 5", "finish the meeting task" |
| Task deletion | "delete task buy groceries", "remove todo 5", "cancel the meeting task" |
| Task search | "find tasks about groceries", "search for meeting" |
| User identity | "who am I", "my email kya hai", "meri account info dikhao" |
| Ambiguous commands | Agent MUST ask for clarification |

## Response Quality Standards

AI responses MUST be:

- **Clear**: No ambiguity about what action was taken
- **Friendly**: Warm, conversational tone
- **Professional**: No slang, typos, or unprofessional language
- **Action-confirming**: Always state what was done
- **UI-ready**: No excessive markdown, code blocks, or formatting clutter

### Response Examples

| Scenario | Good Response | Bad Response |
|----------|---------------|--------------|
| Task created | "Your task 'Buy groceries' has been added successfully." | "Task added to database with id 47" |
| Task not found | "I couldn't find that task. Would you like me to show your list?" | "Error: Task not found in database" |
| Ambiguous | "I found 3 tasks with 'meeting'. Which one did you mean?" | "Multiple results, please be specific" |

## Error Handling Constitution

The system MUST:

- Never crash on bad input
- Never expose stack traces to users
- Offer recovery suggestions
- Log errors for debugging (server-side only)

### Error Response Examples

| Error Type | User Message |
|------------|--------------|
| Task not found | "I couldn't find that task. Would you like me to show your list?" |
| Invalid input | "I need a title for the task. What would you like to call it?" |
| Database error | "Something went wrong on my end. Please try again in a moment." |
| Authentication error | "Please sign in to manage your tasks." |

## Frontend UX Constitution

### Chat UI Requirements

The Chat UI MUST:

- Feel premium and modern
- Support long conversations with scrolling
- Show loading states during AI processing
- Clearly separate user vs AI messages (different colors/alignment)
- Handle reconnects gracefully
- Persist conversation across page refreshes
- Be responsive (mobile-friendly)

### Message Display

| Message Type | Visual Treatment |
|--------------|------------------|
| User message | Right-aligned, primary color background |
| AI message | Left-aligned, neutral background |
| Loading | Typing indicator or spinner |
| Error | Red/warning styling, retry option |

## API Constitution (Extended)

### Chat Endpoint

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/{user_id}/chat` | Send message to AI agent |
| GET | `/api/{user_id}/conversations` | List user's conversations |
| GET | `/api/{user_id}/conversations/{id}/messages` | Get conversation history |

### Chat Request/Response

**Send Message (POST /api/{user_id}/chat)**

```json
// Request
{
  "message": "add task buy groceries",
  "conversation_id": 123  // optional, creates new if omitted
}

// Response
{
  "conversation_id": 123,
  "message": {
    "id": 456,
    "role": "assistant",
    "content": "Your task 'Buy groceries' has been added successfully.",
    "created_at": "2026-01-16T19:30:00Z"
  }
}
```

## Authentication & Security Constitution

### Security Rules (Extended for Chat)

| Scenario | Required Response |
|----------|-------------------|
| No token provided | 401 Unauthorized |
| Invalid token | 401 Unauthorized |
| Expired token | 401 Unauthorized |
| URL user_id ≠ JWT user_id | 403 Forbidden |
| Valid token + matching user_id | Allow request |
| AI tries to access other user's tasks | Block at MCP tool level |
| AI tries to access other user's conversations | Block at query level |

### Environment Variables (Extended)

| Variable | Purpose | Required By |
|----------|---------|-------------|
| `BETTER_AUTH_SECRET` | JWT signing/verification | Frontend + Backend |
| `DATABASE_URL` | Neon PostgreSQL connection | Backend |
| `GEMINI_API_KEY` | AI model access | Backend |
| `OPENAI_API_BASE` | OpenAI-compatible endpoint for Gemini | Backend |

## Phase III Scope Boundaries

### In Scope (Phase III)

- AI chatbot integration
- Natural language task management
- MCP tools for all task operations
- Conversation persistence
- Chat UI components
- User identity queries via chatbot
- Task search via chatbot

### Out of Scope (Phase III)

- Task sharing between users
- Task categories or tags
- Due dates with reminders/notifications
- Real-time updates (WebSockets)
- Voice input
- Multi-language support beyond English
- File attachments to tasks

## Governance

### Amendment Process

1. Proposed amendments MUST be documented in a spec
2. Amendments MUST include rationale and impact analysis
3. Constitution version MUST be incremented per semantic versioning
4. All dependent artifacts MUST be updated for consistency

### Versioning Policy

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Backward-incompatible principle removal/redefinition | MAJOR | 1.0.0 → 2.0.0 |
| New principle or materially expanded guidance | MINOR | 1.0.0 → 1.1.0 |
| Clarifications, wording, typo fixes | PATCH | 1.0.0 → 1.0.1 |

### Compliance Review

- All PRs MUST verify compliance with this constitution
- Complexity MUST be justified against constitutional principles
- Security violations result in immediate rejection
- AI behavior MUST be tested against natural language guarantees

### Final Authority Statement

This constitution is the **highest authority** for Phase III.

All plans, tasks, implementations, and evaluations MUST comply with this document.

**If a requirement is not written in a spec, it MUST NOT be implemented.**

**Version**: 2.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-16
