export interface ChatRoom {
  id: number;
  buyerUserId: number;
  shopId: number;
  orderId?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderUserId: number;
  senderRole: 'BUYER' | 'SELLER';
  content: string;
  attachments: string[];
  isRead: boolean;
  createdAt: string;
}

export interface ChatSendFrame {
  roomId: number;
  senderUserId: number;
  role: 'BUYER' | 'SELLER';
  content: string;
  attachments?: string[];
}

export interface ChatReadFrame {
  roomId: number;
  userId: number;
}

export interface SendMessageReq {
  content: string;
  attachments?: string[];
}

export interface ChatRoomWithLastMessage extends ChatRoom {
  lastMessage?: ChatMessage;
  unreadCount?: number;
}