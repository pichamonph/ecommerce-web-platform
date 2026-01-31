import api from '../api';

export interface WishlistItem {
  id: number;
  userId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    comparePrice?: number;
    stockQuantity?: number;
    images?: { url: string }[];
    status?: string;
  };
}

export const wishlistApi = {
  // Toggle wishlist (add/remove in one call)
  toggle: async (productId: number) => {
    const response = await api.post(`/wishlist/toggle?productId=${productId}`);
    return response.data;
  },

  // Check if product is in wishlist
  check: async (productId: number): Promise<boolean> => {
    const response = await api.get(`/wishlist/check?productId=${productId}`);
    return response.data.isInWishlist;
  },

  // Get user's wishlist
  getWishlist: async (page = 0, size = 20) => {
    const response = await api.get(`/wishlist?page=${page}&size=${size}`);
    return response.data;
  },

  // Get wishlist count
  getCount: async (): Promise<number> => {
    const response = await api.get('/wishlist/count');
    return response.data.count;
  },

  // Add to wishlist
  add: async (productId: number) => {
    const response = await api.post(`/wishlist/add?productId=${productId}`);
    return response.data;
  },

  // Remove from wishlist
  remove: async (productId: number) => {
    await api.delete(`/wishlist/remove?productId=${productId}`);
  },
};
