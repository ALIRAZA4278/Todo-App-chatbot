# Frontend Integration Specification

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## Integration Overview

The chat UI integrates with the existing Next.js Todo application as an independent, non-blocking feature. It shares authentication but operates separately from the Todo CRUD interface.

## Route Independence

### Routing Strategy

| Aspect | Requirement |
|--------|-------------|
| Chat panel | Overlay on all authenticated pages |
| No dedicated route | Chat is NOT a separate page |
| URL unchanged | Opening/closing chat doesn't change URL |
| State preservation | Page state preserved when chat opens |

### Page Integration

| Page | Chat Available |
|------|----------------|
| /signin | NO (not authenticated) |
| /signup | NO (not authenticated) |
| /tasks | YES |
| /tasks/* | YES |
| Any authenticated page | YES |

### Component Placement

```
<AuthenticatedLayout>
  <MainContent>
    {/* Existing Todo UI */}
  </MainContent>

  <ChatWidget>
    {/* Floating chat icon + panel */}
    {/* Rendered at layout level */}
  </ChatWidget>
</AuthenticatedLayout>
```

## Auth Token Propagation

### Token Source

| Source | Method |
|--------|--------|
| Better Auth | useSession() hook |
| Token storage | HTTP-only cookie |
| Token access | Via API route or client SDK |

### API Request Flow

```
1. User types message in chat
2. Chat component calls sendMessage()
3. sendMessage() gets token from Better Auth
4. POST /api/{user_id}/chat with Authorization header
5. Backend validates token
6. Response returned to chat
```

### Token Attachment

| Request Type | Token Handling |
|--------------|----------------|
| Chat message | Attach to Authorization header |
| Load history | Attach to Authorization header |
| All chat API calls | Always include token |

### Token Refresh

| Scenario | Handling |
|----------|----------|
| Token valid | Proceed with request |
| Token expired | Redirect to sign in |
| Token missing | Show "Please sign in" message |

## Conversation Persistence

### Local State

| State | Storage | Lifetime |
|-------|---------|----------|
| Current conversation_id | React state | Session |
| Messages (current) | React state | Session |
| Chat open/closed | React state | Session |
| Input text | React state | Until sent |

### Database State

| State | Storage | Lifetime |
|-------|---------|----------|
| Conversations | PostgreSQL | Permanent |
| Messages | PostgreSQL | Permanent |
| Last conversation | User preference | Permanent |

### State Synchronization

| Event | Action |
|-------|--------|
| Page load | Load last conversation from DB |
| New conversation | Create in DB, update local state |
| New message | Save to DB, add to local state |
| Page refresh | Reload from DB |
| Sign out | Clear local state |

### Conversation Resume Flow

```
1. User opens chat
2. Check localStorage for last conversation_id
3. If exists, fetch conversation history from DB
4. If not exists, start new conversation
5. Display messages in chat panel
```

## Zero Interference with Todo CRUD UI

### Independence Rules

| Rule | Implementation |
|------|----------------|
| No shared state | Chat and Todo use separate state |
| No event conflicts | Chat captures its own events |
| No style conflicts | Chat styles are scoped |
| No blocking | Chat operations don't block Todo |

### Visual Independence

| Aspect | Requirement |
|--------|-------------|
| Z-index | Chat panel above Todo content |
| Position | Fixed positioning, not in flow |
| Scroll | Independent scroll container |
| Background | Semi-transparent backdrop (optional) |

### Event Isolation

| Event | Handling |
|-------|----------|
| Click on chat | Handled by chat, not Todo |
| Click on Todo | Handled by Todo, not chat |
| Keyboard in chat | Chat input captures keys |
| Escape key | Close chat (if open) |

### Task Operations

| Operation | Source | Result |
|-----------|--------|--------|
| Create task via chat | AI agent | Task appears in Todo list |
| Complete task via chat | AI agent | Todo list updates |
| Delete task via chat | AI agent | Task removed from Todo list |
| Edit task via Todo UI | Direct API | Chat shows updated data on query |

### Data Consistency

| Scenario | Behavior |
|----------|----------|
| Add task in chat | Todo list refreshes automatically |
| Add task in UI | Chat queries show new task |
| Delete task in chat | Todo list updates |
| Complete task in UI | Chat reports current state |

## Component Structure

### File Organization

```
frontend/
├── components/
│   └── chat/
│       ├── ChatWidget.tsx       # Main wrapper (icon + panel)
│       ├── ChatIcon.tsx         # Floating button
│       ├── ChatPanel.tsx        # Chat panel container
│       ├── ChatHeader.tsx       # Panel header with close
│       ├── MessageList.tsx      # Scrollable message area
│       ├── MessageBubble.tsx    # Individual message
│       ├── ChatInput.tsx        # Input field + send button
│       ├── TypingIndicator.tsx  # Loading dots
│       └── index.ts             # Exports
├── hooks/
│   └── useChat.ts               # Chat state management
├── lib/
│   └── chat-api.ts              # Chat API client
└── app/
    └── (app)/
        └── layout.tsx           # Include ChatWidget
```

### State Management Hook

```
useChat() returns:
  - messages: Message[]
  - conversationId: number | null
  - isOpen: boolean
  - isLoading: boolean
  - error: string | null
  - sendMessage: (text: string) => Promise<void>
  - openChat: () => void
  - closeChat: () => void
  - clearError: () => void
```

### API Client Functions

```
chatApi:
  - sendMessage(userId, message, conversationId?) → Response
  - getConversations(userId) → Conversation[]
  - getMessages(userId, conversationId) → Message[]
```

## Error Handling Integration

### Error Display

| Error Source | Display Location |
|--------------|------------------|
| Auth error | Chat panel or redirect |
| Network error | In chat panel |
| API error | In chat panel |
| Validation error | Below input field |

### Error Recovery

| Error | Recovery Action |
|-------|-----------------|
| Network timeout | Show retry button |
| 401 Unauthorized | Redirect to sign in |
| 500 Server error | Show retry button |
| Rate limited | Show wait message |

### Error Isolation

- Chat errors do NOT affect Todo UI
- Todo errors do NOT affect Chat
- Auth errors affect both (redirect to sign in)

## Performance Considerations

### Lazy Loading

| Component | Loading Strategy |
|-----------|------------------|
| Chat panel | Lazy load on first open |
| Message history | Load on demand |
| Animations | CSS-based, no JS |

### Optimization

| Optimization | Implementation |
|--------------|----------------|
| Message virtualization | For long conversations (>50 messages) |
| Debounced input | No debounce needed (send on submit) |
| Memoization | Memoize MessageBubble components |
| Bundle splitting | Chat in separate chunk |

### Network Efficiency

| Strategy | Implementation |
|----------|----------------|
| Single request | One API call per user message |
| No polling | Wait for response, no auto-refresh |
| Minimal payload | Only message content in request |
