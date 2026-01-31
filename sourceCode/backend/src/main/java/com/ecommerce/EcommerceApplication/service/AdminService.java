package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.DashboardStatsResponse;
import com.ecommerce.EcommerceApplication.dto.SellerApplicationDto;
import com.ecommerce.EcommerceApplication.dto.ShopDto;
import com.ecommerce.EcommerceApplication.dto.UserDto;
import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.model.SellerApplication;
import com.ecommerce.EcommerceApplication.model.Shop;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SellerApplicationRepository sellerApplicationRepository;

    public DashboardStatsResponse getDashboardStats() {
        // Basic counts
        Long totalUsers = userRepository.count();
        Long totalShops = shopRepository.count();
        Long totalProducts = productRepository.count();
        Long totalOrders = orderRepository.count();

        // Count sellers (users with ROLE_SELLER)
        Long totalSellers = userRepository.countByRole("ROLE_SELLER");

        // Pending seller applications
        Long pendingApplications = sellerApplicationRepository.countByStatus("PENDING");

        // Calculate total revenue from all orders
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Get top 10 products by sales
        List<DashboardStatsResponse.TopProductDto> topProducts = getTopProducts(10);

        // Get top 10 shops by revenue
        List<DashboardStatsResponse.TopShopDto> topShops = getTopShops(10);

        // Get revenue by date for last 30 days
        List<DashboardStatsResponse.RevenueByDateDto> revenueByDate = getRevenueByDate(30);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalSellers(totalSellers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .pendingSellerApplications(pendingApplications)
                .topProducts(topProducts)
                .topShops(topShops)
                .revenueByDate(revenueByDate)
                .build();
    }

    private List<DashboardStatsResponse.TopProductDto> getTopProducts(int limit) {
        // Group by product and sum quantities
        Map<Long, Map<String, Object>> productStats = new HashMap<>();

        orderRepository.findAll().forEach(order -> {
            order.getItems().forEach(item -> {
                Long productId = item.getProductId();
                if (productId != null) {
                    productStats.putIfAbsent(productId, new HashMap<>());
                    Map<String, Object> stats = productStats.get(productId);

                    Long totalSold = (Long) stats.getOrDefault("totalSold", 0L);
                    BigDecimal totalRevenue = (BigDecimal) stats.getOrDefault("totalRevenue", BigDecimal.ZERO);

                    stats.put("totalSold", totalSold + item.getQuantity());
                    stats.put("totalRevenue", totalRevenue.add(item.getTotalPrice()));
                }
            });
        });

        return productStats.entrySet().stream()
                .sorted((e1, e2) -> ((Long) e2.getValue().get("totalSold")).compareTo((Long) e1.getValue().get("totalSold")))
                .limit(limit)
                .map(entry -> {
                    Long productId = entry.getKey();
                    String productName = productRepository.findById(productId)
                            .map(p -> p.getName())
                            .orElse("Unknown Product");

                    return DashboardStatsResponse.TopProductDto.builder()
                            .productId(productId)
                            .productName(productName)
                            .totalSold((Long) entry.getValue().get("totalSold"))
                            .totalRevenue((BigDecimal) entry.getValue().get("totalRevenue"))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<DashboardStatsResponse.TopShopDto> getTopShops(int limit) {
        Map<Long, Map<String, Object>> shopStats = new HashMap<>();

        orderRepository.findAll().forEach(order -> {
            order.getItems().forEach(item -> {
                Long productId = item.getProductId();
                if (productId != null) {
                    productRepository.findById(productId).ifPresent(product -> {
                        Long shopId = product.getShopId();
                        if (shopId != null) {
                            shopStats.putIfAbsent(shopId, new HashMap<>());
                            Map<String, Object> stats = shopStats.get(shopId);

                            Long totalOrders = (Long) stats.getOrDefault("totalOrders", 0L);
                            BigDecimal totalRevenue = (BigDecimal) stats.getOrDefault("totalRevenue", BigDecimal.ZERO);

                            stats.put("totalOrders", totalOrders + 1);
                            stats.put("totalRevenue", totalRevenue.add(item.getTotalPrice()));
                        }
                    });
                }
            });
        });

        return shopStats.entrySet().stream()
                .sorted((e1, e2) -> ((BigDecimal) e2.getValue().get("totalRevenue")).compareTo((BigDecimal) e1.getValue().get("totalRevenue")))
                .limit(limit)
                .map(entry -> {
                    Long shopId = entry.getKey();
                    String shopName = shopRepository.findById(shopId)
                            .map(s -> s.getName())
                            .orElse("Unknown Shop");

                    return DashboardStatsResponse.TopShopDto.builder()
                            .shopId(shopId)
                            .shopName(shopName)
                            .totalOrders((Long) entry.getValue().get("totalOrders"))
                            .totalRevenue((BigDecimal) entry.getValue().get("totalRevenue"))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<DashboardStatsResponse.RevenueByDateDto> getRevenueByDate(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Order> recentOrders = orderRepository.findAll().stream()
                .filter(order -> order.getCreatedAt() != null && order.getCreatedAt().isAfter(startDate))
                .collect(Collectors.toList());

        Map<String, Map<String, Object>> dateStats = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        recentOrders.forEach(order -> {
            String date = order.getCreatedAt().format(formatter);
            dateStats.putIfAbsent(date, new HashMap<>());
            Map<String, Object> stats = dateStats.get(date);

            BigDecimal revenue = (BigDecimal) stats.getOrDefault("revenue", BigDecimal.ZERO);
            Long orderCount = (Long) stats.getOrDefault("orderCount", 0L);

            stats.put("revenue", revenue.add(order.getTotalAmount()));
            stats.put("orderCount", orderCount + 1);
        });

        return dateStats.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> DashboardStatsResponse.RevenueByDateDto.builder()
                        .date(entry.getKey())
                        .revenue((BigDecimal) entry.getValue().get("revenue"))
                        .orderCount((Long) entry.getValue().get("orderCount"))
                        .build())
                .collect(Collectors.toList());
    }

    // User Management
    public List<UserDto> getAllUsers(String search, String role) {
        List<User> users = userRepository.findAll();

        // Filter by search term
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getUsername().toLowerCase().contains(searchLower)
                            || u.getEmail().toLowerCase().contains(searchLower)
                            || (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(searchLower))
                            || (u.getLastName() != null && u.getLastName().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        // Filter by role
        if (role != null && !role.trim().isEmpty()) {
            users = users.stream()
                    .filter(u -> u.getRole().equals(role))
                    .collect(Collectors.toList());
        }

        return users.stream()
                .map(this::convertToUserDto)
                .collect(Collectors.toList());
    }

    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setIsBanned(true);
        userRepository.save(user);
    }

    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setIsBanned(false);
        userRepository.save(user);
    }

    private UserDto convertToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .isBanned(user.getIsBanned())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    // Seller Application Management
    @Transactional(readOnly = true)
    public List<SellerApplicationDto> getAllApplications(String status) {
        List<SellerApplication> applications = sellerApplicationRepository.findAll();

        // Filter by status if provided
        if (status != null && !status.trim().isEmpty()) {
            applications = applications.stream()
                    .filter(app -> app.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        return applications.stream()
                .map(this::convertToApplicationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveApplication(Long applicationId) {
        SellerApplication app = sellerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!"PENDING".equalsIgnoreCase(app.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Application is not pending");
        }

        app.setStatus("APPROVED");
        sellerApplicationRepository.save(app);

        // Upgrade user to SELLER role
        User user = app.getUser();
        user.setRole("ROLE_SELLER");
        userRepository.save(user);
    }

    @Transactional
    public void rejectApplication(Long applicationId) {
        SellerApplication app = sellerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!"PENDING".equalsIgnoreCase(app.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Application is not pending");
        }

        app.setStatus("REJECTED");
        sellerApplicationRepository.save(app);
    }

    private SellerApplicationDto convertToApplicationDto(SellerApplication app) {
        User user = app.getUser();
        return SellerApplicationDto.builder()
                .id(app.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(app.getDisplayName())
                .note(app.getNote())
                .taxId(app.getTaxId())
                .status(app.getStatus())
                .build();
    }

    // Shop Management
    @Transactional(readOnly = true)
    public List<ShopDto> getAllShops(String search, Boolean suspended) {
        List<Shop> shops = shopRepository.findAll();

        // Filter by search term
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            shops = shops.stream()
                    .filter(s -> s.getName().toLowerCase().contains(searchLower)
                            || s.getOwner().getUsername().toLowerCase().contains(searchLower)
                            || s.getOwner().getEmail().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        // Filter by suspended status
        if (suspended != null) {
            shops = shops.stream()
                    .filter(s -> s.isSuspended() == suspended)
                    .collect(Collectors.toList());
        }

        return shops.stream()
                .map(this::convertToShopDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void suspendShop(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found"));

        shop.setSuspended(true);
        shopRepository.save(shop);
    }

    @Transactional
    public void unsuspendShop(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found"));

        shop.setSuspended(false);
        shopRepository.save(shop);
    }

    @Transactional
    public void revokeSellerRole(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found"));

        // Suspend shop permanently
        shop.setSuspended(true);
        shop.setStatus("SUSPENDED");
        shopRepository.save(shop);

        // Change seller back to user role
        User owner = shop.getOwner();
        owner.setRole("ROLE_USER");
        userRepository.save(owner);
    }

    private ShopDto convertToShopDto(Shop shop) {
        User owner = shop.getOwner();
        return ShopDto.builder()
                .id(shop.getId())
                .ownerId(owner.getId())
                .ownerUsername(owner.getUsername())
                .ownerEmail(owner.getEmail())
                .name(shop.getName())
                .description(shop.getDescription())
                .logoUrl(shop.getLogoUrl())
                .status(shop.getStatus())
                .suspended(shop.isSuspended())
                .createdAt(shop.getCreatedAt())
                .updatedAt(shop.getUpdatedAt())
                .build();
    }
}
