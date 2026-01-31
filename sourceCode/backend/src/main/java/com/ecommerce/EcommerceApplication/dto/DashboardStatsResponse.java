package com.ecommerce.EcommerceApplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalUsers;
    private Long totalSellers;
    private Long totalProducts;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long pendingSellerApplications;

    private List<TopProductDto> topProducts;
    private List<TopShopDto> topShops;
    private List<RevenueByDateDto> revenueByDate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductDto {
        private Long productId;
        private String productName;
        private Long totalSold;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopShopDto {
        private Long shopId;
        private String shopName;
        private Long totalOrders;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByDateDto {
        private String date;
        private BigDecimal revenue;
        private Long orderCount;
    }
}
