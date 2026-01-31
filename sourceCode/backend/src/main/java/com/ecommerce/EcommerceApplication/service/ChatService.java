package com.ecommerce.EcommerceApplication.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ecommerce.EcommerceApplication.dto.ChatMessageDto;
import com.ecommerce.EcommerceApplication.dto.ChatRoomDto;
import com.ecommerce.EcommerceApplication.dto.SendMessageReq;

public interface ChatService {
  ChatRoomDto getOrCreateRoom(Long buyerId, Long shopId, Long orderId);
  Page<ChatRoomDto> listRoomsForBuyer(Long buyerId, Pageable p);
  Page<ChatRoomDto> listRoomsForShop(Long shopId, Pageable p);
  Page<ChatMessageDto> listMessages(Long roomId, Pageable p);
  ChatMessageDto sendMessage(Long roomId, Long senderUserId, String role, SendMessageReq req);
  void markRead(Long roomId, Long userId);
}
