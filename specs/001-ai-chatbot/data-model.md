# Data Model: Todo AI Chatbot

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## Model Overview

| Model | Purpose | Status |
|-------|---------|--------|
| Task | Todo items | EXISTS (Phase II) |
| User | User accounts | EXISTS (Better Auth) |
| Conversation | Chat sessions | NEW |
| Message | Chat messages | NEW |

---

## Existing Models (Reference Only)

### Task (EXISTS)

**Location**: `backend/app/models.py`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, AUTO | Primary key |
| user_id | String | FK→user.id, NOT NULL, INDEX | Owner |
| title | String | NOT NULL, 1-200 chars | Task title |
| description | String | NULLABLE, max 1000 chars | Task description |
| completed | Boolean | NOT NULL, DEFAULT false | Completion status |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | Creation time (UTC) |
| updated_at | DateTime | NOT NULL, DEFAULT NOW() | Last update (UTC) |

### User (EXISTS - Better Auth)

**Location**: Better Auth managed (external)

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (UUID) |
| email | String | User email |
| name | String | User name (optional) |
| createdAt | DateTime | Account creation time |
| updatedAt | DateTime | Last update time |

---

## New Models

### Conversation

**Purpose**: Represents a chat session for a user.

**Table Name**: `conversations`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, AUTO | Primary key |
| user_id | String | FK→user.id, NOT NULL, INDEX | Owner |
| created_at | DateTime | NOT NULL, DEFAULT NOW(UTC) | Session start time |
| updated_at | DateTime | NOT NULL, DEFAULT NOW(UTC) | Last activity time |

**Indexes**:
- `ix_conversations_user_id` on `user_id`
- `ix_conversations_updated_at` on `updated_at`

**SQLModel Definition**:
```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(
        index=True,
        nullable=False,
        foreign_key="user.id",
        description="Foreign key to user.id"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        description="Conversation start time (UTC)"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        description="Last activity time (UTC)"
    )
```

**Relationships**:
- One User has Many Conversations
- One Conversation has Many Messages

**Cascade Behavior**:
- Delete User → Delete all Conversations (CASCADE)

---

### Message

**Purpose**: Represents an individual chat message within a conversation.

**Table Name**: `messages`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, AUTO | Primary key |
| user_id | String | FK→user.id, NOT NULL, INDEX | Owner (for isolation) |
| conversation_id | Integer | FK→conversations.id, NOT NULL, INDEX | Parent conversation |
| role | String | NOT NULL, CHECK('user','assistant') | Message author |
| content | Text | NOT NULL | Message content |
| created_at | DateTime | NOT NULL, DEFAULT NOW(UTC) | Message time |

**Indexes**:
- `ix_messages_user_id` on `user_id`
- `ix_messages_conversation_id` on `conversation_id`
- `ix_messages_created_at` on `created_at`

**SQLModel Definition**:
```python
class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(
        index=True,
        nullable=False,
        foreign_key="user.id",
        description="Foreign key to user.id (for isolation)"
    )
    conversation_id: int = Field(
        index=True,
        nullable=False,
        foreign_key="conversations.id",
        description="Foreign key to conversations.id"
    )
    role: str = Field(
        nullable=False,
        description="Message author: 'user' or 'assistant'"
    )
    content: str = Field(
        nullable=False,
        description="Message text content"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        description="Message creation time (UTC)"
    )
```

**Relationships**:
- One User has Many Messages
- One Conversation has Many Messages

**Cascade Behavior**:
- Delete User → Delete all Messages (CASCADE)
- Delete Conversation → Delete all Messages (CASCADE)

**Business Rules**:
- `role` must be exactly "user" or "assistant"
- `content` cannot be empty
- Messages belong to both a user AND a conversation
- User isolation: messages.user_id must match conversation owner

---

## Validation Rules

### Conversation

| Field | Rule |
|-------|------|
| user_id | Required, must be valid user.id |
| created_at | Auto-set on creation, immutable |
| updated_at | Auto-set, updated on each new message |

### Message

| Field | Rule |
|-------|------|
| user_id | Required, must match conversation owner |
| conversation_id | Required, must be valid conversation.id |
| role | Required, must be "user" or "assistant" |
| content | Required, cannot be empty |
| created_at | Auto-set on creation, immutable |

---

## Query Patterns

### Get User's Conversations
```sql
SELECT * FROM conversations
WHERE user_id = :user_id
ORDER BY updated_at DESC;
```

### Get Conversation Messages
```sql
SELECT * FROM messages
WHERE conversation_id = :conversation_id
  AND user_id = :user_id
ORDER BY created_at ASC;
```

### Create New Conversation
```sql
INSERT INTO conversations (user_id, created_at, updated_at)
VALUES (:user_id, NOW(), NOW())
RETURNING id;
```

### Add Message
```sql
INSERT INTO messages (user_id, conversation_id, role, content, created_at)
VALUES (:user_id, :conversation_id, :role, :content, NOW())
RETURNING id;

UPDATE conversations SET updated_at = NOW() WHERE id = :conversation_id;
```

---

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│      user       │         │      tasks      │
│ (Better Auth)   │         │   (Phase II)    │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ user_id (FK)    │
│ email           │         │ id (PK)         │
│ name            │         │ title           │
│ createdAt       │         │ description     │
│ updatedAt       │         │ completed       │
└────────┬────────┘         │ created_at      │
         │                  │ updated_at      │
         │                  └─────────────────┘
         │
         │         ┌─────────────────┐
         │         │  conversations  │
         │         │   (Phase III)   │
         │         ├─────────────────┤
         └────────►│ user_id (FK)    │
                   │ id (PK)         │◄─────────┐
                   │ created_at      │          │
                   │ updated_at      │          │
                   └─────────────────┘          │
                                                │
                   ┌─────────────────┐          │
                   │    messages     │          │
                   │   (Phase III)   │          │
                   ├─────────────────┤          │
                   │ id (PK)         │          │
                   │ user_id (FK)────┼──────────┤
                   │ conversation_id │──────────┘
                   │ role            │
                   │ content         │
                   │ created_at      │
                   └─────────────────┘
```

---

## Migration Notes

1. Create `conversations` table first (parent)
2. Create `messages` table second (child, references conversations)
3. Add indexes after table creation
4. No data migration required (new tables)

**Rollback**:
1. Drop `messages` table (child first)
2. Drop `conversations` table (parent second)
