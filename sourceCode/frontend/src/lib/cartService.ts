import { AddToCartRequest } from '@/types/product'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

export interface CartResponse {
  id?: number
  cartId?: number
  data?: {
    id: number
  }
}

export class CartService {
  static async addToCart(request: AddToCartRequest, userId: number = 1): Promise<void> {
    console.log('CartService: Starting addToCart with request:', request, 'userId:', userId)

    // First, get the user's cart
    console.log('CartService: Fetching cart for user:', userId)
    const cartRes = await fetch(`${API_BASE}/cart?userId=${userId}`, { cache: 'no-store' })
    if (!cartRes.ok) {
      console.log('CartService: Failed to fetch cart:', cartRes.status)
      throw new Error(`โหลดตะกร้าไม่สำเร็จ: ${cartRes.status}`)
    }

    const cart: CartResponse = await cartRes.json()
    console.log('CartService: Cart response:', cart)
    const cartId = cart?.id || cart?.cartId || cart?.data?.id

    if (!cartId) {
      console.log('CartService: No cartId found in response')
      throw new Error('ไม่พบ cartId จาก API')
    }

    // Prepare the JSON payload for @RequestBody
    const payload = {
      productId: request.productId,
      quantity: request.quantity,
      ...(request.variantId && { variantId: request.variantId })
    }

    console.log('CartService: Adding to cart with payload:', payload, 'cartId:', cartId)

    // Add item to cart - cartId as query param, payload as JSON body
    const addRes = await fetch(`${API_BASE}/cart/items?cartId=${cartId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!addRes.ok) {
      const text = await addRes.text()
      console.log('CartService: Failed to add to cart:', addRes.status, text)
      throw new Error(`เพิ่มสินค้าไม่สำเร็จ: ${addRes.status} ${text}`)
    }

    console.log('CartService: Successfully added to cart')
  }

  static async addToCartJSON(request: AddToCartRequest, userId: number = 1): Promise<void> {
    // Alternative method using JSON instead of form data
    // First, get the user's cart
    const cartRes = await fetch(`${API_BASE}/cart?userId=${userId}`, { cache: 'no-store' })
    if (!cartRes.ok) {
      throw new Error(`โหลดตะกร้าไม่สำเร็จ: ${cartRes.status}`)
    }

    const cart: CartResponse = await cartRes.json()
    const cartId = cart?.id || cart?.cartId || cart?.data?.id

    if (!cartId) {
      throw new Error('ไม่พบ cartId จาก API')
    }

    // Prepare the JSON payload
    const payload = {
      cartId,
      productId: request.productId,
      quantity: request.quantity,
      ...(request.variantId && { variantId: request.variantId })
    }

    // Add item to cart
    const addRes = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!addRes.ok) {
      const text = await addRes.text()
      throw new Error(`เพิ่มสินค้าไม่สำเร็จ: ${addRes.status} ${text}`)
    }
  }
}