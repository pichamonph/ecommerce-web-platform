'use client';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, ChatSendFrame, ChatReadFrame } from '@/types/chat';

export class ChatWebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pendingMessages = new Set<string>();

  constructor() {
    // Delay connection to ensure backend is ready
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  private connect() {
    console.log('Attempting to connect to WebSocket...');

    // ดึง JWT token จาก localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    this.client = new Client({
      webSocketFactory: () => {
        console.log('Creating SockJS connection to http://localhost:8080/api/ws-chat');
        return new SockJS('http://localhost:8080/api/ws-chat');
      },
      connectHeaders: token ? {
        Authorization: `Bearer ${token}`,
      } : {},
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 10000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to chat WebSocket:', frame);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.client.onDisconnect = (frame) => {
      console.log('Disconnected from chat WebSocket:', frame);
      this.isConnected = false;
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
      this.handleReconnect();
    };

    this.client.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.handleReconnect();
    };

    this.client.activate();
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        if (!this.isConnected) {
          this.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribeToRoom(roomId: number, onMessage: (message: ChatMessage | any) => void) {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected, cannot subscribe to room');
      return null;
    }

    console.log(`Subscribing to /topic/chat/${roomId}`);
    const subscription = this.client.subscribe(`/topic/chat/${roomId}`, (message) => {
      console.log(`Received message on /topic/chat/${roomId}:`, message.body);
      try {
        const parsedMessage = JSON.parse(message.body);
        console.log('Parsed message:', parsedMessage);
        onMessage(parsedMessage);
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    });

    console.log(`Successfully subscribed to room ${roomId}`);
    return subscription;
  }

  sendMessage(message: ChatSendFrame) {
    console.log('sendMessage called:', { isConnected: this.isConnected, client: !!this.client, message });

    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected, cannot send message', { client: !!this.client, isConnected: this.isConnected });
      return false;
    }

    // Create unique key for deduplication
    const messageKey = `${message.roomId}-${message.senderUserId}-${message.content}-${Date.now()}`;

    // Check if message is already being sent
    if (this.pendingMessages.has(messageKey)) {
      console.warn('Message already being sent, skipping duplicate');
      return false;
    }

    try {
      this.pendingMessages.add(messageKey);

      console.log('Publishing message to /app/chat.send:', JSON.stringify(message));
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message),
      });

      console.log('Message published successfully');

      // Remove from pending after a short delay
      setTimeout(() => {
        this.pendingMessages.delete(messageKey);
      }, 2000);

      return true;
    } catch (error) {
      console.error('Error sending chat message:', error);
      this.pendingMessages.delete(messageKey);
      return false;
    }
  }

  markAsRead(readFrame: ChatReadFrame) {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected, cannot mark as read');
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/chat.read',
        body: JSON.stringify(readFrame),
      });
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let chatWebSocketService: ChatWebSocketService | null = null;

export const getChatWebSocketService = () => {
  if (typeof window !== 'undefined' && !chatWebSocketService) {
    chatWebSocketService = new ChatWebSocketService();
  }
  return chatWebSocketService;
};