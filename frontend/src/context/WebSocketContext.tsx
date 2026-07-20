import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface ChatMessage {
  id: number;
  sender_id: number;
  recipient_id?: number;
  group_id?: number;
  content: string;
  created_at: string;
  sender: {
    id: number;
    full_name: string;
    role: string;
    profile_photo_url?: string;
  };
}

interface WebSocketContextType {
  messages: ChatMessage[];
  sendMessage: (recipientId: number | null, groupId: number | null, content: string) => void;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      setMessages([]);
      setConnected(false);
      return;
    }

    const apiEndpoint = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    let absoluteApiUrl = apiEndpoint;
    if (apiEndpoint.startsWith('/')) {
      absoluteApiUrl = `${window.location.protocol}//${window.location.host}${apiEndpoint}`;
    }
    const parsedUrl = new URL(absoluteApiUrl);
    const wsProtocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${parsedUrl.host}/ws/${user.id}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg: ChatMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error('WebSocket connection error:', err);
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  const sendMessage = (recipientId: number | null, groupId: number | null, content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open');
      return;
    }

    const payload = {
      recipient_id: recipientId,
      group_id: groupId,
      content
    };

    socketRef.current.send(JSON.stringify(payload));
  };

  return (
    <WebSocketContext.Provider value={{ messages, sendMessage, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
};
