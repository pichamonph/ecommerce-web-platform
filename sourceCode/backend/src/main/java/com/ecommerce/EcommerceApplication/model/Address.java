package com.ecommerce.EcommerceApplication.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Address {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(nullable = false) private String phone;
    @Column(nullable = false) private String line1;
    private String line2;
    private String subdistrict;
    private String district;
    private String province;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(nullable = false) private String country;

    @Column(name = "is_default_addr", nullable = false)
    private Boolean isDefault;
}
