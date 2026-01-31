'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useChatStore } from '@/store/chatStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Package,
  Store,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { hasValidImageSrc } from '@/lib/utils';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [shopNames, setShopNames] = useState<Record<number, string>>({});

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

  // Initialize user when auth loads
  useEffect(() => {
    if (!authLoading && user) {
      setCurrentUser({ id: user.id, role: 'BUYER' });
      loadRooms();
    }
  }, [user, authLoading, setCurrentUser, loadRooms]);

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

  // Fetch shop names
  useEffect(() => {
    const fetchShopNames = async () => {
      const shopIds = [...new Set(rooms.map(r => r.shopId))];
      const names: Record<number, string> = {};

      for (const shopId of shopIds) {
        try {
          const response = await api.get(`/shops/${shopId}`);
          names[shopId] = response.data.name;
        } catch (error) {
          names[shopId] = `Shop #${shopId}`;
        }
      }

      setShopNames(names);
    };

    if (rooms.length > 0) {
      fetchShopNames();
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const activeMessages = activeRoomId ? messages[activeRoomId] || [] : [];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">แชท</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Room List - Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">การสนทนา</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingRooms ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">ยังไม่มีการสนทนา</p>
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
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Store className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {shopNames[room.shopId] || `Shop #${room.shopId}`}
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
        <div className="flex-1 flex flex-col bg-white">
          {!activeRoomId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">เลือกการสนทนาเพื่อเริ่มแชท</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {shopNames[activeRoom?.shopId || 0] || 'กำลังโหลด...'}
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
                    <p className="text-sm text-gray-400 mt-1">ส่งข้อความเพื่อเริ่มสนทนา</p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderUserId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}
                      >
                        {/* Profile Image - Left side for others only */}
                        {!isMe && (
                          <div className="flex-shrink-0">
                            {hasValidImageSrc(msg.senderProfileImage) ? (
                              <img
                                src={msg.senderProfileImage}
                                alt={msg.senderUsername || 'User'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {msg.senderUsername?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col">
                          {/* Username */}
                          {!isMe && msg.senderUsername && (
                            <p className="text-xs text-gray-500 mb-1 px-1 font-normal">{msg.senderUsername}</p>
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

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
