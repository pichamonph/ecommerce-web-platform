'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopService, Shop } from '@/lib/shop';
import { useAuth } from './AuthContext';

interface ShopContextType {
  shop: Shop | null;
  loading: boolean;
  hasShop: boolean;
  refreshShop: () => Promise<void>;
  createShop: (data: { name: string; description?: string; logoUrl?: string }) => Promise<Shop>;
  updateShop: (id: number, data: { name?: string; description?: string; logoUrl?: string }) => Promise<Shop>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { user, isSeller } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShop = async () => {
    if (!isSeller) {
      setShop(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get all shops and find seller's shop
      const shops = await shopService.getAll();
      const myShop = shops.find(s => s.ownerId === user?.id);
      setShop(myShop || null);
    } catch (error) {
      console.error('Failed to fetch shop:', error);
      setShop(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, [isSeller, user?.id]);

  const createShop = async (data: { name: string; description?: string; logoUrl?: string }) => {
    const newShop = await shopService.create(data);
    setShop(newShop);
    return newShop;
  };

  const updateShop = async (id: number, data: { name?: string; description?: string; logoUrl?: string }) => {
    const updatedShop = await shopService.update(id, data);
    setShop(updatedShop);
    return updatedShop;
  };

  const value: ShopContextType = {
    shop,
    loading,
    hasShop: !!shop,
    refreshShop: fetchShop,
    createShop,
    updateShop,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
