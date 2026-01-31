import React, { useEffect, useState } from "react";
import type { Product } from "./EditPriceModal"; // ใช้ type เดียวกับที่ Export จาก EditPriceModal (หรือปรับ path ตามที่คุณวางไฟล์)

interface Props {
  product: Product;
  onClose: () => void;
  onSave: (id: string, newStock: number) => void;
}

export default function EditStockModal({ product, onClose, onSave }: Props) {
  const [stock, setStock] = useState<number>(0);

  useEffect(() => {
    setStock(Number(product.inStock ?? 0));
  }, [product]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSave() {
    const parsed = Number(stock);
    if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
      alert("กรุณากรอกจำนวนสต็อกเป็นจำนวนเต็มไม่ติดลบ");
      return;
    }
    onSave(product.id, parsed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-[420px] p-6"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-stock-title"
      >
        <h2 id="edit-stock-title" className="text-xl font-medium mb-4">
          แก้ไขจำนวนในสต็อก
        </h2>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">{product.name}</div>
          <label className="block text-sm font-medium mb-1">จำนวน (หน่วย)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            min={0}
            step={1}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            ยกเลิก
          </button>
          <button
            className="px-4 py-2 rounded-md bg-[#578FCA] text-white hover:opacity-90"
            onClick={handleSave}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}