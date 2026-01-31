// Product and Product Variant Types for Frontend

export interface ProductVariantImage {
  id: number;
  variantId: number;
  imageUrl: string;
  altText?: string;
  position: number;
  createdAt: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  variantTitle: string;
  variantOptions: Record<string, string>; // { color: "Red", size: "M", storage: "128GB" }
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  weightGram?: number;
  status: 'active' | 'inactive' | 'draft';
  position: number;
  createdAt: string;
  updatedAt: string;
  images: ProductVariantImage[];

  // Computed fields from backend
  available: boolean;
  displayName: string;
  effectivePrice: number;
}

export interface Product {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stockQuantity: number;
  weightGram?: number;
  status: 'active' | 'inactive' | 'draft';
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  images: any[]; // You can define ProductImage type if needed

  // Variant-related fields
  variants?: ProductVariant[];
  hasVariants: boolean;
  minPrice?: number;
  maxPrice?: number;
  totalStock?: number;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  hasVariants: true;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
}

// Variant selection and management types
export interface VariantOption {
  key: string;
  label: string;
  values: string[];
}

export interface VariantSelection {
  [optionKey: string]: string;
}

export interface VariantSelectionState {
  selectedOptions: VariantSelection;
  selectedVariant?: ProductVariant;
  availableOptions: VariantOption[];
  isValidSelection: boolean;
  price: number;
  stockQuantity: number;
  available: boolean;
}

// Cart integration types
export interface AddToCartRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  variantId?: number;
  variantSku?: string;
  variantTitle?: string;
  effectiveSku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

// API response types
export interface VariantOptionsResponse {
  [optionKey: string]: string[];
}

export interface CreateVariantRequest {
  sku: string;
  variantTitle: string;
  variantOptions: Record<string, string>;
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  weightGram?: number;
  status: 'active' | 'inactive' | 'draft';
  position?: number;
}

export interface UpdateVariantRequest extends Partial<CreateVariantRequest> {
  id: number;
}