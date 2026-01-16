# MCP Server Specification

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## MCP Server Overview

The MCP (Model Context Protocol) server provides a standardized interface for the AI agent to interact with the Todo system. It acts as the ONLY authorized mechanism for task mutations.

## Server Responsibilities

| Responsibility | Description |
|----------------|-------------|
| Tool Registration | Expose available tools to the AI agent |
| Input Validation | Validate all tool parameters before execution |
| Authorization | Enforce user_id scoping on every operation |
| Database Interaction | Execute queries against PostgreSQL |
| Output Standardization | Return consistent response format |
| Error Normalization | Convert exceptions to safe error responses |

## Stateless Tool Execution Rules

### Statelessness Requirements

| Requirement | Description |
|-------------|-------------|
| No internal memory | Tools MUST NOT store state between invocations |
| No caching | Tool results MUST NOT be cached |
| Fresh data | Every query MUST fetch current data from DB |
| Isolated execution | Each tool call is independent |
| Idempotent reads | Read operations return consistent results |

### Execution Lifecycle

```
Tool Invocation
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Parse input parameters           │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. Validate required parameters     │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. Validate parameter types/formats │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. Verify user_id is provided       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 5. Execute database operation       │
│    (with user_id filter)            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 6. Format response                  │
└─────────────────────────────────────┘
    │
    ▼
Return { status, message, data }
```

## Validation & Authorization Guarantees

### Input Validation Rules

| Parameter Type | Validation |
|----------------|------------|
| user_id | MUST be non-empty string |
| task_id | MUST be positive integer |
| title | MUST be 1-200 characters, non-empty after trim |
| description | MUST be max 1000 characters if provided |
| due_date | MUST be YYYY-MM-DD format if provided |
| status | MUST be one of: "all", "pending", "completed" |
| limit | MUST be positive integer, default 50 |
| offset | MUST be non-negative integer, default 0 |
| sort_by | MUST be one of: "created_at", "title" |
| sort_order | MUST be one of: "asc", "desc" |
| keyword | MUST be non-empty string for search |

### Authorization Rules

| Rule | Enforcement |
|------|-------------|
| User isolation | Every query MUST include `WHERE user_id = :user_id` |
| No cross-user access | Tool MUST NOT accept user_id from request parameters |
| Ownership verification | Modify/delete operations MUST verify task belongs to user |
| User_id source | user_id MUST come from JWT token, never from client |

### Validation Failure Responses

| Validation Failure | Response |
|--------------------|----------|
| Missing user_id | { status: "error", message: "user_id is required" } |
| Missing required param | { status: "error", message: "[param] is required" } |
| Invalid type | { status: "error", message: "[param] must be [type]" } |
| Out of range | { status: "error", message: "[param] exceeds maximum of [max]" } |
| Invalid format | { status: "error", message: "[param] must be in [format] format" } |

## Error Normalization

### Error Categories

| Category | HTTP-like Code | Description |
|----------|----------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input parameters |
| NOT_FOUND | 404 | Task does not exist or not owned by user |
| UNAUTHORIZED | 401 | Missing or invalid user_id |
| FORBIDDEN | 403 | Task exists but not owned by user |
| INTERNAL_ERROR | 500 | Database or unexpected error |

### Error Response Format

All errors MUST return:

```json
{
  "status": "error",
  "message": "Human-readable error description",
  "data": null
}
```

### Error Message Rules

| Rule | Requirement |
|------|-------------|
| No stack traces | NEVER include technical stack traces |
| No SQL details | NEVER expose SQL queries or errors |
| User-safe language | Use non-technical language |
| Actionable | Include what user can do next |
| Consistent format | Always use the standard response format |

### Error Mapping

| Internal Error | User-Facing Message |
|----------------|---------------------|
| Task not found | "Task not found with id [id]" |
| Empty title | "title is required and cannot be empty" |
| Title too long | "title exceeds maximum length of 200 characters" |
| Invalid task_id | "task_id must be a positive integer" |
| DB connection error | "Failed to [action] task: service unavailable" |
| Unexpected error | "Failed to [action] task: please try again" |

## Database Interaction Boundaries

### Allowed Operations

| Tool | Allowed DB Operations |
|------|----------------------|
| add_task | INSERT into tasks |
| list_tasks | SELECT from tasks |
| toggle_task_completion | UPDATE tasks SET completed |
| delete_task | DELETE from tasks |
| search_tasks | SELECT from tasks with LIKE |
| get_my_user_info | SELECT from user |

### Query Constraints

| Constraint | Requirement |
|------------|-------------|
| User filter | ALL queries MUST include user_id filter |
| Single table | Each tool operates on ONE table only |
| No joins | Tools MUST NOT join across tables |
| No transactions | Each tool is atomic, no multi-statement transactions |
| Read-after-write | Mutations MUST return updated data |

### Connection Management

| Aspect | Requirement |
|--------|-------------|
| Connection source | Use shared SQLModel engine |
| Session scope | New session per tool invocation |
| Session cleanup | Session MUST be closed after operation |
| Error handling | Session MUST be rolled back on error |

## Standard Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Human-readable success description",
  "data": {
    // Tool-specific response data
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Human-readable error description",
  "data": null
}
```

### Response Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | YES | "success" or "error" |
| message | string | YES | Human-readable result description |
| data | object/null | YES | Tool-specific data or null on error |

## Tool Registration

### Tool Definition Format

Each tool MUST be registered with:

| Property | Description |
|----------|-------------|
| name | Unique tool identifier (snake_case) |
| description | Clear description for agent |
| parameters | JSON Schema defining inputs |
| handler | Async function implementing tool |

### Available Tools

| Tool Name | Description |
|-----------|-------------|
| add_task | Creates a new todo task |
| list_tasks | Returns list of user's tasks |
| toggle_task_completion | Toggles task completion status |
| delete_task | Permanently deletes a task |
| search_tasks | Searches tasks by keyword |
| get_my_user_info | Returns user account information |
