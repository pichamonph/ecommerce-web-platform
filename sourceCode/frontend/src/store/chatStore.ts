'use client';

import { create } from 'zustand';
import { ChatRoom, ChatMessage, ChatRoomWithLastMessage } from '@/types/chat';
import { chatApi } from '@/lib/api/chat';
import { getChatWebSocketService } from '@/lib/chatWebSocket';
import { StompSubscription } from '@stomp/stompjs';

interface ChatState {
  // Current state
  currentUser: { id: number; role: 'BUYER' | 'SELLER'; shopId?: number } | null;
  activeRoomId: number | null;
  rooms: ChatRoomWithLastMessage[];
  messages: Record<number, ChatMessage[]>; // roomId -> messages[]

  // Loading states
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  isConnected: boolean;

  // WebSocket subscription
  roomSubscription: StompSubscription | null;

  // Actions
  setCurrentUser: (user: { id: number; role: 'BUYER' | 'SELLER'; shopId?: number }) => void;
  setActiveRoom: (roomId: number | null) => void;
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: number) => Promise<void>;
  sendMessage: (roomId: number, content: string, attachments?: string[]) => Promise<void>;
  markAsRead: (roomId: number) => void;
  addMessage: (message: ChatMessage) => void;
  subscribeToRoom: (roomId: number) => void;
  unsubscribeFromRoom: () => void;
  createOrGetRoom: (buyerId: number, shopId: number, orderId?: number) => Promise<ChatRoom>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  currentUser: null,
  activeRoomId: null,
  rooms: [],
  messages: {},
  isLoadingRooms: false,
  isLoadingMessages: false,
  isConnected: false,
  roomSubscription: null,

  // Set current user (buyer or seller)
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  // Set active chat room
  setActiveRoom: (roomId) => {
    const { unsubscribeFromRoom, subscribeToRoom, markAsRead } = get();

    // Unsubscribe from previous room
    unsubscribeFromRoom();

    set({ activeRoomId: roomId });

    if (roomId) {
      // Subscribe to new room
      subscribeToRoom(roomId);
      // Mark messages as read
      markAsRead(roomId);
    }
  },

  // Load chat rooms for current user
  loadRooms: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    set({ isLoadingRooms: true });

    try {
      let roomsResponse;

      if (currentUser.role === 'BUYER') {
        roomsResponse = await chatApi.getRoomsForBuyer(currentUser.id);
      } else {
        // For seller, use shopId
        if (!currentUser.shopId) {
          console.error('Seller has no shopId');
          set({ isLoadingRooms: false });
          return;
        }
        roomsResponse = await chatApi.getRoomsForSeller(currentUser.shopId);
      }

      // Transform rooms to include last message info (would need backend enhancement)
      const rooms: ChatRoomWithLastMessage[] = roomsResponse.content.map(room => ({
        ...room,
        lastMessage: undefined,
        unreadCount: 0,
      }));

      set({ rooms, isLoadingRooms: false });
    } catch (error) {
      console.error('Error loading rooms:', error);
      set({ isLoadingRooms: false });
    }
  },

  // Load messages for a room
  loadMessages: async (roomId) => {
    set({ isLoadingMessages: true });

    try {
      const messagesResponse = await chatApi.getMessages(roomId);
      const messages = messagesResponse.content.reverse(); // Show oldest first

      set(state => ({
        messages: {
          ...state.messages,
          [roomId]: messages
        },
        isLoadingMessages: false
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ isLoadingMessages: false });
    }
  },

  // Send a message
  sendMessage: async (roomId, content, attachments = []) => {
    const { currentUser, addMessage } = get();
    if (!currentUser) {
      console.error('No current user');
      return;
    }

    const webSocketService = getChatWebSocketService();
    if (!webSocketService) {
      console.error('WebSocket service not available');
      return;
    }

    console.log('Sending message:', { roomId, content, userId: currentUser.id, role: currentUser.role });

    // Optimistic update - add message immediately to UI with temp ID
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId as any, // Temporary ID with prefix
      roomId,
      senderUserId: currentUser.id,
      senderRole: currentUser.role,
      content,
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    addMessage(optimisticMessage);

    const success = webSocketService.sendMessage({
      roomId,
      senderUserId: currentUser.id,
      role: currentUser.role,
      content,
      attachments,
    });

    if (!success) {
      console.error('Failed to send message via WebSocket');
    } else {
      console.log('Message sent successfully via WebSocket');
    }
  },

  // Mark messages in room as read
  markAsRead: (roomId) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const webSocketService = getChatWebSocketService();
    if (!webSocketService) return;

    webSocketService.markAsRead({
      roomId,
      userId: currentUser.id,
    });
  },

  // Add new message to store (from WebSocket)
  addMessage: (message) => {
    set(state => {
      const roomMessages = state.messages[message.roomId] || [];

      // Check if message already exists to prevent duplicates
      const messageExists = roomMessages.some(m => m.id === message.id);
      if (messageExists) {
        return state; // Don't add duplicate message
      }

      // Remove optimistic messages (temp-*) when real message arrives
      // Match by content and sender to identify the optimistic message
      const filteredMessages = roomMessages.filter(m => {
        const isTempMessage = typeof m.id === 'string' && m.id.toString().startsWith('temp-');
        if (isTempMessage) {
          // Remove if content and sender match (this is the real version)
          const isMatch = m.content === message.content &&
                         m.senderUserId === message.senderUserId;
          return !isMatch;
        }
        return true;
      });

      return {
        messages: {
          ...state.messages,
          [message.roomId]: [...filteredMessages, message]
        }
      };
    });
  },

  // Subscribe to room messages via WebSocket
  subscribeToRoom: (roomId) => {
    const { roomSubscription } = get();

    // If already subscribed, don't subscribe again
    if (roomSubscription) {
      console.log(`Already subscribed to room, skipping subscription`);
      return;
    }

    const webSocketService = getChatWebSocketService();
    if (!webSocketService) {
      console.warn('WebSocket service not available');
      return;
    }

    // Check if websocket is connected, if not wait a bit
    const trySubscribe = () => {
      if (webSocketService.isWebSocketConnected()) {
        const subscription = webSocketService.subscribeToRoom(roomId, (data) => {
          if (data.type === 'READ') {
            // Handle read status update
            console.log(`Messages read in room ${data.roomId} by user ${data.userId}`);
          } else {
            // Handle new message
            const { addMessage } = get();
            addMessage(data as ChatMessage);
          }
        });

        set({ roomSubscription: subscription, isConnected: true });
      } else {
        console.log('WebSocket not connected yet, retrying...');
        setTimeout(trySubscribe, 1000);
      }
    };

    trySubscribe();
  },

  // Unsubscribe from current room
  unsubscribeFromRoom: () => {
    const { roomSubscription } = get();
    if (roomSubscription) {
      roomSubscription.unsubscribe();
      set({ roomSubscription: null, isConnected: false });
    }
  },

  // Create or get existing room
  createOrGetRoom: async (buyerId, shopId, orderId) => {
    try {
      const room = await chatApi.getOrCreateRoom(buyerId, shopId, orderId);

      // Refresh rooms list to include new room
      const { loadRooms } = get();
      loadRooms();

      return room;
    } catch (error) {
      console.error('Error creating/getting room:', error);
      throw error;
    }
  },
}));