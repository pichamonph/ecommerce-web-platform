'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { ATTRIBUTE_LABELS, getAttributeOptions } from '@/config/variantTemplates';

interface VariantOption {
  [key: string]: string; // e.g., { color: "Red", size: "M" }
}

interface Variant {
  id?: number;
  sku: string;
  variantOptions: VariantOption;
  price: string;
  comparePrice?: string;
  stockQuantity: string;
  imageUrls?: string[];
}

interface VariantManagerProps {
  productName: string;
  basePrice: string;
  onVariantsChange: (variants: Variant[]) => void;
  initialVariants?: Variant[];
}

export default function VariantManager({
  productName,
  basePrice,
  onVariantsChange,
  initialVariants = []
}: VariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [customAttribute, setCustomAttribute] = useState('');

  // Sync with initialVariants when they change
  useEffect(() => {
    if (initialVariants.length > 0) {
      setVariants(initialVariants);

      // Extract attributes from existing variants
      const allAttributes = new Set<string>();
      initialVariants.forEach(v => {
        Object.keys(v.variantOptions).forEach(attr => allAttributes.add(attr));
      });

      if (allAttributes.size > 0) {
        setSelectedAttributes(Array.from(allAttributes));
      } else {
        setSelectedAttributes(['color', 'size']);
      }
    }
  }, [initialVariants]);

  // Available attributes
  const availableAttributes = ['color', 'size', 'storage', 'ram', 'material', 'format', 'language'];

  const addVariant = () => {
    const newVariant: Variant = {
      sku: '',
      variantOptions: {},
      price: basePrice || '0',
      stockQuantity: '0'
    };

    // Initialize variant options with empty values
    selectedAttributes.forEach(attr => {
      newVariant.variantOptions[attr] = '';
    });

    const updated = [...variants, newVariant];
    setVariants(updated);
    onVariantsChange(updated);
  };

  const removeVariant = (index: number) => {
    const variant = variants[index];
    console.log('Removing variant:', variant);
    const updated = variants.filter((_, i) => i !== index);
    console.log('Updated variants after remove:', updated);
    setVariants(updated);
    onVariantsChange(updated);
    console.log('onVariantsChange called with', updated.length, 'variants');
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    if (field === 'variantOptions') {
      updated[index].variantOptions = { ...updated[index].variantOptions, ...value };
    } else {
      (updated[index] as any)[field] = value;
    }
    setVariants(updated);
    onVariantsChange(updated);
  };

  const addAttribute = (attribute: string) => {
    if (!selectedAttributes.includes(attribute)) {
      const updated = [...selectedAttributes, attribute];
      setSelectedAttributes(updated);

      // Add empty value to all existing variants
      const updatedVariants = variants.map(v => ({
        ...v,
        variantOptions: { ...v.variantOptions, [attribute]: '' }
      }));
      setVariants(updatedVariants);
      onVariantsChange(updatedVariants);
    }
  };

  const removeAttribute = (attribute: string) => {
    const updated = selectedAttributes.filter(a => a !== attribute);
    setSelectedAttributes(updated);

    // Remove from all variants
    const updatedVariants = variants.map(v => {
      const { [attribute]: removed, ...rest } = v.variantOptions;
      return { ...v, variantOptions: rest };
    });
    setVariants(updatedVariants);
    onVariantsChange(updatedVariants);
  };

  const addCustomAttribute = () => {
    if (customAttribute.trim()) {
      addAttribute(customAttribute.trim().toLowerCase());
      setCustomAttribute('');
      setShowAddAttribute(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Attribute Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">คุณสมบัติของสินค้า (Attributes)</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedAttributes.map(attr => (
            <span
              key={attr}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {ATTRIBUTE_LABELS[attr] || attr}
              <button
                type="button"
                onClick={() => removeAttribute(attr)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {!showAddAttribute ? (
          <button
            type="button"
            onClick={() => setShowAddAttribute(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + เพิ่มคุณสมบัติ
          </button>
        ) : (
          <div className="flex gap-2">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addAttribute(e.target.value);
                  setShowAddAttribute(false);
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">เลือกคุณสมบัติ...</option>
              {availableAttributes
                .filter(attr => !selectedAttributes.includes(attr))
                .map(attr => (
                  <option key={attr} value={attr}>
                    {ATTRIBUTE_LABELS[attr] || attr}
                  </option>
                ))}
            </select>
            <input
              type="text"
              value={customAttribute}
              onChange={(e) => setCustomAttribute(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomAttribute()}
              placeholder="หรือพิมพ์เอง..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={addCustomAttribute}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              เพิ่ม
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddAttribute(false);
                setCustomAttribute('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              ยกเลิก
            </button>
          </div>
        )}
      </div>

      {/* Variants List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">รายการ Variants ({variants.length})</h4>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            เพิ่ม Variant
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">ยังไม่มี Variants</p>
            <p className="text-gray-400 text-xs mt-1">คลิก "เพิ่ม Variant" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="space-y-4">
            {variants.map((variant, index) => {
              const isExisting = !!variant.id;
              const variantLabel = Object.entries(variant.variantOptions)
                .map(([key, value]) => value)
                .filter(Boolean)
                .join(' / ') || `Variant #${index + 1}`;

              return (
                <div key={variant.id || index} className={`border rounded-lg p-4 ${isExisting ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-gray-900">{variantLabel}</h5>
                        {isExisting && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            มีอยู่แล้ว
                          </span>
                        )}
                      </div>
                      {variant.sku && (
                        <p className="text-xs text-gray-500 mt-1">SKU: {variant.sku}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                      title={isExisting ? 'ลบ variant (จะถูกลบเมื่อกดบันทึก)' : 'ลบ variant'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Variant Options */}
                  {selectedAttributes.map(attr => (
                    <div key={attr}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {ATTRIBUTE_LABELS[attr] || attr}
                      </label>
                      <input
                        type="text"
                        value={variant.variantOptions[attr] || ''}
                        onChange={(e) => updateVariant(index, 'variantOptions', {
                          [attr]: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder={`เช่น ${getAttributeOptions(attr)[0] || '...'}`}
                        list={`${attr}-options`}
                      />
                      <datalist id={`${attr}-options`}>
                        {getAttributeOptions(attr).map(opt => (
                          <option key={opt} value={opt} />
                        ))}
                      </datalist>
                    </div>
                  ))}

                  {/* SKU */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="PROD-VAR-001"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">สต็อก</label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stockQuantity}
                      onChange={(e) => updateVariant(index, 'stockQuantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ราคา (฿)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Compare Price */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      ราคาเปรียบเทียบ (฿)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.comparePrice || ''}
                      onChange={(e) => updateVariant(index, 'comparePrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
