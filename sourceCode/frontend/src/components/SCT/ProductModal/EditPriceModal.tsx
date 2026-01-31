import React, { useEffect, useState } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  totalsale?: number;
  inStock?: number | string;
  image?:string;
}

interface Props {
  product: Product;
  onClose: () => void;
  onSave: (id: string, newPrice: number) => void;
}

export default function EditPriceModal({ product, onClose, onSave }: Props) {
  const [price, setPrice] = useState<number>(product.price ?? 0);

  useEffect(() => {
    setPrice(Number(product.price ?? 0));
  }, [product]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSave() {
    const parsed = Number(price);
    if (isNaN(parsed) || parsed < 0) {
      alert("กรุณากรอกราคาที่ถูกต้อง");
      return;
    }
    onSave(product.id, parsed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-[420px] p-6" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="text-xl font-medium mb-4">แก้ไขราคาสินค้า</h2>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">{product.name}</div>
          <label className="block text-sm font-medium mb-1">ราคา (บาท)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
            step="0.01"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300" onClick={onClose}>ยกเลิก</button>
          <button className="px-4 py-2 rounded-md bg-[#578FCA] text-white hover:opacity-90" onClick={handleSave}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}