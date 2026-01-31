import api from '@/lib/api';
import { ChatRoom, ChatMessage, ChatRoomWithLastMessage } from '@/types/chat';

export const chatApi = {
  // Create or get existing chat room (buyerId from JWT)
  async getOrCreateRoom(buyerId: number, shopId: number, orderId?: number): Promise<ChatRoom> {
    const params: any = { shopId };
    if (orderId) {
      params.orderId = orderId;
    }

    const response = await api.post('/chat/rooms', null, { params });
    return response.data;
  },

  // Get chat rooms for buyer (uses JWT for authentication)
  async getRoomsForBuyer(buyerId: number, page: number = 0, size: number = 20): Promise<{
    content: ChatRoom[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await api.get('/chat/rooms/buyer', {
      params: { page, size }
    });
    return response.data;
  },

  // Get chat rooms for seller (shop)
  async getRoomsForSeller(shopId: number, page: number = 0, size: number = 20): Promise<{
    content: ChatRoom[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await api.get('/chat/rooms/seller', {
      params: { shopId, page, size }
    });
    return response.data;
  },

  // Get messages for a room
  async getMessages(roomId: number, page: number = 0, size: number = 50): Promise<{
    content: ChatMessage[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await api.get(`/chat/rooms/${roomId}/messages`, {
      params: { page, size }
    });
    return response.data;
  },
};