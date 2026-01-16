# MCP Tools for Todo AI Chatbot

This document describes the Model Context Protocol (MCP) tools available for the Todo AI Chatbot.

## Overview

The MCP tools provide AI agents with reliable, type-safe interfaces to task management operations. All tools follow consistent patterns for user isolation, input validation, error handling, and response formatting.

## Tool Files

- **`backend/app/mcp_tools.py`** - MCP tool implementations
- **`backend/test_mcp_tools.py`** - Comprehensive test suite

## Response Format

All tools return a consistent JSON structure:

```json
{
  "status": "success" | "error",
  "message": "Human-readable description of what happened",
  "data": <relevant data or null>
}
```

## Available Tools

### 1. add_task

Creates a new todo task for the specified user.

**Function Signature:**
```python
async def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]
```

**Parameters:**
- `user_id` (string, required) - The authenticated user's ID for user isolation
- `title` (string, required) - Task title (1-200 characters)
- `description` (string, optional) - Task description (max 1000 characters)
- `due_date` (string, optional) - Due date in YYYY-MM-DD format

**Behavior:**
- Validates all inputs (length, format, required fields)
- Associates task with user_id
- Sets `completed` to `false` for new tasks
- Auto-generates `created_at` and `updated_at` timestamps (UTC)

**Success Response Example:**
```json
{
  "status": "success",
  "message": "Task created successfully",
  "data": {
    "id": 47,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2025-01-16T19:30:00Z",
    "updated_at": "2025-01-16T19:30:00Z"
  }
}
```

**Error Response Examples:**
```json
{
  "status": "error",
  "message": "title is required and cannot be empty",
  "data": null
}
```

```json
{
  "status": "error",
  "message": "title exceeds maximum length of 200 characters (got 250)",
  "data": null
}
```

```json
{
  "status": "error",
  "message": "due_date must be in YYYY-MM-DD format (got '2025/01/16')",
  "data": null
}
```

---

### 2. list_tasks

Returns a list of tasks for the specified user with optional filtering and sorting.

**Function Signature:**
```python
async def list_tasks(
    user_id: str,
    status: Literal["all", "pending", "completed"] = "all",
    limit: int = 50,
    offset: int = 0,
    sort_by: Optional[Literal["created_at", "title", "due_date"]] = None,
    sort_order: Literal["asc", "desc"] = "desc"
) -> Dict[str, Any]
```

**Parameters:**
- `user_id` (string, required) - The authenticated user's ID
- `status` (string, optional) - Filter by completion status: "all", "pending", or "completed" (default: "all")
- `limit` (integer, optional) - Maximum number of tasks to return (default: 50)
- `offset` (integer, optional) - Number of tasks to skip for pagination (default: 0)
- `sort_by` (string, optional) - Field to sort by: "created_at", "title", or "due_date" (default: "created_at")
- `sort_order` (string, optional) - Sort order: "asc" or "desc" (default: "desc")

**Behavior:**
- Filters tasks by user_id for isolation
- Applies status filter (all/pending/completed)
- Supports pagination with limit and offset
- Returns total count and number of tasks returned

**Success Response Example:**
```json
{
  "status": "success",
  "message": "Found 8 pending tasks",
  "data": {
    "tasks": [
      {
        "id": 47,
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "completed": false,
        "created_at": "2025-01-16T19:30:00Z",
        "updated_at": "2025-01-16T19:30:00Z"
      },
      {
        "id": 48,
        "title": "Write report",
        "description": null,
        "completed": false,
        "created_at": "2025-01-16T18:00:00Z",
        "updated_at": "2025-01-16T18:00:00Z"
      }
    ],
    "total": 12,
    "returned": 8
  }
}
```

**Error Response Examples:**
```json
{
  "status": "error",
  "message": "status must be 'all', 'pending', or 'completed' (got 'invalid')",
  "data": null
}
```

```json
{
  "status": "error",
  "message": "limit must be at least 1 (got 0)",
  "data": null
}
```

---

### 3. toggle_task_completion

Toggles the completion status of a task.

**Function Signature:**
```python
async def toggle_task_completion(
    user_id: str,
    task_id: int
) -> Dict[str, Any]
```

**Parameters:**
- `user_id` (string, required) - The authenticated user's ID
- `task_id` (integer, required) - The ID of the task to toggle

**Behavior:**
- Verifies task belongs to user (returns error if not found or wrong user)
- Toggles `completed` field (true ↔ false)
- Updates `updated_at` timestamp automatically
- Returns updated task information

**Success Response Examples:**
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

```json
{
  "status": "success",
  "message": "Task marked as pending",
  "data": {
    "task_id": 47,
    "title": "Buy groceries",
    "completed": false,
    "updated_at": "2025-01-16T19:50:00Z"
  }
}
```

**Error Response Examples:**
```json
{
  "status": "error",
  "message": "Task not found with id 999",
  "data": null
}
```

```json
{
  "status": "error",
  "message": "task_id must be a positive integer (got 0)",
  "data": null
}
```

---

### 4. delete_task

Permanently deletes a task.

**Function Signature:**
```python
async def delete_task(
    user_id: str,
    task_id: int
) -> Dict[str, Any]
```

**Parameters:**
- `user_id` (string, required) - The authenticated user's ID
- `task_id` (integer, required) - The ID of the task to delete

**Behavior:**
- Verifies task belongs to user (returns error if not found or wrong user)
- Permanently deletes the task from the database
- Returns information about the deleted task
- **Warning:** Deletion is permanent and cannot be undone

**Success Response Example:**
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

**Error Response Examples:**
```json
{
  "status": "error",
  "message": "Task not found with id 999",
  "data": null
}
```

```json
{
  "status": "error",
  "message": "task_id must be a positive integer (got -1)",
  "data": null
}
```

---

## Security Guarantees

All tools implement strict user isolation:

1. **User ID Validation**: Every tool requires `user_id` as the first parameter
2. **Database Filtering**: All queries filter by `user_id` to prevent cross-user access
3. **Authorization**: Tasks can only be accessed/modified by their owner
4. **Error Messages**: Never leak information about other users' tasks (returns "not found" instead of "unauthorized")

## Input Validation

All tools validate inputs before processing:

- **Required Fields**: Returns error if required parameters are missing or empty
- **Type Checking**: Validates parameter types (strings, integers, etc.)
- **Length Constraints**: Enforces max lengths (title: 200, description: 1000)
- **Format Validation**: Validates date formats (YYYY-MM-DD)
- **Range Checking**: Validates positive integers, non-negative offsets, etc.

## Error Handling

All tools implement comprehensive error handling:

- **Structured Errors**: All errors return consistent format with status="error"
- **Clear Messages**: Human-readable error messages describe the issue
- **No Exceptions**: All exceptions caught and converted to error responses
- **Null Data**: Error responses always have `data: null`

## Testing

Run the comprehensive test suite:

```bash
cd backend
pytest test_mcp_tools.py -v
```

**Test Coverage:**
- Input validation (empty values, invalid formats, length limits)
- Success cases for all operations
- Error cases (not found, wrong user, invalid parameters)
- User isolation (cross-user access prevention)
- Pagination and filtering
- Edge cases (toggle twice, delete verification)

## Usage Examples

### Example 1: Create and Complete a Task

```python
from app.mcp_tools import add_task, toggle_task_completion

# Create a task
result = await add_task(
    user_id="user_123",
    title="Buy groceries",
    description="Milk, eggs, bread"
)
print(result)
# {"status": "success", "message": "Task created successfully", "data": {...}}

task_id = result["data"]["id"]

# Mark it as completed
result = await toggle_task_completion(
    user_id="user_123",
    task_id=task_id
)
print(result)
# {"status": "success", "message": "Task marked as completed", "data": {...}}
```

### Example 2: List and Filter Tasks

```python
from app.mcp_tools import list_tasks

# Get all pending tasks
result = await list_tasks(
    user_id="user_123",
    status="pending",
    limit=10,
    sort_by="created_at",
    sort_order="desc"
)
print(f"Found {result['data']['total']} pending tasks")
for task in result['data']['tasks']:
    print(f"- {task['title']}")
```

### Example 3: Error Handling

```python
from app.mcp_tools import add_task

# Try to create task with empty title
result = await add_task(
    user_id="user_123",
    title=""
)

if result["status"] == "error":
    print(f"Error: {result['message']}")
    # Error: title is required and cannot be empty
else:
    print(f"Success: {result['message']}")
```

## Integration Notes

### Database Connection
- Tools use SQLModel Session with the global engine
- Automatic connection management (sessions opened and closed per operation)
- Thread-safe database access

### Timestamps
- All timestamps are stored in UTC
- Returned as ISO 8601 format strings (e.g., "2025-01-16T19:30:00Z")
- `created_at` and `updated_at` managed automatically

### Type Safety
- Type hints on all parameters and return values
- Literal types for enums (status, sort_by, sort_order)
- Optional parameters clearly marked

## Design Principles

1. **Reliability First**: Every tool must work correctly every time
2. **Predictable Behavior**: Consistent response format across all tools
3. **Clear Errors**: Human-readable error messages with context
4. **User Isolation**: Strict enforcement of data separation
5. **Input Validation**: Validate early, fail fast with clear messages
6. **Type Safety**: Full type hints for IDE support and runtime checking

## Future Enhancements

Potential additions to the MCP tools:

- `update_task`: Modify title/description of existing task
- `search_tasks`: Full-text search across titles and descriptions
- `get_task_stats`: Summary statistics (total, completed, pending)
- `bulk_operations`: Delete multiple tasks, mark multiple as complete
- `due_date` support in Task model (currently validated but not stored)

## Troubleshooting

**Issue: "Task not found" error when task exists**
- Verify the user_id matches the task owner
- Check that task_id is correct
- User isolation prevents accessing other users' tasks

**Issue: "user_id is required" error**
- Ensure user_id is not empty or None
- Check authentication is providing valid user_id

**Issue: Database connection errors**
- Verify DATABASE_URL in environment variables
- Check database is running and accessible
- Review database connection pooling settings

## Support

For issues or questions about the MCP tools:
1. Check the test suite for usage examples
2. Review error messages for validation issues
3. Verify user_id and authentication
4. Check database connectivity
