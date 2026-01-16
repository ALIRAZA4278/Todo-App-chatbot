# MCP Server Setup Agent

Use this agent when you need to set up, configure, or extend MCP (Model Context Protocol) server tools for AI chatbots. This includes creating tool definitions, registering tools with OpenAI Assistants, and wiring tools to backend database operations.

## Tools Available
- All tools (Read, Write, Edit, Bash, Glob, Grep, Task, etc.)

## Trigger Phrases
- "set up MCP server"
- "configure MCP tools"
- "register tools with assistant"
- "wire chatbot tools to database"
- "add new MCP tool"

## MCP Tool Standard Format

Each MCP tool MUST follow this response format:

```json
{
  "status": "success" | "error",
  "message": "Human-readable description",
  "data": <relevant data or null>
}
```

## Available Tools in This Project

### 1. add_task (green)
Creates a new todo task for the current user.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | The main title of the task (max 200 chars) |
| description | string | No | Additional details (max 1000 chars) |
| due_date | string | No | Due date in YYYY-MM-DD format |

**Behavior:**
- Always associates task with current authenticated user (user_id from JWT)
- Sets completed = false by default
- Automatically sets created_at & updated_at
- Returns newly created task with its id

**Success Response:**
```json
{
  "status": "success",
  "message": "Task created successfully",
  "data": {
    "id": 47,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2025-01-16T19:30:00Z"
  }
}
```

**Error Cases:**
- Title missing or empty → 400
- Title > 200 chars → 400
- Invalid date format → 400
- Database error → 500 with safe message

---

### 2. list_tasks (blue)
Returns list of current user's tasks with optional filtering.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| status | string | No | "all" | "all" \| "pending" \| "completed" |
| limit | integer | No | 50 | max number of tasks to return |
| offset | integer | No | 0 | skip this many tasks |
| sort_by | string | No | "created_at" | "created_at" \| "title" \| "due_date" |
| sort_order | string | No | "desc" | "asc" \| "desc" |

**Behavior:**
- ALWAYS filter by current user_id
- Returns clean, minimal task objects
- Supports pagination & sorting

**Success Response:**
```json
{
  "status": "success",
  "message": "Found 8 pending tasks",
  "data": {
    "tasks": [
      {"id": 42, "title": "Call mom", "completed": false, "due_date": null}
    ],
    "total": 12,
    "returned": 8
  }
}
```

---

### 3. toggle_task_completion (purple)
Toggles (flip) the completion status of a specific task.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | integer | Yes | ID of the task to toggle |

**Behavior:**
- Finds task by id + current user_id
- Flips completed boolean (true ↔ false)
- Updates updated_at timestamp
- Returns current state after toggle

**Success Response:**
```json
{
  "status": "success",
  "message": "Task marked as completed",
  "data": {
    "task_id": 47,
    "title": "Buy groceries",
    "completed": true,
    "updated_at": "2025-01-16T19:45:00Z"
  }
}
```

**Security:**
- If task not found or belongs to another user → return clear error
- Never silently fail

---

### 4. delete_task (red)
Permanently deletes a task (with confirmation step recommended in prompt).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | integer | Yes | ID of the task to delete |

**Behavior:**
- Verifies ownership (task.user_id == current_user.id)
- Deletes the record
- Returns confirmation with task title that was deleted

**Success Response:**
```json
{
  "status": "success",
  "message": "Task 'Buy groceries' has been deleted",
  "data": {
    "deleted_task_id": 47,
    "deleted_title": "Buy groceries"
  }
}
```

**Security:**
- Must NEVER delete without correct ownership check
- Return 404-style message if not found or not owned

---

### 5. get_my_user_info (teal)
Returns basic information about the currently logged-in user.

**Parameters:** None (uses user_id from JWT)

**Behavior:**
- Uses current authenticated user from JWT/session
- Returns safe, non-sensitive information only
- NEVER returns password, tokens, or sensitive fields

**Success Response:**
```json
{
  "status": "success",
  "message": "Here is your account information",
  "data": {
    "id": "user_abc123",
    "email": "ali@example.com",
    "name": "ALI",
    "created_at": "2024-11-05T14:20:00Z"
  }
}
```

**Use Cases:**
- "who am i"
- "my email kya hai"
- "meri account info dikhao"
- "what's my email"

---

### 6. search_tasks (cyan)
Search through user's tasks by keyword in title or description.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| keyword | string | Yes | - | Search term |
| status | string | No | "all" | "all" \| "pending" \| "completed" |

**Behavior:**
- Case-insensitive search in title AND description
- Only returns current user's tasks (user isolation enforced)
- Results ordered by creation date (newest first)

**Success Response:**
```json
{
  "status": "success",
  "message": "Found 3 tasks matching 'groceries'",
  "data": {
    "tasks": [
      {"id": 42, "title": "Buy groceries", "description": "Milk, eggs", "completed": false}
    ],
    "search_term": "groceries",
    "total": 3
  }
}
```

---

## Implementation Location

All MCP tools are implemented in:
```
backend/app/mcp_tools.py
```

## OpenAI Assistant Tool Definitions

When registering these tools with an OpenAI Assistant, use the following function definitions:

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Creates a new todo task for the current user",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The main title of the task (max 200 chars)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Additional details (max 1000 chars)"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Due date in YYYY-MM-DD format"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Returns list of current user's tasks with optional filtering",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter by completion status (default: all)"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max number of tasks to return (default: 50)"
                    },
                    "offset": {
                        "type": "integer",
                        "description": "Number of tasks to skip (default: 0)"
                    },
                    "sort_by": {
                        "type": "string",
                        "enum": ["created_at", "title", "due_date"],
                        "description": "Field to sort by (default: created_at)"
                    },
                    "sort_order": {
                        "type": "string",
                        "enum": ["asc", "desc"],
                        "description": "Sort order (default: desc)"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "toggle_task_completion",
            "description": "Toggles the completion status of a specific task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "ID of the task to toggle"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Permanently deletes a task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "ID of the task to delete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_user_info",
            "description": "Returns basic information about the currently logged-in user (email, name, created_at). Useful when user asks 'who am i', 'my email kya hai', or 'meri account info dikhao'",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_tasks",
            "description": "Search through user's tasks by keyword in title or description. Case-insensitive.",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string",
                        "description": "Search term to find in task titles and descriptions"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter by completion status (default: all)"
                    }
                },
                "required": ["keyword"]
            }
        }
    }
]
```

## Usage in Chat Endpoint

To use these tools in the chat endpoint:

```python
from app.mcp_tools import (
    add_task,
    list_tasks,
    toggle_task_completion,
    delete_task,
    get_my_user_info,
    search_tasks
)

# Map tool names to functions
TOOL_HANDLERS = {
    "add_task": add_task,
    "list_tasks": list_tasks,
    "toggle_task_completion": toggle_task_completion,
    "delete_task": delete_task,
    "get_my_user_info": get_my_user_info,
    "search_tasks": search_tasks,
}

# Execute tool call
async def execute_tool(tool_name: str, arguments: dict, user_id: str) -> dict:
    handler = TOOL_HANDLERS.get(tool_name)
    if not handler:
        return {"status": "error", "message": f"Unknown tool: {tool_name}", "data": None}

    # Inject user_id for security
    return await handler(user_id=user_id, **arguments)
```

## Security Principles

1. **User Isolation**: All tools require `user_id` parameter - NEVER trust client-provided user IDs
2. **Ownership Verification**: Every query includes `WHERE user_id = :user_id`
3. **Input Validation**: All parameters validated before database operations
4. **Safe Errors**: Never expose internal errors to users
