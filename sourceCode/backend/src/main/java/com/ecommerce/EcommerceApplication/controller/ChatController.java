package com.ecommerce.EcommerceApplication.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.ChatMessageDto;
import com.ecommerce.EcommerceApplication.dto.ChatRoomDto;
import com.ecommerce.EcommerceApplication.service.ChatService;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

  private final ChatService chatService;

  public ChatController(ChatService chatService) {
    this.chatService = chatService;
  }

  private Long getUserId(Authentication auth) {
    // JWT filter sets userId as principal (not username)
    return (Long) auth.getPrincipal();
  }

  // สร้าง/ดึงห้องแชท (buyer ใช้ userId จาก JWT)
  @PostMapping("/rooms")
  public ChatRoomDto getOrCreate(Authentication auth,
                                 @RequestParam Long shopId,
                                 @RequestParam(required = false) Long orderId) {
    Long buyerId = getUserId(auth);
    return chatService.getOrCreateRoom(buyerId, shopId, orderId);
  }

  // ดูห้องแชทสำหรับผู้ซื้อ (ใช้ userId จาก JWT)
  @GetMapping("/rooms/buyer")
  public Page<ChatRoomDto> roomsForBuyer(Authentication auth,
                                         @RequestParam(defaultValue="0") int page,
                                         @RequestParam(defaultValue="20") int size) {
    Long buyerId = getUserId(auth);
    return chatService.listRoomsForBuyer(buyerId, PageRequest.of(page, size));
  }

  // ดูห้องแชทสำหรับผู้ขาย (รับ shopId ตามปกติ - TODO: ควรตรวจสอบว่า user เป็นเจ้าของ shop)
  @GetMapping("/rooms/seller")
  public Page<ChatRoomDto> roomsForSeller(@RequestParam Long shopId,
                                          @RequestParam(defaultValue="0") int page,
                                          @RequestParam(defaultValue="20") int size) {
    return chatService.listRoomsForShop(shopId, PageRequest.of(page, size));
  }

  // ดูข้อความในห้อง (TODO: ควรตรวจสอบว่า user มีสิทธิ์เข้าห้องนี้)
  @GetMapping("/rooms/{roomId}/messages")
  public Page<ChatMessageDto> messages(@PathVariable Long roomId,
                                       @RequestParam(defaultValue="0") int page,
                                       @RequestParam(defaultValue="50") int size) {
    return chatService.listMessages(roomId, PageRequest.of(page, size));
  }
}
