package com.ecommerce.EcommerceApplication.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "seller_applications")
@Getter @Setter
public class SellerApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = true, length = 200)
    private String displayName;

    @Column(length = 1000)
    private String note;

    @Column(length = 64)
    private String taxId;

    @Column(nullable = false, length = 32)
    private String status = "PENDING";
}
