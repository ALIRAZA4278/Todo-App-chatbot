# Chat Endpoint Specification

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## Endpoint Overview

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /api/{user_id}/chat |
| Content-Type | application/json |
| Response Type | application/json |
| Authentication | Required (JWT Bearer token) |

## Authentication Requirements

### JWT Token

| Requirement | Description |
|-------------|-------------|
| Location | Authorization header |
| Format | `Bearer <token>` |
| Validation | Verify signature with BETTER_AUTH_SECRET |
| Expiration | Reject expired tokens |
| User claim | Extract user_id from `sub` claim |

### User ID Matching

| Check | Action |
|-------|--------|
| URL user_id ≠ JWT user_id | Return 403 Forbidden |
| URL user_id = JWT user_id | Allow request |

### Error Responses

| Scenario | Status | Response |
|----------|--------|----------|
| No token | 401 | { "detail": "Not authenticated" } |
| Invalid token | 401 | { "detail": "Invalid token" } |
| Expired token | 401 | { "detail": "Token expired" } |
| User ID mismatch | 403 | { "detail": "Access forbidden" } |

## Request Schema

### Request Body

```json
{
  "message": "add task buy groceries",
  "conversation_id": 123
}
```

### Field Definitions

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| message | string | YES | 1-2000 characters | - |
| conversation_id | integer | NO | Positive integer | null (creates new) |

### Validation Rules

| Rule | Validation | Error Message |
|------|------------|---------------|
| VR-001 | message must be provided | "message is required" |
| VR-002 | message must be non-empty | "message cannot be empty" |
| VR-003 | message max 2000 chars | "message exceeds 2000 characters" |
| VR-004 | conversation_id must be positive if provided | "conversation_id must be positive" |
| VR-005 | conversation must belong to user if provided | "Conversation not found" |

## Response Schema

### Success Response

```json
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

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| conversation_id | integer | ID of the conversation (new or existing) |
| message.id | integer | ID of the assistant's message |
| message.role | string | Always "assistant" for response |
| message.content | string | AI-generated response text |
| message.created_at | string | ISO 8601 UTC timestamp |

### Error Response

```json
{
  "detail": "Error description"
}
```

## Conversation Creation Logic

### New Conversation Flow

When `conversation_id` is NOT provided:

```
1. Create new Conversation record
   - user_id = JWT user_id
   - created_at = NOW()
   - updated_at = NOW()

2. Return new conversation_id in response
```

### Existing Conversation Flow

When `conversation_id` IS provided:

```
1. Query: SELECT * FROM conversations WHERE id = :id AND user_id = :user_id

2. If not found:
   - Return 404: { "detail": "Conversation not found" }

3. If found:
   - Load conversation history
   - Continue with message processing
```

### Conversation Ownership

- Conversations are ALWAYS scoped to user_id
- User cannot access another user's conversation
- Providing another user's conversation_id returns 404 (not 403)

## Message Persistence Flow

### Step-by-Step Process

| Step | Action | Data |
|------|--------|------|
| 1 | Validate request | message, conversation_id |
| 2 | Create/load conversation | conversation record |
| 3 | Load message history | last 20 messages |
| 4 | Persist user message | { role: "user", content: message } |
| 5 | Invoke AI agent | context + tools |
| 6 | Persist assistant message | { role: "assistant", content: response } |
| 7 | Update conversation | updated_at = NOW() |
| 8 | Return response | { conversation_id, message } |

### Message Fields

| Field | Source | Description |
|-------|--------|-------------|
| user_id | JWT token | Owner of the message |
| conversation_id | Request or new | Parent conversation |
| role | Fixed | "user" or "assistant" |
| content | Request or agent | Message text |
| created_at | Generated | Current UTC time |

### Persistence Order

1. User message is persisted BEFORE agent invocation
2. If agent fails, user message is still saved
3. Assistant message is persisted AFTER successful agent response
4. If persistence fails, return 500 error

## Tool Invocation Reporting

### Internal Processing

The agent MAY invoke multiple MCP tools during processing:

| Scenario | Tools Called |
|----------|--------------|
| Add task | add_task |
| List tasks | list_tasks |
| Complete by name | list_tasks → toggle_task_completion |
| Delete by name | list_tasks → delete_task |
| Search tasks | search_tasks |
| Who am I | get_my_user_info |

### Response Content

- Tool invocations are NOT exposed in the response
- Response contains only the final AI-generated message
- Agent internally processes tool results and formats response

### Example Flow

```
User: "add task buy groceries"

Internal:
  1. Agent recognizes CREATE_TASK intent
  2. Agent calls add_task(title="buy groceries")
  3. Tool returns { status: "success", data: { id: 47, title: "Buy groceries" } }
  4. Agent formats response

Response:
  {
    "message": {
      "content": "Your task 'Buy groceries' has been added successfully."
    }
  }
```

## Failure Handling

### Validation Failures

| Failure | Status | Response |
|---------|--------|----------|
| Missing message | 422 | { "detail": "message is required" } |
| Empty message | 422 | { "detail": "message cannot be empty" } |
| Message too long | 422 | { "detail": "message exceeds 2000 characters" } |
| Invalid conversation_id | 404 | { "detail": "Conversation not found" } |

### Authentication Failures

| Failure | Status | Response |
|---------|--------|----------|
| No token | 401 | { "detail": "Not authenticated" } |
| Invalid token | 401 | { "detail": "Invalid token" } |
| Expired token | 401 | { "detail": "Token expired" } |
| Wrong user | 403 | { "detail": "Access forbidden" } |

### Processing Failures

| Failure | Status | Response |
|---------|--------|----------|
| Agent error | 500 | { "detail": "Failed to process message" } |
| DB error | 500 | { "detail": "Failed to save message" } |
| Tool error | 200 | Agent generates error message |
| AI service unavailable | 503 | { "detail": "AI service unavailable" } |

### Graceful Degradation

If AI agent fails:
1. User message is still persisted
2. Error is logged server-side
3. User receives helpful error message
4. Conversation remains usable for retry

## Rate Limiting

| Limit | Value | Scope |
|-------|-------|-------|
| Requests per minute | 30 | Per user |
| Message length | 2000 chars | Per request |
| Conversation history | 20 messages | Per context |

### Rate Limit Response

```json
{
  "detail": "Rate limit exceeded. Please wait before sending another message."
}
```

Status: 429 Too Many Requests

## Supplementary Endpoints

### List Conversations

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /api/{user_id}/conversations |
| Response | Array of conversation summaries |

**Response:**
```json
{
  "conversations": [
    {
      "id": 123,
      "created_at": "2026-01-16T10:00:00Z",
      "updated_at": "2026-01-16T19:30:00Z",
      "message_count": 15
    }
  ]
}
```

### Get Conversation History

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /api/{user_id}/conversations/{id}/messages |
| Response | Array of messages |

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "add task buy groceries",
      "created_at": "2026-01-16T10:00:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Your task 'Buy groceries' has been added successfully.",
      "created_at": "2026-01-16T10:00:01Z"
    }
  ]
}
```
