"use client";
import React, { useState, forwardRef, useImperativeHandle } from "react";
import EditPriceModal, { Product } from "@/components/SCT/ProductModal/EditPriceModal";
import EditStockModal from "@/components/SCT/ProductModal/EditStockModal";
import EditProductModal from "@/components/SCT/ProductModal/EditProductModal";
import EditModal2 from "@/components/SCT/ProductModal/EditModal2";
import EditModal3 from "@/components/SCT/ProductModal/EditModal3";
import EditModal4 from "@/components/SCT/ProductModal/EditModal4";
import EditModal5 from "@/components/SCT/ProductModal/EditModalFinish";

type Props = {
  onAddProduct?: (p: Product) => void;
  onUpdateProduct?: (p: Product) => void;
};

const ProductModals = forwardRef(function ProductModals(
  { onAddProduct, onUpdateProduct }: Props,
  ref
) {
  const [selectedPrice, setSelectedPrice] = useState<Product | null>(null);
  const [selectedStock, setSelectedStock] = useState<Product | null>(null);
  const [separateWeightSize, setSeparateWeightSize] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductStep2, setSelectedProductStep2] = useState<Product | null>(null);
  const [selectedProductStep3, setSelectedProductStep3] = useState<Product | null>(null);
  const [selectedProductStep4, setSelectedProductStep4] = useState<Product | null>(null);
  const [selectedProductStep5, setSelectedProductStep5] = useState<Product | null>(null);

  // 👇 expose methods ให้ parent เรียกได้
  useImperativeHandle(ref, () => ({
    openEditPrice: (product: Product) => setSelectedPrice(product),
    openEditStock: (product: Product) => setSelectedStock(product),
    openEditProduct: (product: Product) => {
      setSelectedProduct(product);
      setSelectedProductStep2(null);
    },
  }));

  // 👉 flow modals เดิม
  const handleNextFromEdit = () => {
    if (!selectedProduct) return;
    setSelectedProductStep2(selectedProduct);
    setSelectedProduct(null);
  };
  const handleNextFromEdit2 = () => {
    if (!selectedProductStep2) return;
    setSelectedProductStep3(selectedProductStep2);
    setSelectedProductStep2(null);
  };
  const handleNextFromEdit3 = () => {
    if (!selectedProductStep3) return;
    setSelectedProductStep4(selectedProductStep3);
    setSelectedProductStep3(null);
  };
  const handleNextFromEdit4 = () => {
    if (!selectedProductStep4) return;
    setSelectedProductStep5(selectedProductStep4);
    setSelectedProductStep4(null);
  };

  const handleDoneFromEdit5 = () => {
    if (selectedProductStep5) {
      if (selectedProductStep5.id === "") {
        onAddProduct?.(selectedProductStep5);
      } else {
        onUpdateProduct?.(selectedProductStep5);
      }
    }
    setSelectedProductStep5(null);
    setSelectedProduct(null);
  };

  return (
    <>
      {selectedPrice && (
        <EditPriceModal
          product={selectedPrice}
          onClose={() => setSelectedPrice(null)}
          onSave={() => setSelectedPrice(null)}
        />
      )}

      {selectedStock && (
        <EditStockModal
          product={selectedStock}
          onClose={() => setSelectedStock(null)}
          onSave={() => setSelectedStock(null)}
        />
      )}

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onNext={handleNextFromEdit}
        />
      )}

      {selectedProductStep2 && (
        <EditModal2
          product={selectedProductStep2}
          onPrev={() => {
            setSelectedProduct(selectedProductStep2);
            setSelectedProductStep2(null);
          }}
          onNext={handleNextFromEdit2}
          onClose={() => setSelectedProductStep2(null)}
        />
      )}

      {selectedProductStep3 && (
        <EditModal3
          product={selectedProductStep3}
          separateWeightSize={separateWeightSize}
          setSeparateWeightSize={setSeparateWeightSize}
          onPrev={() => {
            setSelectedProductStep2(selectedProductStep3);
            setSelectedProductStep3(null);
          }}
          onNext={handleNextFromEdit3}
          onClose={() => setSelectedProductStep3(null)}
        />
      )}

      {selectedProductStep4 && (
        <EditModal4
          product={selectedProductStep4}
          separateWeightSize={separateWeightSize}
          onPrev={() => {
            setSelectedProductStep3(selectedProductStep4);
            setSelectedProductStep4(null);
          }}
          onNext={handleNextFromEdit4}
          onClose={() => setSelectedProductStep4(null)}
        />
      )}

      {selectedProductStep5 && (
        <EditModal5
          product={selectedProductStep5}
          onPrev={() => {
            setSelectedProductStep4(selectedProductStep5);
            setSelectedProductStep5(null);
          }}
          onDone={handleDoneFromEdit5}
          onClose={() => setSelectedProductStep5(null)}
        />
      )}
    </>
  );
});

export default ProductModals;
