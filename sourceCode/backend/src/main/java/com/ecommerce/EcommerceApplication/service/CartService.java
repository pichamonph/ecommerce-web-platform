package com.ecommerce.EcommerceApplication.service;

import java.util.List;

import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;

public interface CartService {
    Cart getOrCreateCart(Long userId);
    List<CartItem> listItems(Long cartId);
    CartItem addItem(Long cartId, Long productId, int quantity);
    CartItem addItemWithVariant(Long cartId, Long productId, Long variantId, int quantity);
    CartItem updateItem(Long cartId, Long itemId, int quantity);
    boolean removeItem(Long cartId, Long itemId);
    boolean clearCart(Long cartId);
    Cart getCart(Long cartId);

}
