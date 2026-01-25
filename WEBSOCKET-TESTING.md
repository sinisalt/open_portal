# WebSocket Integration - Testing Guide

## Overview

This document provides instructions for testing the WebSocket integration feature implemented in Issue #036.

## Architecture

The WebSocket implementation consists of:

### Backend
- **WebSocket Server** (`backend/src/services/websocketServer.ts`)
  - Topic-based subscription system
  - JWT authentication
  - Heartbeat (30s interval)
  - Presence tracking
  - Message broadcasting

- **HTTP Endpoints** (`backend/src/routes/websocket.ts`)
  - `GET /ws/stats` - Get server statistics
  - `POST /ws/publish` - Publish messages via HTTP
  - WebSocket endpoint: `ws://localhost:3001/ws?token={jwt_token}`

### Frontend
- **WebSocket Handler** (`src/core/datasources/handlers/WebSocketDatasourceHandler.ts`)
  - Connection pool management
  - Automatic reconnection (exponential backoff)
  - Message queuing during disconnection
  - Topic subscriptions

- **React Hook** (`src/hooks/useWebSocket.ts`)
  - Simple interface for components
  - Automatic cleanup

- **Demo Component** (`src/demos/WebSocketDemo.tsx`)
  - Interactive chat interface
  - Multiple topics
  - Connection status indicator

## Quick Start

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:3001`

### 2. Start Frontend

```bash
cd ..  # Back to root
npm install
npm run dev
```

Frontend will start on `http://localhost:3000`

### 3. Login

Navigate to `http://localhost:3000/login` and login with:
- **Email:** `admin@example.com`
- **Password:** `admin123`

### 4. Access WebSocket Demo

Navigate to `http://localhost:3000/websocket-demo`

## Testing Scenarios

### Test 1: Basic Connection
1. Navigate to WebSocket demo page
2. Verify "Connected" status indicator (green dot)
3. Check browser console for connection logs

**Expected:** Connection established successfully

### Test 2: Topic Subscription
1. Click different topic buttons (General Chat, Updates, Notifications)
2. Observe that previous messages are cleared
3. Check console for subscription confirmations

**Expected:** Topics switch without errors

### Test 3: Send Message
1. Type a message in the input field
2. Click "Send" or press Enter
3. Message should appear in the message list

**Expected:** Message is sent and received

### Test 4: Multiple Tabs (Presence)
1. Open demo page in multiple browser tabs
2. Send messages from different tabs
3. Verify all tabs receive messages on the same topic

**Expected:** All tabs receive real-time updates

### Test 5: Reconnection
1. Stop the backend server (`Ctrl+C` in terminal)
2. Observe "Disconnected" status (red dot)
3. Try sending messages (they should be queued)
4. Restart backend server
5. Observe automatic reconnection
6. Queued messages should be delivered

**Expected:** Automatic reconnection with message recovery

### Test 6: HTTP Publishing
Use curl or Postman to publish messages via HTTP:

```bash
# Get auth token first (login endpoint)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Use the accessToken from response
export TOKEN="your_access_token_here"

# Publish message
curl -X POST http://localhost:3001/ws/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "topic": "demo-chat",
    "data": {
      "id": "msg-123",
      "text": "Message from HTTP",
      "timestamp": 1234567890,
      "user": "Backend"
    }
  }'
```

**Expected:** Message appears in all connected clients subscribed to the topic

### Test 7: Server Statistics
Get WebSocket server statistics:

```bash
curl -X GET http://localhost:3001/ws/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** JSON response with topic statistics:
```json
{
  "topics": [
    {"topic": "demo-chat", "subscribers": 2}
  ],
  "totalTopics": 1,
  "totalSubscribers": 2
}
```

## Using WebSocket in Your Components

### Example 1: Simple Subscription

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const { isConnected, lastMessage } = useWebSocket({
    url: 'ws://localhost:3001/ws',
    topic: 'my-topic',
    onMessage: (data) => {
      console.log('Received:', data);
    },
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Last message: {JSON.stringify(lastMessage)}</p>
    </div>
  );
}
```

### Example 2: Publishing Messages

```typescript
function ChatComponent() {
  const { publish } = useWebSocket({
    url: 'ws://localhost:3001/ws',
    topic: 'chat',
  });

  const sendMessage = () => {
    publish('chat', { text: 'Hello!', user: 'Me' });
  };

  return <button onClick={sendMessage}>Send</button>;
}
```

### Example 3: Dynamic Topics

```typescript
function DynamicTopicComponent() {
  const [topic, setTopic] = useState('topic-1');

  const { isConnected, lastMessage } = useWebSocket({
    url: 'ws://localhost:3001/ws',
    topic,
    onMessage: (data) => console.log(data),
  });

  // Changing topic automatically unsubscribes from old and subscribes to new
  return (
    <div>
      <button onClick={() => setTopic('topic-1')}>Topic 1</button>
      <button onClick={() => setTopic('topic-2')}>Topic 2</button>
      <p>Current: {topic}</p>
      <p>Message: {JSON.stringify(lastMessage)}</p>
    </div>
  );
}
```

## Environment Variables

Add to your `.env` file:

```bash
# Frontend (.env in root)
VITE_WS_URL=ws://localhost:3001/ws

# Backend (.env in backend/)
JWT_SECRET=your-secret-key
PORT=3001
```

## Troubleshooting

### Connection Fails
- **Check backend is running:** `curl http://localhost:3001/health`
- **Verify JWT token:** Check if you're logged in
- **Check browser console:** Look for error messages
- **Firewall:** Ensure port 3001 is accessible

### Messages Not Received
- **Check topic:** Ensure sender and receiver use the same topic
- **Check subscription:** Verify subscription confirmation in console
- **Check connection:** Verify "Connected" status
- **Check backend logs:** Look for errors in backend terminal

### Reconnection Issues
- **Max attempts:** Default is 10 attempts, after which reconnection stops
- **Manual refresh:** Reload the page to reset connection
- **Token expiry:** If token expires, you need to re-login

## Performance Considerations

### Connection Limits
- Single WebSocket connection per URL (shared across components)
- Multiple topics over one connection
- Minimal overhead per subscription

### Message Queue
- Max 100 messages queued during disconnection
- FIFO with overflow protection
- Queue flushed on reconnection

### Heartbeat
- Server pings every 30 seconds
- Dead connections automatically terminated
- No manual intervention needed

## Next Steps

### Production Deployment
1. **HTTPS/WSS:** Use secure WebSocket (wss://) in production
2. **Load Balancing:** Consider Redis pub/sub for multi-instance
3. **Monitoring:** Add metrics and alerting
4. **Rate Limiting:** Add per-user rate limits

### Advanced Features (Future)
- Message acknowledgment
- Message history/replay
- Binary protocol for performance
- Compression for large messages
- User presence with metadata

## API Reference

See `documentation/api-specification.md` for complete API documentation.

## Tests

Run tests with:

```bash
npm test -- WebSocket --no-coverage
```

Expected: 14 tests passing

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Review API documentation
4. Check Issue #036 completion document

---

**Last Updated:** January 2026  
**Version:** 1.0
