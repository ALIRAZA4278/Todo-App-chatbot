# Error Handling Specification

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## Error Handling Philosophy

All errors MUST be:
1. **User-friendly**: No technical jargon
2. **Actionable**: Suggest what user can do
3. **Safe**: Never expose system internals
4. **Consistent**: Same format everywhere

## Standard Error Response Format

### API Error Response

```json
{
  "detail": "Human-readable error description"
}
```

### MCP Tool Error Response

```json
{
  "status": "error",
  "message": "Human-readable error description",
  "data": null
}
```

### Frontend Error Display

```
┌─────────────────────────────────────┐
│ ⚠️ [Error message]                  │
│ [Retry button or suggestion]        │
└─────────────────────────────────────┘
```

## Error Categories

### HTTP Status Codes

| Code | Category | Usage |
|------|----------|-------|
| 400 | Bad Request | Invalid input format |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User ID mismatch |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Invalid field values |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Server-side failure |
| 503 | Service Unavailable | AI service down |

### Error Types

| Type | Description | Recovery |
|------|-------------|----------|
| VALIDATION | Invalid user input | Fix input and retry |
| AUTH | Authentication issue | Sign in again |
| NOT_FOUND | Resource missing | Check ID or name |
| RATE_LIMIT | Too many requests | Wait and retry |
| AI_ERROR | Agent failure | Retry request |
| DB_ERROR | Database issue | Retry later |
| NETWORK | Connection issue | Check connection |

## AI-Friendly Error Messaging

### Agent Error Interpretation

When a tool returns an error, the agent MUST:

1. NOT expose the raw error message
2. Translate to user-friendly language
3. Suggest a helpful next action

### Error Message Mapping

| Tool Error | Agent Response |
|------------|----------------|
| "Task not found with id X" | "I couldn't find that task. Would you like me to show your list?" |
| "title is required" | "What would you like to call the task?" |
| "title exceeds maximum length" | "That title is a bit long. Could you shorten it?" |
| "Invalid task_id" | "I need a valid task number. Which task did you mean?" |
| "Database error" | "I'm having trouble right now. Could you try again in a moment?" |
| "User not found" | "I couldn't find your account information." |

### Contextual Suggestions

| Error Context | Suggestion |
|---------------|------------|
| Task not found (by name) | "Would you like me to show your tasks?" |
| Task not found (by ID) | "That task number doesn't exist. Try 'show my tasks' to see the list." |
| Multiple tasks match | "I found several tasks with that name. Which one?" |
| Empty task list | "You don't have any tasks yet. Try 'add task [name]' to create one!" |

## Tool Error Surfacing Rules

### Error Visibility

| Error Type | Visible to User | Agent Handles |
|------------|-----------------|---------------|
| Validation | YES (via agent) | YES |
| Not found | YES (via agent) | YES |
| Auth (tool level) | NO | Agent can't proceed |
| Database | YES (generic) | YES |
| Internal | YES (generic) | YES |

### Error Response Flow

```
Tool Error
    │
    ▼
┌─────────────────────────────────────┐
│ Is this a user-fixable error?       │
│ (validation, not found, etc.)       │
└─────────────────────────────────────┘
    │                    │
   YES                   NO
    │                    │
    ▼                    ▼
┌───────────────┐  ┌─────────────────────────┐
│ Agent explains│  │ Agent apologizes and    │
│ and suggests  │  │ suggests retry          │
│ correction    │  │                         │
└───────────────┘  └─────────────────────────┘
```

### Error Aggregation

When multiple tools fail in a chain:

1. Report the first actionable error
2. Don't expose the chain of failures
3. Suggest the most helpful next step

## User-Safe Explanations

### Language Guidelines

| Avoid | Use Instead |
|-------|-------------|
| "Database error" | "I'm having trouble saving that right now" |
| "500 Internal Server Error" | "Something went wrong on my end" |
| "Invalid JSON payload" | "I didn't understand that. Could you try again?" |
| "SQL constraint violation" | "That task already exists" |
| "Token expired" | "Please sign in again" |
| "Rate limit exceeded" | "You're sending messages too quickly. Please wait a moment." |

### Tone Guidelines

| Principle | Example |
|-----------|---------|
| Be apologetic for errors | "Sorry, I couldn't..." |
| Be helpful | "Would you like me to..." |
| Be concise | One sentence + suggestion |
| Be honest | "I don't know" not "Let me check" |
| Never blame user | "I didn't find..." not "You gave wrong ID" |

## Specific Error Scenarios

### Authentication Errors

| Scenario | User Message | Action |
|----------|--------------|--------|
| No token | "Please sign in to continue." | Redirect to sign in |
| Invalid token | "Please sign in again." | Redirect to sign in |
| Expired token | "Your session has expired. Please sign in again." | Redirect to sign in |
| Wrong user | "I can't access that. Please check your account." | Clear error |

### Validation Errors

| Scenario | User Message |
|----------|--------------|
| Empty title | "What would you like to call the task?" |
| Title too long | "That title is too long (max 200 characters). Could you shorten it?" |
| Invalid date | "I need the date in YYYY-MM-DD format." |
| Invalid task ID | "That doesn't look like a valid task number." |

### Not Found Errors

| Scenario | User Message |
|----------|--------------|
| Task by ID | "I couldn't find task #X. Would you like to see your list?" |
| Task by name | "I couldn't find a task called 'X'. Did you mean one of these?" |
| Conversation | "That conversation doesn't exist." |

### Server Errors

| Scenario | User Message |
|----------|--------------|
| Database down | "I'm having trouble connecting. Please try again in a moment." |
| AI service down | "I'm temporarily unavailable. Please try again shortly." |
| Unknown error | "Something went wrong. Please try again." |

### Network Errors (Frontend)

| Scenario | User Message |
|----------|--------------|
| Offline | "You appear to be offline. Please check your connection." |
| Timeout | "The request took too long. Please try again." |
| Connection refused | "I can't reach the server. Please try again later." |

## Error Recovery Patterns

### Retry Logic

| Error Type | Retry Strategy |
|------------|----------------|
| Network timeout | Auto-retry once, then show button |
| Server 500 | Show retry button |
| Rate limit | Show countdown timer |
| Validation | No retry, fix input |
| Not found | No retry, different action |

### Graceful Degradation

| Failure | Degraded Behavior |
|---------|-------------------|
| AI service down | Show "AI unavailable" message |
| History load fails | Start fresh conversation |
| Message save fails | Show "failed to save" indicator |

### Error Logging

| Error Type | Log Level | Data Logged |
|------------|-----------|-------------|
| Validation | DEBUG | Field, value type |
| Auth | WARN | User ID (hashed) |
| Not found | DEBUG | Resource type, ID |
| Server error | ERROR | Error type, stack (server only) |
| AI error | ERROR | Error type, request ID |

## Error Response Examples

### Validation Error (API)

```json
{
  "detail": "message is required"
}
```

Status: 422

### Not Found Error (API)

```json
{
  "detail": "Conversation not found"
}
```

Status: 404

### Rate Limit Error (API)

```json
{
  "detail": "Rate limit exceeded. Please wait before sending another message."
}
```

Status: 429

### Server Error (API)

```json
{
  "detail": "An unexpected error occurred. Please try again."
}
```

Status: 500

### Tool Error (MCP)

```json
{
  "status": "error",
  "message": "Task not found with id 99",
  "data": null
}
```

### Agent Response (to user)

"I couldn't find task #99. Would you like me to show your current tasks?"
