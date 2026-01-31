import api from './api';

export interface Shop {
  id: number;
  ownerId: number;
  name: string;
  description?: string;
  logoUrl?: string;
  status: string;
}

export interface CreateShopData {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateShopData {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export const shopService = {
  // Get all active shops
  async getAll(): Promise<Shop[]> {
    const response = await api.get<Shop[]>('/shops');
    return response.data;
  },

  // Get shop by ID
  async getById(id: number): Promise<Shop> {
    const response = await api.get<Shop>(`/shops/${id}`);
    return response.data;
  },

  // Create shop (seller only)
  async create(data: CreateShopData): Promise<Shop> {
    const response = await api.post<Shop>('/seller/shops', data);
    return response.data;
  },

  // Update shop (seller/admin)
  async update(id: number, data: UpdateShopData): Promise<Shop> {
    const response = await api.put<Shop>(`/seller/shops/${id}`, data);
    return response.data;
  },

  // Get current seller's shop
  async getMyShop(): Promise<Shop | null> {
    try {
      // Fetch all shops and find the one owned by current user
      // Note: Backend doesn't have a direct "my shop" endpoint
      // We'll need to implement this differently
      const response = await api.get<Shop[]>('/shops');
      // For now, return the first shop (assuming seller has only one shop)
      // This is a workaround - ideally backend should provide /seller/shops/me
      return response.data[0] || null;
    } catch (error) {
      return null;
    }
  },
};
