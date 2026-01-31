package com.ecommerce.EcommerceApplication.service.impl;

import com.ecommerce.EcommerceApplication.config.AppConfig;
import com.ecommerce.EcommerceApplication.dto.*;
import com.ecommerce.EcommerceApplication.entity.ChatMessage;
import com.ecommerce.EcommerceApplication.entity.ChatRoom;
import com.ecommerce.EcommerceApplication.entity.Shop;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.ChatMessageRepository;
import com.ecommerce.EcommerceApplication.repository.ChatRoomRepository;
import com.ecommerce.EcommerceApplication.repository.ShopRepository;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import com.ecommerce.EcommerceApplication.service.ChatService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository roomRepo;
    private final ChatMessageRepository msgRepo;
    private final UserRepository userRepo;
    private final ShopRepository shopRepo;
    private final AppConfig appConfig;
    private final ObjectMapper om = new ObjectMapper();

    public ChatServiceImpl(ChatRoomRepository roomRepo, ChatMessageRepository msgRepo, UserRepository userRepo, ShopRepository shopRepo, AppConfig appConfig) {
        this.roomRepo = roomRepo;
        this.msgRepo = msgRepo;
        this.userRepo = userRepo;
        this.shopRepo = shopRepo;
        this.appConfig = appConfig;
    }

    @Override
    public ChatRoomDto getOrCreateRoom(Long buyerId, Long shopId, Long orderId) {
        ChatRoom room = roomRepo.findByBuyerUserIdAndShopIdAndOrderId(buyerId, shopId, orderId)
            .orElseGet(() -> {
                ChatRoom c = new ChatRoom();
                c.setBuyerUserId(buyerId);
                c.setShopId(shopId);
                c.setOrderId(orderId);
                return roomRepo.save(c);
            });
        return toDto(room);
    }

    @Transactional(readOnly = true)
    public Page<ChatRoomDto> listRoomsForBuyer(Long buyerId, Pageable p) {
        return roomRepo.findByBuyerUserId(buyerId, p).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ChatRoomDto> listRoomsForShop(Long shopId, Pageable p) {
        return roomRepo.findByShopId(shopId, p).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> listMessages(Long roomId, Pageable p) {
        return msgRepo.findByRoomIdOrderByCreatedAtDesc(roomId, p).map(this::toDto);
    }

    @Override
    public ChatMessageDto sendMessage(Long roomId, Long senderUserId, String role, SendMessageReq req) {
        ChatRoom room = roomRepo.findById(roomId).orElseThrow(() -> new IllegalArgumentException("Room not found"));
        // dev-authorization เบื้องต้น
        if ("BUYER".equalsIgnoreCase(role)) {
            if (!room.getBuyerUserId().equals(senderUserId))
                throw new IllegalStateException("Not your room (buyer)");
        } else if ("SELLER".equalsIgnoreCase(role)) {
            // TODO: ถ้ามี mapping sellerUserId->shopIds ให้ตรวจว่าผู้ส่งเป็นเจ้าของ shopId ของห้องนี้
            // dev-mode: ข้ามไปก่อนหรือรับรองด้วยการทดสอบ manual
        } else {
            throw new IllegalArgumentException("Invalid role");
        }

        ChatMessage m = new ChatMessage();
        m.setRoomId(roomId);
        m.setSenderUserId(senderUserId);
        m.setSenderRole(role.toUpperCase());
        m.setContent(req.content);
        try {
            m.setAttachments(req.attachments == null ? null : om.writeValueAsString(req.attachments));
        } catch (Exception e) {
            throw new IllegalArgumentException("attachments must be JSON array");
        }
        msgRepo.save(m);
        return toDto(m);
    }

    @Override
    public void markRead(Long roomId, Long userId) {
        // ไล่ตั้ง is_read=true ให้ข้อความที่ "คนอื่นส่ง" (ดึงล่าสุด 100 ข้อความ)
        Page<ChatMessage> page = msgRepo.findByRoomIdOrderByCreatedAtDesc(roomId, org.springframework.data.domain.PageRequest.of(0, 100));
        boolean changed = false;
        for (ChatMessage m : page) {
            if (!m.getSenderUserId().equals(userId) && Boolean.FALSE.equals(m.getIsRead())) {
                m.setIsRead(true);
                changed = true;
            }
        }
        if (changed) msgRepo.saveAll(page.getContent());
    }

    // ------- mappers -------
    private ChatRoomDto toDto(ChatRoom r) {
        ChatRoomDto d = new ChatRoomDto();
        d.id = r.getId(); d.buyerUserId = r.getBuyerUserId(); d.shopId = r.getShopId(); d.orderId = r.getOrderId(); d.createdAt = r.getCreatedAt();
        return d;
    }
    private ChatMessageDto toDto(ChatMessage m) {
        ChatMessageDto d = new ChatMessageDto();
        d.id = m.getId(); d.roomId = m.getRoomId(); d.senderUserId = m.getSenderUserId();
        d.senderRole = m.getSenderRole(); d.content = m.getContent(); d.isRead = Boolean.TRUE.equals(m.getIsRead()); d.createdAt = m.getCreatedAt();

        // Add sender username and profile image
        if (m.getSenderUserId() != null) {
            // If sender is SELLER, show shop name instead of username
            if ("SELLER".equalsIgnoreCase(m.getSenderRole())) {
                // Get shop name from room's shopId
                roomRepo.findById(m.getRoomId()).ifPresent(room -> {
                    shopRepo.findById(room.getShopId()).ifPresent(shop -> {
                        d.senderUsername = shop.getName();
                        
                        // Use shop logo as profile image if available
                        if (shop.getLogoUrl() != null && !shop.getLogoUrl().isEmpty()) {
                            d.senderProfileImage = appConfig.buildFileUrl(shop.getLogoUrl());
                        }
                    });
                });
            } else {
                // For BUYER, show user's full name (firstName + lastName) and profile image
                userRepo.findById(m.getSenderUserId()).ifPresent(user -> {
                    // Build full name from firstName and lastName
                    String fullName = "";
                    if (user.getFirstName() != null && !user.getFirstName().isEmpty()) {
                        fullName = user.getFirstName();
                        if (user.getLastName() != null && !user.getLastName().isEmpty()) {
                            fullName += " " + user.getLastName();
                        }
                    } else if (user.getLastName() != null && !user.getLastName().isEmpty()) {
                        fullName = user.getLastName();
                    } else {
                        // Fallback to username if no name available
                        fullName = user.getUsername();
                    }
                    d.senderUsername = fullName;

                    // Add user profile image with full URL
                    if (user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
                        d.senderProfileImage = appConfig.buildFileUrl(user.getProfileImage());
                    }
                });
            }
        }

        try {
            d.attachments = (m.getAttachments() == null) ? List.of() : om.readValue(m.getAttachments(), new TypeReference<List<String>>() {});
        } catch (Exception e) { d.attachments = List.of(); }
        return d;
    }
}
