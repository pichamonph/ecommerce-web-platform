package com.ecommerce.EcommerceApplication.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ChatMessageDto {
    public Long id;
    public Long roomId;
    public Long senderUserId;
    public String senderUsername;
    public String senderProfileImage;
    public String senderRole;
    public String content;
    public List<String> attachments;
    public LocalDateTime createdAt;
    public boolean isRead;
}
