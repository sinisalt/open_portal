/**
 * WebSocket Demo Component
 *
 * Demonstrates WebSocket datasource usage with real-time updates
 */

import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Message {
  id: string;
  text: string;
  timestamp: number;
  user?: string;
}

export function WebSocketDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [topic, setTopic] = useState('demo-chat');

  // Get WebSocket URL from environment or default
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

  // Connect to WebSocket
  const { isConnected, lastMessage, error, publish } = useWebSocket({
    url: wsUrl,
    topic,
    onMessage: data => {
      // Add new message to list
      const message = data as Message;
      setMessages(prev => [...prev, message]);
    },
    enabled: true,
  });

  // Send message
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      text: inputText,
      timestamp: Date.now(),
      user: 'You',
    };

    publish(topic, message);
    setInputText('');
  };

  // Change topic
  const changeTopic = (newTopic: string) => {
    setMessages([]); // Clear messages when changing topic
    setTopic(newTopic);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WebSocket Demo</h1>
          <p className="text-gray-600">Real-time messaging using WebSocket datasource</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Topic: <span className="font-mono font-semibold">{topic}</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        {/* Topic Selector */}
        <div className="mb-6">
          <div className="block text-sm font-medium text-gray-700 mb-2">Select Topic</div>
          <div className="flex gap-2">
            <button
              onClick={() => changeTopic('demo-chat')}
              className={`px-4 py-2 rounded ${
                topic === 'demo-chat' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              type="button"
            >
              General Chat
            </button>
            <button
              onClick={() => changeTopic('demo-updates')}
              className={`px-4 py-2 rounded ${
                topic === 'demo-updates' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              type="button"
            >
              Updates
            </button>
            <button
              onClick={() => changeTopic('demo-notifications')}
              className={`px-4 py-2 rounded ${
                topic === 'demo-notifications'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              type="button"
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Messages Display */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto border border-gray-200">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No messages yet. Send a message to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className="bg-white rounded p-3 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {msg.user || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{msg.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor="message-input" className="block text-sm font-medium text-gray-700 mb-2">
            Send Message
          </label>
          <div className="flex gap-2">
            <input
              id="message-input"
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !inputText.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              type="button"
            >
              Send
            </button>
          </div>
        </div>

        {/* Last Message Debug Info */}
        {lastMessage && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Last Message (Debug)</h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(lastMessage, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
