# Quickstart: Todo AI Chatbot

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16

## Prerequisites

- Phase II Todo app running (backend + frontend)
- Node.js 18+
- Python 3.11+
- Neon PostgreSQL database configured
- Better Auth configured
- Gemini API key

## Environment Setup

Add to `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Quick Verification

### 1. Backend Health Check
```bash
cd backend
uvicorn app.main:app --reload --port 8000
# Visit: http://localhost:8000/docs
# Should show new /api/{user_id}/chat endpoint
```

### 2. Frontend Health Check
```bash
cd frontend
npm run dev
# Visit: http://localhost:3000
# Should see floating chat icon (bottom-right)
```

### 3. Chat Interaction Test
1. Sign in to the app
2. Click the chat icon
3. Type: "add task test chatbot"
4. Verify task appears in chat response AND todo list

## Implementation Order

1. **Database** → Conversation + Message models
2. **Agent** → TodoOrchestratorAgent configuration
3. **Endpoint** → POST /api/{user_id}/chat
4. **Frontend** → Chat components + useChat hook

## Key Files to Create/Modify

### Backend
- `backend/app/models.py` - Add Conversation, Message models
- `backend/app/agent.py` - NEW: Agent configuration
- `backend/app/routes/chat.py` - NEW: Chat endpoint
- `backend/app/main.py` - Register chat router

### Frontend
- `frontend/components/chat/` - NEW: All chat components
- `frontend/hooks/useChat.ts` - NEW: Chat state hook
- `frontend/lib/chat-api.ts` - NEW: Chat API client
- `frontend/app/(app)/layout.tsx` - Add ChatWidget

## Testing Commands

```bash
# Test chat endpoint (replace token and user_id)
curl -X POST http://localhost:8000/api/USER_ID/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "show my tasks"}'
```

## Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT token is valid |
| 403 Forbidden | URL user_id must match JWT user_id |
| AI not responding | Check GEMINI_API_KEY is set |
| Tools not working | Verify MCP tools are imported in agent.py |

## Success Criteria

- [ ] Chat icon visible on authenticated pages
- [ ] Chat panel opens/closes smoothly
- [ ] Messages display correctly (user right, AI left)
- [ ] Tasks can be added via chat
- [ ] Tasks appear in both chat and Todo list
- [ ] Conversation persists after refresh
