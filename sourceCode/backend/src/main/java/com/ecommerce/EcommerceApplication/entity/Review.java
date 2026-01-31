package com.ecommerce.EcommerceApplication.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reviews", uniqueConstraints = {
    @jakarta.persistence.UniqueConstraint(
        name = "uk_review_user_order_item",
        columnNames = {"user_id", "order_item_id"}
    )
})
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "order_item_id")
    private Long orderItemId;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1..5

    @Column(name = "title")
    private String title;

    @Column(name = "comment")
    private String comment;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "images", columnDefinition = "jsonb")
    private String images; // JSON array of image URLs

    @Column(name = "is_verified")
    private Boolean isVerified = Boolean.FALSE;

    @Column(name = "shop_reply")
    private String shopReply;

    @Column(name = "shop_reply_at")
    private LocalDateTime shopReplyAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getShopReply() { return shopReply; }
    public void setShopReply(String shopReply) { this.shopReply = shopReply; }

    public LocalDateTime getShopReplyAt() { return shopReplyAt; }
    public void setShopReplyAt(LocalDateTime shopReplyAt) { this.shopReplyAt = shopReplyAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
