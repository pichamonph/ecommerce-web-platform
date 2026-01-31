'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Product,
  ProductVariant,
  VariantSelection,
  VariantSelectionState,
  VariantOption
} from '@/types/product';

export function useVariantSelection(product: Product) {
  const [selectedOptions, setSelectedOptions] = useState<VariantSelection>({});

  // Extract available variant options from product variants
  const availableOptions: VariantOption[] = useMemo(() => {
    if (!product.hasVariants || !product.variants) {
      return [];
    }

    const optionsMap = new Map<string, Set<string>>();

    // Collect all unique option keys and values
    product.variants.forEach(variant => {
      Object.entries(variant.variantOptions).forEach(([key, value]) => {
        if (!optionsMap.has(key)) {
          optionsMap.set(key, new Set());
        }
        optionsMap.get(key)!.add(value);
      });
    });

    // Convert to VariantOption array
    return Array.from(optionsMap.entries()).map(([key, valuesSet]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      values: Array.from(valuesSet).sort()
    }));
  }, [product]);

  // Find matching variant based on selected options
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!product.hasVariants || !product.variants) {
      return undefined;
    }

    return product.variants.find(variant => {
      return Object.entries(selectedOptions).every(
        ([key, value]) => variant.variantOptions[key] === value
      );
    });
  }, [product.variants, selectedOptions]);

  // Check if current selection is valid (has matching variant)
  const isValidSelection = useMemo(() => {
    if (!product.hasVariants) {
      return true; // Regular product without variants
    }

    // Check if all required options are selected
    const requiredOptions = availableOptions.map(opt => opt.key);
    const selectedKeys = Object.keys(selectedOptions);

    const allRequiredSelected = requiredOptions.every(key =>
      selectedKeys.includes(key) && selectedOptions[key]
    );

    return allRequiredSelected && !!selectedVariant;
  }, [availableOptions, selectedOptions, selectedVariant, product.hasVariants]);

  // Calculate effective price
  const effectivePrice = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.effectivePrice || selectedVariant.price;
    }
    return product.price;
  }, [selectedVariant, product.price]);

  // Calculate effective stock
  const effectiveStock = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.stockQuantity;
    }
    return product.stockQuantity;
  }, [selectedVariant, product.stockQuantity]);

  // Check availability
  const isAvailable = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.available && selectedVariant.stockQuantity > 0;
    }
    return product.stockQuantity > 0;
  }, [selectedVariant, product.stockQuantity]);

  // Get options that are still available based on current selection
  const getAvailableOptionValues = (optionKey: string): string[] => {
    if (!product.hasVariants || !product.variants) {
      return [];
    }

    // Filter variants that match current selection (except for the option we're checking)
    const otherSelectedOptions = Object.fromEntries(
      Object.entries(selectedOptions).filter(([key]) => key !== optionKey)
    );

    const compatibleVariants = product.variants.filter(variant => {
      return Object.entries(otherSelectedOptions).every(
        ([key, value]) => variant.variantOptions[key] === value
      );
    });

    // Get unique values for this option from compatible variants
    const availableValues = new Set<string>();
    compatibleVariants.forEach(variant => {
      const value = variant.variantOptions[optionKey];
      if (value && variant.available) {
        availableValues.add(value);
      }
    });

    return Array.from(availableValues).sort();
  };

  // Update selected options
  const updateOption = (optionKey: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedOptions({});
  };

  // Auto-select first available option if only one choice
  useEffect(() => {
    if (!product.hasVariants || availableOptions.length === 0) {
      return;
    }

    availableOptions.forEach(option => {
      if (!selectedOptions[option.key] && option.values.length === 1) {
        updateOption(option.key, option.values[0]);
      }
    });
  }, [availableOptions, selectedOptions, product.hasVariants]);

  const state: VariantSelectionState = {
    selectedOptions,
    selectedVariant,
    availableOptions,
    isValidSelection,
    price: effectivePrice,
    stockQuantity: effectiveStock,
    available: isAvailable
  };

  return {
    state,
    updateOption,
    clearSelection,
    getAvailableOptionValues
  };
}