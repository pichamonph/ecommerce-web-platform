package com.ecommerce.EcommerceApplication.service.impl;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.dto.PaymentDto;
import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;
import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.entity.OrderItem;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.entity.Payment;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.entity.ProductVariant;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.repository.CartItemRepository;
import com.ecommerce.EcommerceApplication.repository.CartRepository;
import com.ecommerce.EcommerceApplication.repository.OrderItemRepository;
import com.ecommerce.EcommerceApplication.repository.OrderRepository;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.repository.ProductVariantRepository;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import com.ecommerce.EcommerceApplication.service.OrderService;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    public OrderServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public OrderDto checkout(Long userId, CheckoutReq req) {
        if (req.shippingAddressJson == null || req.shippingAddressJson.isBlank()) {
            throw new IllegalArgumentException("shippingAddress is required");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        if (items.isEmpty()) throw new IllegalStateException("Cart is empty");

        Map<Long, Product> lockedProducts = new HashMap<>();
        Map<Long, ProductVariant> lockedVariants = new HashMap<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : items) {
            Product product = lockedProducts.computeIfAbsent(ci.getProductId(), productId ->
                    productRepository.findByIdForUpdate(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId))
            );

            if (!"active".equalsIgnoreCase(product.getStatus())) {
                throw new IllegalStateException("Product not available: " + product.getName());
            }

            // Check if this cart item has a variant
            Integer stockQuantity;
            String itemName;
            String itemSku;

            if (ci.hasVariant() && ci.getVariantId() != null) {
                // Handle variant product
                ProductVariant variant = lockedVariants.computeIfAbsent(ci.getVariantId(), variantId ->
                        productVariantRepository.findById(variantId)
                                .orElseThrow(() -> new IllegalArgumentException("Variant not found: " + variantId))
                );

                if (!"active".equalsIgnoreCase(variant.getStatus())) {
                    throw new IllegalStateException("Variant not available: " + variant.getDisplayName());
                }

                stockQuantity = variant.getStockQuantity();
                itemName = product.getName() + " - " + variant.getDisplayName();
                itemSku = variant.getSku();

                if (stockQuantity == null || stockQuantity < ci.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for: " + itemName);
                }

                // Update variant stock
                variant.setStockQuantity(stockQuantity - ci.getQuantity());
            } else {
                // Handle regular product (no variant)
                stockQuantity = product.getStockQuantity();
                itemName = product.getName();
                itemSku = product.getSku();

                if (stockQuantity == null || stockQuantity < ci.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for: " + itemName);
                }

                // Update product stock
                product.setStockQuantity(stockQuantity - ci.getQuantity());
            }

            BigDecimal lineTotal = ci.getPriceSnapshot().multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem oi = new OrderItem();
            oi.setProductId(product.getId());
            oi.setShopId(product.getShopId());
            oi.setProductName(itemName);
            oi.setProductSku(itemSku);
            oi.setUnitPrice(ci.getPriceSnapshot());
            oi.setQuantity(ci.getQuantity());
            oi.setTotalPrice(lineTotal);

            // Add variant information if exists
            if (ci.hasVariant() && ci.getVariantId() != null) {
                ProductVariant variant = lockedVariants.get(ci.getVariantId());
                if (variant != null) {
                    oi.setVariant(variant);
                    oi.setVariantSku(variant.getSku());
                    oi.setVariantTitle(variant.getDisplayName());
                }
            }

            orderItems.add(oi);
        }

        BigDecimal shipping = nz(req.shippingFee);
        BigDecimal tax = nz(req.taxAmount);
       
       BigDecimal total = subtotal.add(shipping).add(tax);
        if (total.signum() < 0) total = BigDecimal.ZERO;

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
         // กันพลาดให้มีค่าเสมอ แม้มี trigger/PrePersist แล้ว
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);
        order.setSubtotal(subtotal);
        order.setShippingFee(shipping);
        order.setTaxAmount(tax);
         // <- ฟิลด์นี้แม็ปกับ discount_total แล้วใน Entity
        order.setTotalAmount(total);
        order.setShippingAddress(req.shippingAddressJson);
        order.setBillingAddress(req.billingAddressJson);
        order.setNotes(req.notes);

        for (OrderItem oi : orderItems) {
            order.addItem(oi);
        }

        // Save updated stock quantities
        if (!lockedProducts.isEmpty()) {
            productRepository.saveAll(lockedProducts.values());
        }
        if (!lockedVariants.isEmpty()) {
            productVariantRepository.saveAll(lockedVariants.values());
        }

        orderRepository.save(order);
        cartItemRepository.deleteByCartId(cart.getId());

        return toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getById(Long orderId) {
        Order o = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return toDto(o);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> listByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    @Override
    public OrderDto updateStatus(Long orderId, String newStatus) {
        Order o = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        OrderStatus newOrderStatus = OrderStatus.fromString(newStatus);

        if (!o.getStatus().canTransitionTo(newOrderStatus)) {
            throw new IllegalStateException("Invalid status transition: " + o.getStatus() + " -> " + newOrderStatus);
        }

        o.setStatus(newOrderStatus);
        orderRepository.save(o);
        return toDto(o);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> listByShop(Long shopId, Pageable pageable) {
        return orderRepository.findByShopId(shopId, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> listByShopAndStatus(Long shopId, OrderStatus status, Pageable pageable) {
        return orderRepository.findByShopIdAndStatus(shopId, status, pageable)
                .map(this::toDto);
    }

    // -------- helpers --------
    private String generateOrderNumber() {
        String date = java.time.LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String rand = Integer.toHexString((int)(System.nanoTime() & 0xffff)).toUpperCase();
        return "ORD-" + date + "-" + rand;
    }

    private BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

    private OrderDto toDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.id = o.getId();
        dto.orderNumber = o.getOrderNumber();
        dto.userId = o.getUserId();

        // Fetch user information for seller
        if (o.getUserId() != null) {
            userRepository.findById(o.getUserId()).ifPresent(user -> {
                dto.userName = user.getUsername();
                dto.userEmail = user.getEmail();
            });
        }

        dto.status = o.getStatus().name();
        dto.subtotal = o.getSubtotal();
        dto.shippingFee = o.getShippingFee();
        dto.taxAmount = o.getTaxAmount();
         // อ่านจาก discount_total
        dto.totalAmount = o.getTotalAmount();
        dto.shippingAddressJson = o.getShippingAddress();
        dto.billingAddressJson = o.getBillingAddress();
        dto.notes = o.getNotes();
        dto.createdAt = o.getCreatedAt();


        dto.items = o.getItems().stream().map(oi -> {
            OrderDto.OrderItemDto x = new OrderDto.OrderItemDto();
            x.id = oi.getId();
            x.productId = oi.getProductId();
            x.shopId = oi.getShopId();
            x.productName = oi.getProductName();
            x.productSku = oi.getProductSku();
            x.unitPrice = oi.getUnitPrice();
            x.quantity = oi.getQuantity();
            x.totalPrice = oi.getTotalPrice();
            x.status = oi.getStatus();

            // Add variant information if exists
            if (oi.hasVariant()) {
                x.variantId = oi.getVariantId();
                x.variantSku = oi.getVariantSku();
                x.variantTitle = oi.getVariantTitle();
                // Get variant options from variant entity
                if (oi.getVariant() != null) {
                    x.variantOptions = oi.getVariant().getVariantOptions();
                }
            }

            return x;
        }).toList();

        // Map payments
        dto.payments = o.getPayments().stream().map(p -> {
            PaymentDto paymentDto = new PaymentDto();
            paymentDto.id = p.getId();
            paymentDto.paymentNumber = p.getPaymentNumber();
            paymentDto.orderId = p.getOrderId();
            paymentDto.paymentMethod = p.getPaymentMethod();
            paymentDto.paymentMethodDisplayName = p.getPaymentMethod() != null ? p.getPaymentMethod().getDisplayName() : null;
            paymentDto.status = p.getStatus();
            paymentDto.statusDisplayName = p.getStatus() != null ? p.getStatus().getDisplayName() : null;
            paymentDto.amount = p.getAmount();
            paymentDto.currency = p.getCurrency();
            paymentDto.gatewayTransactionId = p.getGatewayTransactionId();
            paymentDto.gatewayFee = p.getGatewayFee();
            paymentDto.failureReason = p.getFailureReason();
            paymentDto.createdAt = p.getCreatedAt();
            paymentDto.paidAt = p.getPaidAt();
            paymentDto.failedAt = p.getFailedAt();
            paymentDto.refundedAt = p.getRefundedAt();
            paymentDto.isCompleted = p.isCompleted();
            paymentDto.canRefund = p.canBeRefunded();
            return paymentDto;
        }).toList();

        return dto;
    }
}
