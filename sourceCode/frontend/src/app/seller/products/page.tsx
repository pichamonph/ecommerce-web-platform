'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/contexts/ShopContext';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  DollarSign,
  Box,
  TrendingDown,
  Eye,
  Settings
} from 'lucide-react';
import api from '@/lib/api';
import VariantManager from '@/components/seller/VariantManager';
import ImageUpload from '@/components/ImageUpload';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  images?: { id: number; url: string }[];
  categoryId?: number;
  sku?: string;
  comparePrice?: number;
  status?: string;
  hasVariants?: boolean;
  totalStock?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  sku: string;
  stockQuantity: string;
  categoryId: string;
  status: string;
  imageUrls: string[];
  hasVariants: boolean;
  variants: ProductVariant[];
}

interface ProductVariant {
  id?: number;
  sku: string;
  variantOptions: Record<string, string>;
  price: string;
  comparePrice?: string;
  stockQuantity: string;
  imageUrls?: string[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  path?: string;
  isActive: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const { shop, loading: shopLoading } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    sku: '',
    stockQuantity: '0',
    categoryId: '',
    status: 'active',
    imageUrls: [''],
    hasVariants: false,
    variants: []
  });
  const [managingVariants, setManagingVariants] = useState<Product | null>(null);
  const [existingVariants, setExistingVariants] = useState<ProductVariant[]>([]);
  const [initialVariants, setInitialVariants] = useState<ProductVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!shopLoading && shop) {
      fetchProducts();
    }
  }, [shop, shopLoading]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price.toString(),
        comparePrice: editingProduct.comparePrice?.toString() || '',
        sku: editingProduct.sku || '',
        stockQuantity: editingProduct.stockQuantity.toString(),
        categoryId: editingProduct.categoryId?.toString() || '',
        status: editingProduct.status || 'active',
        imageUrls: editingProduct.images?.map(img => img.url) || [''],
        hasVariants: false,
        variants: []
      });
    }
  }, [editingProduct]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products?shopId=${shop?.id}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?size=100');
      // Filter only active categories
      const activeCategories = response.data.content.filter((c: Category) => c.isActive);
      setCategories(activeCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    setError('');

    try {
      await api.delete(`/products/${deletingProduct.id}`);
      setSuccess(`ลบสินค้า "${deletingProduct.name}" สำเร็จ`);
      setDeletingProduct(null);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = 'ไม่สามารถลบสินค้าได้';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSubmitting(true);
    setError('');

    try {
      // Validate
      if (!formData.name.trim()) {
        setError('กรุณาระบุชื่อสินค้า');
        setSubmitting(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError('กรุณาระบุราคาที่ถูกต้อง');
        setSubmitting(false);
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        sku: formData.sku.trim() || null,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        status: formData.status,
        images: formData.imageUrls
          .filter(url => url.trim() !== '')
          .map((url, index) => ({
            url: url,
            sortOrder: index
          }))
      };

      await api.put(`/products/${editingProduct.id}`, updateData);
      setSuccess('แก้ไขสินค้าสำเร็จ');
      setEditingProduct(null);
      resetForm();
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = 'ไม่สามารถแก้ไขสินค้าได้';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate
      if (!formData.name.trim()) {
        setError('กรุณาระบุชื่อสินค้า');
        setSubmitting(false);
        return;
      }

      // Validate based on whether product has variants
      if (formData.hasVariants) {
        // Validate variants
        if (formData.variants.length === 0) {
          setError('กรุณาเพิ่ม Variant อย่างน้อย 1 รายการ');
          setSubmitting(false);
          return;
        }

        // Validate each variant
        for (let i = 0; i < formData.variants.length; i++) {
          const variant = formData.variants[i];
          if (!variant.price || parseFloat(variant.price) <= 0) {
            setError(`กรุณาระบุราคาสำหรับ Variant #${i + 1}`);
            setSubmitting(false);
            return;
          }
          if (Object.keys(variant.variantOptions).length === 0) {
            setError(`กรุณาระบุคุณสมบัติสำหรับ Variant #${i + 1}`);
            setSubmitting(false);
            return;
          }
        }
      } else {
        // Validate regular product
        if (!formData.price || parseFloat(formData.price) <= 0) {
          setError('กรุณาระบุราคาที่ถูกต้อง');
          setSubmitting(false);
          return;
        }
      }

      // Step 1: Create base product
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        sku: formData.sku.trim() || null,
        stockQuantity: formData.hasVariants ? 0 : (parseInt(formData.stockQuantity) || 0),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        status: formData.status,
        imageUrls: formData.imageUrls.filter(url => url.trim() !== '')
      };

      const productResponse = await api.post('/products', productData);
      const createdProduct = productResponse.data;

      // Step 2: Create variants if needed
      if (formData.hasVariants && formData.variants.length > 0) {
        const variantPromises = formData.variants.map(async (variant) => {
          const variantData = {
            sku: variant.sku || null,
            variantOptions: variant.variantOptions,
            price: parseFloat(variant.price),
            comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
            stockQuantity: parseInt(variant.stockQuantity) || 0,
            status: 'active',
            imageUrls: variant.imageUrls?.filter(url => url.trim() !== '') || []
          };

          return api.post(`/products/${createdProduct.id}/variants`, variantData);
        });

        // Wait for all variants to be created
        await Promise.all(variantPromises);
        setSuccess(`เพิ่มสินค้าพร้อม ${formData.variants.length} Variants สำเร็จ`);
      } else {
        setSuccess('เพิ่มสินค้าสำเร็จ');
      }

      setShowAddModal(false);
      resetForm();
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = 'ไม่สามารถเพิ่มสินค้าได้';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      sku: '',
      stockQuantity: '0',
      categoryId: '',
      status: 'active',
      imageUrls: [''],
      hasVariants: false,
      variants: []
    });
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, '']
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const updateImageUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleManageVariants = async (product: Product) => {
    setManagingVariants(product);
    setLoadingVariants(true);
    try {
      const response = await api.get(`/products/${product.id}/variants`);
      const variants = response.data.map((v: any) => ({
        id: v.id,
        sku: v.sku || '',
        variantOptions: v.variantOptions || {},
        price: v.price?.toString() || '0',
        comparePrice: v.comparePrice?.toString() || '',
        stockQuantity: v.stockQuantity?.toString() || '0',
        imageUrls: v.imageUrls || []
      }));
      setExistingVariants(variants);
      setInitialVariants(JSON.parse(JSON.stringify(variants))); // Deep copy for delete comparison
      console.log('Loaded variants:', variants);
    } catch (error) {
      console.error('Failed to fetch variants:', error);
      setError('ไม่สามารถโหลด Variants ได้');
      setInitialVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleSaveVariants = async (variants: ProductVariant[]) => {
    if (!managingVariants) return;

    setSubmitting(true);
    setError('');

    try {
      // Delete removed variants (compare with initial state, not current state)
      const initialIds = initialVariants.filter(v => v.id).map(v => v.id);
      const newIds = variants.filter(v => v.id).map(v => v.id);
      const deletedIds = initialIds.filter(id => !newIds.includes(id));

      console.log('Initial IDs (ตอนเปิด modal):', initialIds);
      console.log('New IDs (ตอนกดบันทึก):', newIds);
      console.log('Deleted IDs (จะถูกลบ):', deletedIds);

      for (const id of deletedIds) {
        console.log(`Deleting variant ${id}...`);
        await api.delete(`/products/variants/${id}`);
        console.log(`Variant ${id} deleted successfully`);
      }

      // Create or update variants
      for (const variant of variants) {
        const variantData = {
          sku: variant.sku || null,
          variantOptions: variant.variantOptions,
          price: parseFloat(variant.price),
          comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
          stockQuantity: parseInt(variant.stockQuantity) || 0,
          status: 'active',
          imageUrls: variant.imageUrls?.filter(url => url.trim() !== '') || []
        };

        if (variant.id) {
          // Update existing variant
          console.log(`Updating variant ${variant.id}...`);
          await api.put(`/products/variants/${variant.id}`, variantData);
        } else {
          // Create new variant
          console.log(`Creating new variant...`);
          await api.post(`/products/${managingVariants.id}/variants`, variantData);
        }
      }

      setSuccess(`บันทึก ${variants.length} Variants สำเร็จ${deletedIds.length > 0 ? `, ลบ ${deletedIds.length} รายการ` : ''}`);
      setManagingVariants(null);
      setExistingVariants([]);
      setInitialVariants([]);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = 'ไม่สามารถบันทึก Variants ได้';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      setError(errorMessage);
      console.error('Error saving variants:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (shopLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shop) {
    router.push('/seller/create-shop');
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">จัดการสินค้า</h1>
            <p className="text-white/80 text-sm">จัดการสินค้าในร้านค้าของคุณ</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            เพิ่มสินค้าใหม่
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 pb-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">สินค้าทั้งหมด</p>
                  <p className="text-xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Box className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">มีสต็อก</p>
                  <p className="text-xl font-bold text-gray-900">
                    {products.filter((p) => {
                      const stock = p.hasVariants ? (p.totalStock || 0) : p.stockQuantity;
                      return stock > 0;
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">สต็อกน้อย</p>
                  <p className="text-xl font-bold text-gray-900">
                    {products.filter((p) => {
                      const stock = p.hasVariants ? (p.totalStock || 0) : p.stockQuantity;
                      return stock < 10 && stock > 0;
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">หมดสต็อก</p>
                  <p className="text-xl font-bold text-gray-900">
                    {products.filter((p) => {
                      const stock = p.hasVariants ? (p.totalStock || 0) : p.stockQuantity;
                      return stock === 0;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ค้นหาสินค้า..."
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีสินค้า</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'ไม่พบสินค้าที่ตรงกับเงื่อนไข' : 'เริ่มต้นเพิ่มสินค้าเพื่อเริ่มขายกันเลย'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    เพิ่มสินค้าแรก
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        สินค้า
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        หมวดหมู่
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ราคา
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        สต็อก
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={getImageUrl(product.images[0].url)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description || 'ไม่มีคำอธิบาย'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {product.categoryId
                              ? categories.find(c => c.id === product.categoryId)?.name || '-'
                              : '-'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            {product.hasVariants && product.minPrice !== product.maxPrice ? (
                              <span className="font-semibold text-gray-900">
                                ฿{product.minPrice?.toLocaleString()} - ฿{product.maxPrice?.toLocaleString()}
                              </span>
                            ) : (
                              <span className="font-semibold text-gray-900">
                                ฿{product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const stock = product.hasVariants ? (product.totalStock || 0) : product.stockQuantity;
                            return (
                              <div>
                                <span
                                  className={`font-medium ${
                                    stock === 0
                                      ? 'text-red-600'
                                      : stock < 10
                                      ? 'text-orange-600'
                                      : 'text-green-600'
                                  }`}
                                >
                                  {stock}
                                </span>
                                {product.hasVariants && (
                                  <span className="ml-1 text-xs text-gray-500">(รวม)</span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const stock = product.hasVariants ? (product.totalStock || 0) : product.stockQuantity;
                            return (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  stock === 0
                                    ? 'bg-red-100 text-red-800'
                                    : stock < 10
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {stock === 0
                                  ? 'หมดสต็อก'
                                  : stock < 10
                                  ? 'สต็อกน้อย'
                                  : 'มีสต็อก'}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/products/${product.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ดูสินค้า"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleManageVariants(product)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="จัดการ Variants"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="แก้ไข"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(product)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manage Variants Modal */}
      {managingVariants && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">จัดการ Variants - {managingVariants.name}</h2>
              <p className="text-purple-100 text-sm mt-1">เพิ่ม แก้ไข หรือลบ Variants ของสินค้า</p>
            </div>

            <div className="p-6">
              {loadingVariants ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <>
                  <VariantManager
                    productName={managingVariants.name}
                    basePrice={managingVariants.price.toString()}
                    onVariantsChange={(variants) => setExistingVariants(variants)}
                    initialVariants={existingVariants}
                  />

                  <div className="flex gap-3 pt-6 border-t mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setManagingVariants(null);
                        setExistingVariants([]);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                      disabled={submitting}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveVariants(existingVariants)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">แก้ไขสินค้า</h2>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="เช่น เสื้อยืดสีขาว"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="รายละเอียดสินค้า"
                  rows={3}
                />
              </div>

              {/* Price & Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคา (฿) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคาเปรียบเทียบ (฿)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, comparePrice: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่สินค้า
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">ไม่ระบุหมวดหมู่</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.path ? category.path : category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="เช่น TSHIRT-WHT-M"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนสต็อก
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="active">เปิดขาย</option>
                  <option value="inactive">ปิดขาย</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพสินค้า</label>
                <div className="space-y-3">
                  {formData.imageUrls.map((url, index) => (
                    <ImageUpload
                      key={index}
                      value={url}
                      onChange={(newUrl) => updateImageUrl(index, newUrl)}
                      onRemove={formData.imageUrls.length > 1 ? () => removeImageUrl(index) : undefined}
                      canRemove={formData.imageUrls.length > 1}
                      type="product"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-orange-600 hover:text-orange-700 hover:border-orange-500 font-medium transition-colors"
                  >
                    + เพิ่มรูปภาพ
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                  disabled={submitting}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">ยืนยันการลบสินค้า</h2>
                  <p className="text-red-100 text-sm mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {deletingProduct.images && deletingProduct.images.length > 0 ? (
                      <img
                        src={getImageUrl(deletingProduct.images[0].url)}
                        alt={deletingProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{deletingProduct.name}</h3>
                    <p className="text-sm text-gray-600">
                      ราคา: ฿{deletingProduct.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      สต็อก: {deletingProduct.hasVariants ? (deletingProduct.totalStock || 0) : deletingProduct.stockQuantity} ชิ้น
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">
                      คุณกำลังจะลบสินค้านี้ออกจากระบบ
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• ข้อมูลสินค้าจะถูกลบอย่างถาวร</li>
                      <li>• ลูกค้าจะไม่สามารถมองเห็นสินค้านี้ได้</li>
                      {deletingProduct.hasVariants && (
                        <li>• Variants ทั้งหมดจะถูกลบด้วย</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                  disabled={isDeleting}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      กำลังลบ...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      ลบสินค้า
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">เพิ่มสินค้าใหม่</h2>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="เช่น เสื้อยืดสีขาว"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="รายละเอียดสินค้า"
                  rows={3}
                />
              </div>

              {/* Price & Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคา (฿) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคาเปรียบเทียบ (฿)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, comparePrice: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่สินค้า
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">ไม่ระบุหมวดหมู่</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.path ? category.path : category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น TSHIRT-WHT-M"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนสต็อก
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">เปิดขาย</option>
                  <option value="inactive">ปิดขาย</option>
                </select>
              </div>

              {/* Variants Toggle */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">สินค้ามีหลายตัวเลือก (Variants)?</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      เช่น สี, ไซส์, ความจุ - เหมาะสำหรับเสื้อผ้า, อิเล็กทรอนิกส์
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasVariants}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasVariants: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Variant Manager */}
              {formData.hasVariants && (
                <div className="border-2 border-blue-200 rounded-lg p-4">
                  <VariantManager
                    productName={formData.name}
                    basePrice={formData.price}
                    onVariantsChange={(variants) => setFormData(prev => ({ ...prev, variants }))}
                    initialVariants={formData.variants}
                  />
                  <p className="text-xs text-gray-500 mt-3">
                    💡 เมื่อมี Variants แล้ว ราคาและสต็อกจะใช้จาก Variants แทนค่าด้านบน
                  </p>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพสินค้า</label>
                <div className="space-y-3">
                  {formData.imageUrls.map((url, index) => (
                    <ImageUpload
                      key={index}
                      value={url}
                      onChange={(newUrl) => updateImageUrl(index, newUrl)}
                      onRemove={formData.imageUrls.length > 1 ? () => removeImageUrl(index) : undefined}
                      canRemove={formData.imageUrls.length > 1}
                      type="product"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-orange-600 hover:text-orange-700 hover:border-orange-500 font-medium transition-colors"
                  >
                    + เพิ่มรูปภาพ
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                  disabled={submitting}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
