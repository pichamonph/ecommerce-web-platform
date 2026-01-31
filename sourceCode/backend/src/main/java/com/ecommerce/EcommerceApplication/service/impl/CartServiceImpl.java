package com.ecommerce.EcommerceApplication.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.entity.ProductVariant;
import com.ecommerce.EcommerceApplication.repository.CartItemRepository;
import com.ecommerce.EcommerceApplication.repository.CartRepository;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.repository.ProductVariantRepository;
import com.ecommerce.EcommerceApplication.service.CartService;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            ProductVariantRepository variantRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @Override
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(new Cart(userId)));
    }
    @Override
    @Transactional(readOnly = true)
    public Cart getCart(Long cartId) {
    return cartRepository.findById(cartId)
        .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
}

    @Override
    @Transactional(readOnly = true)
    public List<CartItem> listItems(Long cartId) {
        return cartItemRepository.findByCartIdWithDetails(cartId);
    }

    @Override
    public CartItem addItem(Long cartId, Long productId, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be > 0");

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // ถ้ามีอยู่แล้ว → บวกจำนวน
        CartItem item = cartItemRepository.findByCartIdAndProductId(cartId, productId).orElse(null);
        if (item != null) {
            item.setQuantity(item.getQuantity() + quantity);
            return cartItemRepository.save(item);
        }

        // เพิ่มใหม่
        CartItem newItem = new CartItem();
        newItem.setCart(cart);
        newItem.setProduct(product);
        newItem.setQuantity(quantity);
        BigDecimal snapshot = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
        newItem.setPriceSnapshot(snapshot);

        return cartItemRepository.save(newItem);
    }

    @Override
    public CartItem addItemWithVariant(Long cartId, Long productId, Long variantId, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be > 0");

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Product variant not found"));

        // Check if variant belongs to the product
        if (!variant.getProductId().equals(productId)) {
            throw new IllegalArgumentException("Variant does not belong to the specified product");
        }

        // Check if variant is available
        if (!variant.isAvailable()) {
            throw new IllegalArgumentException("Product variant is not available");
        }

        // Check stock availability
        if (variant.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for variant: " + variant.getDisplayName());
        }

        // Check if same variant already exists in cart
        CartItem existingItem = cartItemRepository.findByCartIdAndVariantId(cartId, variantId).orElse(null);
        if (existingItem != null) {
            // Check if combined quantity exceeds stock
            int totalQuantity = existingItem.getQuantity() + quantity;
            if (variant.getStockQuantity() < totalQuantity) {
                throw new IllegalArgumentException("Insufficient stock. Available: " + variant.getStockQuantity() +
                    ", Requested: " + totalQuantity);
            }
            existingItem.setQuantity(totalQuantity);
            return cartItemRepository.save(existingItem);
        }

        // Create new cart item with variant
        CartItem newItem = new CartItem();
        newItem.setCart(cart);
        newItem.setProduct(product);
        newItem.setVariant(variant);
        newItem.setQuantity(quantity);

        // Use variant's effective price for price snapshot
        BigDecimal snapshot = variant.getEffectivePrice();
        newItem.setPriceSnapshot(snapshot);

        return cartItemRepository.save(newItem);
    }

    @Override
    public CartItem updateItem(Long cartId, Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        // Security check: verify the item belongs to the specified cart
        if (!item.getCart().getId().equals(cartId)) {
            throw new IllegalArgumentException("Cart item does not belong to the specified cart");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null; // หรือ return item ก่อนลบตามการใช้งาน
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Override
    public boolean removeItem(Long cartId, Long itemId) {  // ✅ ซิงก์กับ interface
        long affected = cartItemRepository.deleteByIdAndCartId(itemId, cartId);
        return affected > 0;
    }

    @Override
    public boolean clearCart(Long cartId) {
        cartItemRepository.deleteByCartId(cartId);
        return true;
    }
}
