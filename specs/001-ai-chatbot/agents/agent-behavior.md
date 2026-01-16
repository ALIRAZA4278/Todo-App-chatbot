# Agent Behavior Specification

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## Natural Language Intent Interpretation

### Intent Categories

| Intent ID | Intent Name | Description |
|-----------|-------------|-------------|
| INT-001 | CREATE_TASK | User wants to add a new task |
| INT-002 | LIST_ALL | User wants to see all tasks |
| INT-003 | LIST_PENDING | User wants to see incomplete tasks |
| INT-004 | LIST_COMPLETED | User wants to see finished tasks |
| INT-005 | COMPLETE_TASK | User wants to mark task as done |
| INT-006 | UNCOMPLETE_TASK | User wants to mark task as not done |
| INT-007 | DELETE_TASK | User wants to remove a task |
| INT-008 | SEARCH_TASKS | User wants to find tasks by keyword |
| INT-009 | USER_IDENTITY | User wants to know their account info |
| INT-010 | HELP | User wants to know what agent can do |
| INT-011 | GREETING | User says hello/hi |
| INT-012 | UNCLEAR | Intent cannot be determined |

### Intent Recognition Patterns

#### INT-001: CREATE_TASK

| Pattern Type | Examples |
|--------------|----------|
| Explicit add | "add task", "create task", "new task", "add todo" |
| Reminder style | "remind me to", "don't let me forget to" |
| Implicit add | "I need to [action]", "I have to [action]" |
| Urdu/English | "task add karo", "todo banana hai" |

**Extraction**: Title is extracted from text following the trigger phrase.

#### INT-002: LIST_ALL

| Pattern Type | Examples |
|--------------|----------|
| Show commands | "show my tasks", "show tasks", "show all tasks" |
| List commands | "list tasks", "list my todos", "list everything" |
| Question style | "what are my tasks", "what do I have to do" |
| Urdu/English | "tasks dikhao", "meri list dikhao" |

#### INT-003: LIST_PENDING

| Pattern Type | Examples |
|--------------|----------|
| Pending keywords | "pending tasks", "incomplete tasks", "unfinished" |
| Negation style | "tasks not done", "what's not complete" |
| Question style | "what's left", "what haven't I done" |
| Urdu/English | "jo abhi baqi hain", "pending dikhao" |

#### INT-004: LIST_COMPLETED

| Pattern Type | Examples |
|--------------|----------|
| Completed keywords | "completed tasks", "finished tasks", "done tasks" |
| Past tense | "what did I finish", "what have I completed" |
| Urdu/English | "jo complete ho gaye", "done wale dikhao" |

#### INT-005: COMPLETE_TASK

| Pattern Type | Examples |
|--------------|----------|
| Mark as done | "mark [task] as done", "mark [task] complete" |
| Complete verb | "complete [task]", "finish [task]" |
| Done statement | "[task] is done", "done with [task]" |
| By ID | "complete task 5", "mark task #7 done" |
| Urdu/English | "[task] complete karo", "ye ho gaya" |

#### INT-006: UNCOMPLETE_TASK

| Pattern Type | Examples |
|--------------|----------|
| Mark as not done | "mark [task] as not done", "unmark [task]" |
| Undo complete | "undo [task]", "uncomplete [task]" |
| Reopen | "reopen [task]", "[task] is not done actually" |

#### INT-007: DELETE_TASK

| Pattern Type | Examples |
|--------------|----------|
| Delete verb | "delete [task]", "remove [task]" |
| Cancel style | "cancel [task]", "forget [task]" |
| By ID | "delete task 5", "remove task #7" |
| Urdu/English | "[task] delete karo", "hata do" |

#### INT-008: SEARCH_TASKS

| Pattern Type | Examples |
|--------------|----------|
| Search verb | "search for [keyword]", "find [keyword]" |
| Question style | "do I have any [keyword] tasks" |
| Look for | "look for [keyword]", "any tasks about [keyword]" |

#### INT-009: USER_IDENTITY

| Pattern Type | Examples |
|--------------|----------|
| Who am I | "who am I", "what's my email" |
| Account info | "my account", "my profile" |
| Urdu/English | "meri email kya hai", "main kaun hoon" |

## Mapping Intents to MCP Tools

| Intent | Tool | Parameters |
|--------|------|------------|
| INT-001 | add_task | title (required), description (optional) |
| INT-002 | list_tasks | status="all" |
| INT-003 | list_tasks | status="pending" |
| INT-004 | list_tasks | status="completed" |
| INT-005 | toggle_task_completion | task_id |
| INT-006 | toggle_task_completion | task_id |
| INT-007 | delete_task | task_id |
| INT-008 | search_tasks | keyword, status (optional) |
| INT-009 | get_my_user_info | (none) |
| INT-010 | (no tool) | Respond with capabilities |
| INT-011 | (no tool) | Respond with greeting |
| INT-012 | (no tool) | Ask for clarification |

## Handling Ambiguous Commands

### Ambiguity Types

| Type | Description | Resolution Strategy |
|------|-------------|---------------------|
| Task Reference | Multiple tasks match user's description | Present options and ask |
| Action Unclear | Can't determine intended action | Ask what they want to do |
| Missing Info | Required parameter not provided | Ask for specific info |
| Conflicting | Request contradicts itself | Clarify intent |

### Ambiguous Task Reference Resolution

When user references a task by name and multiple matches exist:

1. Call `list_tasks` or `search_tasks` to find matches
2. If exactly 1 match: Proceed with that task
3. If 2-5 matches: Present numbered list and ask user to choose
4. If 6+ matches: Ask user to be more specific
5. If 0 matches: Inform user and offer to show list

**Example Response**:
```
I found 3 tasks with 'meeting':
1. Team meeting prep
2. Client meeting notes
3. Meeting room booking

Which one did you mean? (Reply with the number)
```

### Missing Information Resolution

| Missing Info | Agent Response |
|--------------|----------------|
| Task title | "What would you like to call the task?" |
| Which task | "Which task do you want to [action]?" |
| Confirm delete | "Are you sure you want to delete '[task]'?" |

## Task Lookup by ID and by Title

### Lookup by ID

When user provides a numeric reference:

| Pattern | Interpretation |
|---------|----------------|
| "task 5" | task_id = 5 |
| "task #5" | task_id = 5 |
| "number 5" | task_id = 5 |
| "#5" | task_id = 5 |
| "the 5th task" | task_id = 5 |

**Process**:
1. Extract numeric ID from message
2. Call tool directly with task_id
3. If tool returns "not found", inform user

### Lookup by Title

When user provides a text reference:

| Pattern | Interpretation |
|---------|----------------|
| "buy groceries" | Search for task with this title |
| "the groceries task" | Search for "groceries" |
| "my meeting task" | Search for "meeting" |

**Process**:
1. Extract likely title/keyword from message
2. Call `list_tasks` to get all user's tasks
3. Filter tasks where title contains the keyword (case-insensitive)
4. If 1 match: Use that task's ID
5. If multiple matches: Ask user to clarify
6. If no matches: Inform user and offer alternatives

## User Identity Awareness

### User Context Injection

The agent receives user context with every request:

| Context Field | Source | Usage |
|---------------|--------|-------|
| user_id | JWT token (sub claim) | Passed to all MCP tools |
| (email, name) | Via get_my_user_info tool | On-demand for identity queries |

### User-Scoped Operations

EVERY tool call MUST include user_id to ensure:
- User can only see their own tasks
- User can only modify their own tasks
- User can only access their own conversations

### Identity Query Handling

When user asks "who am I":
1. Call `get_my_user_info` tool
2. Extract email and name from response
3. Format friendly response: "You're signed in as [name] ([email])."

## Conversation Continuity Rules

### Context Window

The agent receives the last N messages from the conversation:

| Setting | Value | Rationale |
|---------|-------|-----------|
| Max history messages | 20 | Balance context vs token usage |
| Include system messages | NO | Only user and assistant messages |
| Include tool results | NO | Tool results are processed, not shown |

### Continuity Behaviors

| Scenario | Behavior |
|----------|----------|
| Follow-up question | Use previous message context |
| Pronoun reference | Resolve to previously mentioned task |
| "That one" / "the last one" | Refer to most recently mentioned task |
| "Do it again" | Repeat last action |
| New topic | Start fresh, no need to reference history |

### Pronoun Resolution

| Pronoun | Resolution |
|---------|------------|
| "it" | Last mentioned task |
| "that" | Last mentioned task |
| "that one" | Last mentioned task |
| "the same" | Last action parameters |
| "another" | Same action, different task |

**Example**:
```
User: Add task buy groceries
Agent: Added "Buy groceries"

User: Mark it as done
Agent: (Resolves "it" to "Buy groceries") → toggle_task_completion
```

### Context Limitations

The agent MUST NOT:
- Remember tasks from previous sessions without calling tools
- Assume task state from memory (always verify with tools)
- Reference tasks mentioned more than 10 messages ago
- Carry over state from other users' conversations
