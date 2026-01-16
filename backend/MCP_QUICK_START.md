# MCP Tools Quick Start Guide

## What are MCP Tools?

MCP (Model Context Protocol) tools are type-safe, reliable functions that AI agents can call to manage todo tasks. They provide a consistent interface with guaranteed user isolation, input validation, and error handling.

## Installation

No additional installation required. The tools are part of the backend application.

**Files:**
- `backend/app/mcp_tools.py` - Main implementation

## Basic Usage

### 1. Import the tools

```python
from app.mcp_tools import add_task, list_tasks, toggle_task_completion, delete_task
```

### 2. Create a task

```python
result = await add_task(
    user_id="user_123",
    title="Buy groceries",
    description="Milk, eggs, bread"
)

if result["status"] == "success":
    print(f"Created task {result['data']['id']}")
    # Created task 47
else:
    print(f"Error: {result['message']}")
```

### 3. List tasks

```python
# Get all pending tasks
result = await list_tasks(
    user_id="user_123",
    status="pending"
)

for task in result["data"]["tasks"]:
    print(f"- {task['title']}")
```

### 4. Toggle completion

```python
result = await toggle_task_completion(
    user_id="user_123",
    task_id=47
)

print(result["message"])
# "Task marked as completed"
```

### 5. Delete a task

```python
result = await delete_task(
    user_id="user_123",
    task_id=47
)

print(result["message"])
# "Task 'Buy groceries' has been deleted"
```

## Response Format

All tools return the same structure:

```json
{
  "status": "success" | "error",
  "message": "Human-readable description",
  "data": <relevant data or null>
}
```

### Success Response Example

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

### Error Response Example

```json
{
  "status": "error",
  "message": "Task not found with id 999",
  "data": null
}
```

## Error Handling Pattern

Always check the status field:

```python
result = await add_task(user_id="user_123", title="")

if result["status"] == "error":
    # Handle error
    print(f"Error: {result['message']}")
    return

# Process success
task_id = result["data"]["id"]
```

## Common Use Cases

### Workflow 1: Create and Complete a Task

```python
# Create
result = await add_task(
    user_id="user_123",
    title="Review PR #42"
)
task_id = result["data"]["id"]

# ... do the work ...

# Mark complete
await toggle_task_completion(
    user_id="user_123",
    task_id=task_id
)
```

### Workflow 2: Paginated Task List

```python
# Get first page (10 tasks)
page1 = await list_tasks(
    user_id="user_123",
    limit=10,
    offset=0,
    sort_by="created_at",
    sort_order="desc"
)

# Get second page
page2 = await list_tasks(
    user_id="user_123",
    limit=10,
    offset=10
)

total = page1["data"]["total"]
print(f"Total tasks: {total}")
```

### Workflow 3: Filter and Process

```python
# Get all pending tasks
result = await list_tasks(
    user_id="user_123",
    status="pending"
)

# Process each
for task in result["data"]["tasks"]:
    print(f"TODO: {task['title']}")

    # Mark as complete when done
    await toggle_task_completion(
        user_id="user_123",
        task_id=task["id"]
    )
```

## Validation Rules

### add_task

- `user_id`: Required, non-empty
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `due_date`: Optional, YYYY-MM-DD format

### list_tasks

- `user_id`: Required, non-empty
- `status`: "all" | "pending" | "completed"
- `limit`: Positive integer
- `offset`: Non-negative integer
- `sort_by`: "created_at" | "title" | "due_date"
- `sort_order`: "asc" | "desc"

### toggle_task_completion

- `user_id`: Required, non-empty
- `task_id`: Positive integer

### delete_task

- `user_id`: Required, non-empty
- `task_id`: Positive integer

## Security

All tools enforce user isolation:

1. Every tool requires `user_id`
2. Database queries filtered by `user_id`
3. Users can only access their own tasks
4. Returns "not found" for unauthorized access

## Testing

Run the example script:

```bash
cd backend
python mcp_tools_example.py
```

Run the test suite:

```bash
cd backend
pytest test_mcp_tools.py -v
```

Run validation:

```bash
cd backend
python static_validation.py
```

## Common Errors

### "user_id is required and cannot be empty"
**Cause:** Missing or empty user_id parameter
**Fix:** Ensure user_id is provided and not an empty string

### "Task not found with id X"
**Cause:** Task doesn't exist OR belongs to different user
**Fix:** Verify task_id is correct and belongs to the user

### "title exceeds maximum length of 200 characters"
**Cause:** Title is too long
**Fix:** Shorten title to 200 characters or less

### "status must be 'all', 'pending', or 'completed'"
**Cause:** Invalid status parameter
**Fix:** Use one of the three allowed values

## Full Documentation

For complete documentation, see:
- `MCP_TOOLS_README.md` - Detailed API reference
- `MCP_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `mcp_tools_example.py` - Comprehensive examples

## Support

For issues or questions:
1. Check error messages for validation details
2. Review examples in `mcp_tools_example.py`
3. Run `static_validation.py` to verify installation
4. Check `MCP_TOOLS_README.md` for detailed docs
