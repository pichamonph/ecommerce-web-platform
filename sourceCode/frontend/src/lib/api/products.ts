// Product and Product Variant API functions

import {
  Product,
  ProductVariant,
  CreateVariantRequest,
  UpdateVariantRequest,
  VariantOptionsResponse
} from '@/types/product';

const API_BASE_URL = 'http://localhost:8080/api';

// Product APIs
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function fetchProduct(productId: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product ${productId}`);
  }
  return response.json();
}

// Product Variant APIs
export async function fetchProductVariants(
  productId: number,
  activeOnly: boolean = true
): Promise<ProductVariant[]> {
  const url = `${API_BASE_URL}/products/${productId}/variants${activeOnly ? '?activeOnly=true' : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch variants for product ${productId}`);
  }
  return response.json();
}

export async function fetchVariantById(variantId: number): Promise<ProductVariant> {
  const response = await fetch(`${API_BASE_URL}/variants/${variantId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch variant ${variantId}`);
  }
  return response.json();
}

export async function createProductVariant(
  productId: number,
  variantData: CreateVariantRequest
): Promise<ProductVariant> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/variants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variantData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to create variant: ${errorData}`);
  }

  return response.json();
}

export async function updateProductVariant(
  variantId: number,
  variantData: Partial<UpdateVariantRequest>
): Promise<ProductVariant> {
  const response = await fetch(`${API_BASE_URL}/variants/${variantId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variantData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to update variant: ${errorData}`);
  }

  return response.json();
}

export async function deleteProductVariant(variantId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/variants/${variantId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete variant ${variantId}`);
  }
}

// Variant Options APIs
export async function fetchVariantOptions(productId: number): Promise<VariantOptionsResponse> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/variant-options`);
  if (!response.ok) {
    throw new Error(`Failed to fetch variant options for product ${productId}`);
  }
  return response.json();
}

export async function searchVariantsByOptions(
  productId: number,
  options: Record<string, string>
): Promise<ProductVariant[]> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/variants/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Failed to search variants for product ${productId}`);
  }

  return response.json();
}

// Utility function to get product with variants
export async function fetchProductWithVariants(productId: number): Promise<Product> {
  try {
    const product = await fetchProduct(productId);

    // Try to fetch variants, but don't fail if it doesn't work
    let variants: ProductVariant[] = [];
    try {
      variants = await fetchProductVariants(productId, true);
    } catch (variantError) {
      console.warn(`Failed to fetch variants for product ${productId}:`, variantError);
      // Continue with empty variants array
    }

    return {
      ...product,
      variants,
      hasVariants: variants.length > 0,
      minPrice: variants.length > 0 ? Math.min(...variants.map(v => v.price)) : product.price,
      maxPrice: variants.length > 0 ? Math.max(...variants.map(v => v.price)) : product.price,
      totalStock: variants.length > 0 ? variants.reduce((sum, v) => sum + v.stockQuantity, 0) : product.stockQuantity
    };
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    throw error;
  }
}