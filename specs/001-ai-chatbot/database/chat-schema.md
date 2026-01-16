# Chat Database Schema Specification

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## Schema Overview

| Table | Purpose | New/Existing |
|-------|---------|--------------|
| user | User accounts (Better Auth) | Existing |
| tasks | Todo tasks | Existing |
| conversations | Chat sessions | NEW |
| messages | Chat messages | NEW |

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
                   │ user_id (FK)    │──────────┘
                   │ conversation_id │
                   │ role            │
                   │ content         │
                   │ created_at      │
                   └─────────────────┘
```

---

## Table: conversations

### Purpose

Stores chat session metadata. Each conversation represents a distinct chat thread for a user.

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary key |
| user_id | VARCHAR(255) | NO | - | Foreign key to user.id |
| created_at | TIMESTAMP | NO | NOW() | Conversation creation time (UTC) |
| updated_at | TIMESTAMP | NO | NOW() | Last activity time (UTC) |

### Constraints

| Constraint | Type | Definition |
|------------|------|------------|
| conversations_pkey | PRIMARY KEY | (id) |
| conversations_user_id_fkey | FOREIGN KEY | user_id REFERENCES user(id) ON DELETE CASCADE |
| conversations_user_id_not_null | NOT NULL | user_id |
| conversations_created_at_not_null | NOT NULL | created_at |
| conversations_updated_at_not_null | NOT NULL | updated_at |

### Indexes

| Index Name | Fields | Type | Purpose |
|------------|--------|------|---------|
| ix_conversations_user_id | user_id | BTREE | Query conversations by user |
| ix_conversations_updated_at | updated_at | BTREE | Sort by recent activity |

### SQLModel Definition

```
Class: Conversation
Table Name: conversations

Fields:
  - id: Optional[int], primary_key=True
  - user_id: str, index=True, nullable=False, foreign_key="user.id"
  - created_at: datetime, default=NOW(UTC), nullable=False
  - updated_at: datetime, default=NOW(UTC), nullable=False
```

---

## Table: messages

### Purpose

Stores individual chat messages within conversations. Each message is either from the user or the AI assistant.

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary key |
| user_id | VARCHAR(255) | NO | - | Foreign key to user.id |
| conversation_id | INTEGER | NO | - | Foreign key to conversations.id |
| role | VARCHAR(20) | NO | - | Message author: "user" or "assistant" |
| content | TEXT | NO | - | Message text content |
| created_at | TIMESTAMP | NO | NOW() | Message creation time (UTC) |

### Constraints

| Constraint | Type | Definition |
|------------|------|------------|
| messages_pkey | PRIMARY KEY | (id) |
| messages_user_id_fkey | FOREIGN KEY | user_id REFERENCES user(id) ON DELETE CASCADE |
| messages_conversation_id_fkey | FOREIGN KEY | conversation_id REFERENCES conversations(id) ON DELETE CASCADE |
| messages_user_id_not_null | NOT NULL | user_id |
| messages_conversation_id_not_null | NOT NULL | conversation_id |
| messages_role_not_null | NOT NULL | role |
| messages_content_not_null | NOT NULL | content |
| messages_created_at_not_null | NOT NULL | created_at |
| messages_role_check | CHECK | role IN ('user', 'assistant') |

### Indexes

| Index Name | Fields | Type | Purpose |
|------------|--------|------|---------|
| ix_messages_conversation_id | conversation_id | BTREE | Query messages by conversation |
| ix_messages_user_id | user_id | BTREE | Enforce user isolation |
| ix_messages_created_at | created_at | BTREE | Sort messages chronologically |

### SQLModel Definition

```
Class: Message
Table Name: messages

Fields:
  - id: Optional[int], primary_key=True
  - user_id: str, index=True, nullable=False, foreign_key="user.id"
  - conversation_id: int, index=True, nullable=False, foreign_key="conversations.id"
  - role: str, nullable=False  # "user" or "assistant"
  - content: str, nullable=False
  - created_at: datetime, default=NOW(UTC), nullable=False
```

---

## Relationships

### User → Conversations (One-to-Many)

| Aspect | Detail |
|--------|--------|
| Parent | user |
| Child | conversations |
| Cardinality | One user has many conversations |
| Foreign Key | conversations.user_id → user.id |
| On Delete | CASCADE (delete user deletes conversations) |

### User → Messages (One-to-Many)

| Aspect | Detail |
|--------|--------|
| Parent | user |
| Child | messages |
| Cardinality | One user has many messages |
| Foreign Key | messages.user_id → user.id |
| On Delete | CASCADE (delete user deletes messages) |

### Conversation → Messages (One-to-Many)

| Aspect | Detail |
|--------|--------|
| Parent | conversations |
| Child | messages |
| Cardinality | One conversation has many messages |
| Foreign Key | messages.conversation_id → conversations.id |
| On Delete | CASCADE (delete conversation deletes messages) |

---

## Indexing Strategy

### Query Patterns

| Query | Index Used |
|-------|------------|
| Get user's conversations | ix_conversations_user_id |
| Get recent conversations | ix_conversations_updated_at |
| Get conversation messages | ix_messages_conversation_id |
| User isolation check | ix_messages_user_id |
| Chronological order | ix_messages_created_at |

### Index Recommendations

| Index | Purpose | Priority |
|-------|---------|----------|
| conversations.user_id | User isolation queries | HIGH |
| messages.conversation_id | Load conversation history | HIGH |
| messages.user_id | Security enforcement | HIGH |
| conversations.updated_at | Sort by recent | MEDIUM |
| messages.created_at | Chronological sort | MEDIUM |

---

## UTC Timestamps

### Timestamp Rules

| Rule | Description |
|------|-------------|
| Storage | All timestamps stored in UTC |
| Default | Use database NOW() with UTC timezone |
| Format | ISO 8601 format for API responses |
| No local time | Never store local timezone |

### Timestamp Fields

| Table | Field | Auto-Set | Updates |
|-------|-------|----------|---------|
| conversations | created_at | On INSERT | Never |
| conversations | updated_at | On INSERT | On every message |
| messages | created_at | On INSERT | Never |

---

## Data Integrity Constraints

### Referential Integrity

| Constraint | Enforcement |
|------------|-------------|
| user_id exists | Foreign key to user table |
| conversation_id exists | Foreign key to conversations table |
| Orphan prevention | CASCADE delete on parent deletion |

### Domain Integrity

| Field | Constraint |
|-------|------------|
| role | Must be "user" or "assistant" |
| content | Cannot be NULL or empty |
| user_id | Cannot be NULL |
| conversation_id | Cannot be NULL |

### Business Rules

| Rule | Enforcement |
|------|-------------|
| Messages belong to conversation owner | user_id must match conversation's user_id |
| Conversation must exist for messages | Foreign key constraint |
| User must exist | Foreign key constraint |

---

## Migration Notes

### New Tables

1. Create `conversations` table first (parent)
2. Create `messages` table second (child)
3. Add indexes after table creation
4. No data migration required (new tables)

### Rollback Plan

1. Drop `messages` table (child first)
2. Drop `conversations` table (parent second)
3. No impact on existing `tasks` or `user` tables
