'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import { useChatStore } from '@/store/chatStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import {
  MessageCircle,
  Send,
  Package,
  User,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { hasValidImageSrc } from '@/lib/utils';

function SellerChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { shop, loading: shopLoading } = useShop();
  const [messageInput, setMessageInput] = useState('');
  const [buyerNames, setBuyerNames] = useState<Record<number, string>>({});

  // Initialize WebSocket
  useChatWebSocket();

  // Chat store
  const {
    currentUser,
    activeRoomId,
    rooms,
    messages,
    isLoadingRooms,
    isLoadingMessages,
    setCurrentUser,
    setActiveRoom,
    loadRooms,
    loadMessages,
    sendMessage,
  } = useChatStore();

  // Initialize shop as current user when shop loads
  useEffect(() => {
    if (!shopLoading && shop) {
      setCurrentUser({ id: shop.id, role: 'SELLER', shopId: shop.id });
      loadRooms();
    }
  }, [shop, shopLoading, setCurrentUser, loadRooms]);

  // Auto-select room from query parameter
  useEffect(() => {
    const roomIdParam = searchParams.get('roomId');
    if (roomIdParam && rooms.length > 0) {
      const roomId = parseInt(roomIdParam);
      const roomExists = rooms.find(r => r.id === roomId);
      if (roomExists && activeRoomId !== roomId) {
        setActiveRoom(roomId);
      }
    }
  }, [searchParams, rooms, activeRoomId, setActiveRoom]);

  // Load messages when room is selected
  useEffect(() => {
    if (activeRoomId) {
      loadMessages(activeRoomId);
    }
  }, [activeRoomId, loadMessages]);

  // Fetch buyer names
  useEffect(() => {
    const fetchBuyerNames = async () => {
      const buyerIds = [...new Set(rooms.map(r => r.buyerUserId))];
      const names: Record<number, string> = {};

      for (const buyerId of buyerIds) {
        try {
          const response = await api.get(`/users/${buyerId}`);
          names[buyerId] = response.data.name || response.data.username;
        } catch (error) {
          names[buyerId] = `User #${buyerId}`;
        }
      }

      setBuyerNames(names);
    };

    if (rooms.length > 0) {
      fetchBuyerNames();
    }
  }, [rooms]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeRoomId && messages[activeRoomId]) {
      setTimeout(() => {
        const chatArea = document.getElementById('chat-messages');
        if (chatArea) {
          chatArea.scrollTop = chatArea.scrollHeight;
        }
      }, 100);
    }
  }, [activeRoomId, messages]);

  const handleSendMessage = async () => {
    if (!activeRoomId || !messageInput.trim()) return;

    await sendMessage(activeRoomId, messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!shop) {
    router.push('/seller/create-shop');
    return null;
  }

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const activeMessages = activeRoomId ? messages[activeRoomId] || [] : [];

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 mb-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold drop-shadow-lg">แชทกับลูกค้า</h1>
        <p className="text-white/90 text-sm mt-1">จัดการการสนทนากับลูกค้าของคุณ</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-white rounded-xl shadow-lg" style={{ minHeight: '600px' }}>
        {/* Room List - Left Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">ลูกค้า</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingRooms ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">ยังไม่มีลูกค้าติดต่อเข้ามา</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                      activeRoomId === room.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {buyerNames[room.buyerUserId] || `ลูกค้า #${room.buyerUserId}`}
                        </p>
                        {room.orderId && (
                          <div className="flex items-center gap-1 mt-1">
                            <Package className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              ออเดอร์ #{room.orderId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - Right */}
        <div className="flex-1 flex flex-col">
          {!activeRoomId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">เลือกลูกค้าเพื่อเริ่มแชท</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {buyerNames[activeRoom?.buyerUserId || 0] || 'กำลังโหลด...'}
                    </h3>
                    {activeRoom?.orderId && (
                      <p className="text-xs text-gray-500">
                        ออเดอร์ #{activeRoom.orderId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                id="chat-messages"
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">ยังไม่มีข้อความ</p>
                    <p className="text-sm text-gray-400 mt-1">รอลูกค้าส่งข้อความเข้ามา</p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderRole === 'SELLER';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}
                      >
                        {/* Profile Image - Left side for buyer */}
                        {!isMe && (
                          <div className="flex-shrink-0">
                            {hasValidImageSrc(msg.senderProfileImage) ? (
                              <img
                                src={msg.senderProfileImage}
                                alt={msg.senderUsername || 'User'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {msg.senderUsername?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col">
                          {/* Username */}
                          {!isMe && msg.senderUsername && (
                            <p className="text-xs text-gray-600 mb-1 px-1">{msg.senderUsername}</p>
                          )}

                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isMe ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Profile Image - Right side for seller */}
                        {isMe && (
                          <div className="flex-shrink-0">
                            {hasValidImageSrc(shop.logoUrl) ? (
                              <img
                                src={shop.logoUrl}
                                alt={shop.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {shop.name?.[0]?.toUpperCase() || 'S'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SellerChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SellerChatPageContent />
    </Suspense>
  );
}
