'use client';

import { useEffect } from 'react';
import { getChatWebSocketService } from '@/lib/chatWebSocket';

export const useChatWebSocket = () => {
  useEffect(() => {
    // Initialize WebSocket service when component mounts
    const webSocketService = getChatWebSocketService();

    if (!webSocketService) {
      console.warn('Failed to initialize WebSocket service');
      return;
    }

    console.log('WebSocket service initialized');

    // Don't disconnect on unmount to prevent reconnection issues
    // WebSocket service will be reused across components
  }, []);
};