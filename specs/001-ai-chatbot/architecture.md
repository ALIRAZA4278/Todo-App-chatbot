# Todo AI Chatbot - System Architecture

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## End-to-End System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         NEXT.JS FRONTEND                                ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐││
│  │  │  Todo CRUD   │  │  Chat Panel  │  │      Better Auth Session       │││
│  │  │  (Phase II)  │  │  (Phase III) │  │      JWT Token Provider        │││
│  │  └──────────────┘  └──────────────┘  └────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                          POST /api/{user_id}/chat
                          Authorization: Bearer <JWT>
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      REQUEST HANDLING LAYER                              ││
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐││
│  │  │ JWT Verification │  │ User ID Matching │  │ Request Validation     │││
│  │  │ (Dependencies)   │  │ (URL vs Token)   │  │ (Pydantic Schemas)     │││
│  │  └──────────────────┘  └──────────────────┘  └────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        CHAT ENDPOINT LAYER                               ││
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐││
│  │  │ Load Conversation│  │ Invoke AI Agent  │  │ Persist Messages       │││
│  │  │ History from DB  │  │ with MCP Tools   │  │ to Database            │││
│  │  └──────────────────┘  └──────────────────┘  └────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      AI AGENT ORCHESTRATION                              ││
│  │  ┌──────────────────────────────────────────────────────────────────┐  ││
│  │  │              OPENAI AGENTS SDK (Gemini Backend)                   │  ││
│  │  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │  ││
│  │  │  │ System Prompt  │  │ Tool Selection │  │ Response Generation│  │  ││
│  │  │  │ (Instructions) │  │ (Intent→Tool)  │  │ (User-Friendly)    │  │  ││
│  │  │  └────────────────┘  └────────────────┘  └────────────────────┘  │  ││
│  │  └──────────────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                          MCP TOOLS LAYER                                 ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐           ││
│  │  │ add_task   │ │ list_tasks │ │ toggle_    │ │ delete_    │           ││
│  │  │            │ │            │ │ completion │ │ task       │           ││
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘           ││
│  │  ┌────────────┐ ┌────────────┐                                          ││
│  │  │ search_    │ │ get_my_    │                                          ││
│  │  │ tasks      │ │ user_info  │                                          ││
│  │  └────────────┘ └────────────┘                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NEON POSTGRESQL DATABASE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   user      │  │   tasks     │  │conversations│  │  messages   │        │
│  │ (BetterAuth)│  │ (Phase II)  │  │ (Phase III) │  │ (Phase III) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Stateless Request Lifecycle

### Request Flow Diagram

```
┌────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐     ┌────────┐
│ User   │     │ Frontend │     │ Backend  │     │ Agent   │     │   DB   │
└───┬────┘     └────┬─────┘     └────┬─────┘     └────┬────┘     └───┬────┘
    │               │                │                │              │
    │ Type message  │                │                │              │
    ├──────────────►│                │                │              │
    │               │                │                │              │
    │               │ POST /chat     │                │              │
    │               │ + JWT token    │                │              │
    │               ├───────────────►│                │              │
    │               │                │                │              │
    │               │                │ Verify JWT     │              │
    │               │                ├───────────────►│              │
    │               │                │                │              │
    │               │                │ Load history   │              │
    │               │                ├────────────────┼─────────────►│
    │               │                │◄───────────────┼──────────────┤
    │               │                │                │              │
    │               │                │ Invoke agent   │              │
    │               │                ├───────────────►│              │
    │               │                │                │              │
    │               │                │                │ Call MCP tool│
    │               │                │                ├─────────────►│
    │               │                │                │◄─────────────┤
    │               │                │                │              │
    │               │                │ Agent response │              │
    │               │                │◄───────────────┤              │
    │               │                │                │              │
    │               │                │ Persist msgs   │              │
    │               │                ├────────────────┼─────────────►│
    │               │                │                │              │
    │               │ JSON response  │                │              │
    │               │◄───────────────┤                │              │
    │               │                │                │              │
    │ Display msg   │                │                │              │
    │◄──────────────┤                │                │              │
    │               │                │                │              │
```

### Step-by-Step Lifecycle

| Step | Component | Action | Data |
|------|-----------|--------|------|
| 1 | Frontend | User types message and clicks send | message text |
| 2 | Frontend | Attach JWT token from Better Auth session | Authorization header |
| 3 | Frontend | POST to /api/{user_id}/chat | { message, conversation_id? } |
| 4 | Backend | Extract JWT from Authorization header | Bearer token |
| 5 | Backend | Verify JWT signature with BETTER_AUTH_SECRET | payload with sub claim |
| 6 | Backend | Validate URL user_id matches JWT sub | user_id |
| 7 | Backend | Load or create conversation from DB | conversation record |
| 8 | Backend | Load last N messages from DB | message history |
| 9 | Backend | Construct agent context | system prompt + history + tools |
| 10 | Backend | Invoke OpenAI Agents SDK with Gemini | agent request |
| 11 | Agent | Parse user intent | intent classification |
| 12 | Agent | Select appropriate MCP tool(s) | tool selection |
| 13 | Agent | Call MCP tool with parameters | tool invocation |
| 14 | MCP Tool | Validate inputs and user_id | validation |
| 15 | MCP Tool | Execute database operation | SQL query |
| 16 | MCP Tool | Return structured response | { status, message, data } |
| 17 | Agent | Format user-friendly response | natural language |
| 18 | Backend | Persist user message to DB | message record |
| 19 | Backend | Persist assistant message to DB | message record |
| 20 | Backend | Update conversation timestamp | updated_at |
| 21 | Backend | Return JSON response | { conversation_id, message } |
| 22 | Frontend | Display AI response in chat panel | rendered message |

## Integration with Existing FastAPI Backend

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Add chat router
│   ├── config.py            # Add GEMINI_API_KEY
│   ├── db.py                # Unchanged
│   ├── models.py            # Add Conversation, Message
│   ├── schemas.py           # Add chat schemas
│   ├── dependencies.py      # Unchanged
│   ├── mcp_tools.py         # MCP tool implementations
│   ├── agent.py             # AI agent configuration
│   └── routes/
│       ├── __init__.py
│       ├── tasks.py         # Unchanged (Phase II)
│       └── chat.py          # NEW: Chat endpoint
└── requirements.txt         # Add openai, agents-sdk
```

### Integration Points

| Existing Component | Integration |
|--------------------|-------------|
| main.py | Add `chat_router` to app |
| config.py | Add `GEMINI_API_KEY`, `OPENAI_API_BASE` settings |
| models.py | Add `Conversation`, `Message` SQLModel classes |
| dependencies.py | Reuse `get_current_user` for chat endpoint |
| db.py | Reuse existing engine and session |

## Gemini API via OpenAI-Compatible Client

### Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| API Base URL | `https://generativelanguage.googleapis.com/v1beta/openai/` | Gemini's OpenAI-compatible endpoint |
| Model | `gemini-2.0-flash` | Fast, capable model for chat |
| API Key | `GEMINI_API_KEY` environment variable | Authentication |

### Agent Runner Execution Model

1. **Initialization**: Create OpenAI client with Gemini base URL
2. **Agent Definition**: Define agent with system prompt and MCP tools
3. **Execution**: Run agent with user message and conversation history
4. **Tool Handling**: Agent automatically calls tools and processes results
5. **Response**: Agent generates final user-facing response

### Stateless Guarantees

- Each agent invocation is independent
- No agent state persists between requests
- Conversation context is explicitly passed from DB
- Tool results are not cached

## Separation of Concerns

### Frontend Responsibilities

| Concern | Responsibility |
|---------|----------------|
| Chat UI | Render chat panel, message bubbles, input field |
| State Management | Manage local chat state, optimistic updates |
| Authentication | Provide JWT token via Better Auth |
| API Communication | Send chat requests, handle responses |
| Error Display | Show user-friendly error messages |
| Accessibility | Keyboard navigation, screen reader support |

### Backend Responsibilities

| Concern | Responsibility |
|---------|----------------|
| Request Validation | Validate JWT, user_id, request body |
| Conversation Management | Create/load conversations, persist messages |
| Agent Orchestration | Configure and invoke AI agent |
| Tool Execution | Execute MCP tools with user isolation |
| Response Formatting | Return consistent JSON responses |
| Error Handling | Catch errors, return safe messages |

### Agent Responsibilities

| Concern | Responsibility |
|---------|----------------|
| Intent Recognition | Understand what user wants to do |
| Tool Selection | Choose appropriate MCP tool(s) |
| Parameter Extraction | Extract task titles, IDs from natural language |
| Response Generation | Create friendly, confirming responses |
| Error Explanation | Provide helpful messages for failures |

### MCP Tool Responsibilities

| Concern | Responsibility |
|---------|----------------|
| Input Validation | Validate all parameters |
| User Isolation | Filter all queries by user_id |
| Database Operations | Execute CRUD against PostgreSQL |
| Output Standardization | Return { status, message, data } format |
| Error Normalization | Return consistent error responses |

### Database Responsibilities

| Concern | Responsibility |
|---------|----------------|
| Data Persistence | Store all state durably |
| Referential Integrity | Enforce foreign keys |
| Query Optimization | Provide indexed access paths |
| Concurrent Access | Handle multiple simultaneous requests |
