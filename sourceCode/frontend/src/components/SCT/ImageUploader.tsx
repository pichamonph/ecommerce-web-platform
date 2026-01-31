"use client";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  maxFiles?: number; // ค่าเริ่มต้น 5
  onChange?: (files: File[]) => void; // callback เมื่อรายการไฟล์เปลี่ยน
  accept?: string; // เช่น "image/*"
}

export default function ImageUploader({ maxFiles = 5, onChange, accept = "image/*" }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // สร้าง preview URLs เมื่อ files เปลี่ยน
    const urls = files.map((f) => URL.createObjectURL(f));
    // เคลียร์ URLs เก่าก่อนเซ็ตใหม่
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(urls);

    // แจ้ง parent
    onChange?.(files);

    // ล้างเมื่อ unmount
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]); // ตั้งค่าขึ้นกับ files เท่านั้น

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list);

    const available = Math.max(0, maxFiles - files.length);
    const toAdd = arr.slice(0, available); // จำกัดจำนวนที่จะเพิ่ม

    setFiles((prev) => [...prev, ...toAdd]);

    // รีเซ็ต input เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้
    e.currentTarget.value = "";
  }

  function handleRemove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function openFileDialog() {
    if (!inputRef.current) return;
    inputRef.current.click();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-2">
        {previews.map((src, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded overflow-hidden border">
            <img src={src} alt={`preview-${idx}`} className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              aria-label={`ลบรูปที่ ${idx + 1}`}
            >
              ×
            </button>
          </div>
        ))}

        {/* ถ้ายังไม่ถึง max ให้แสดงปุ่มเพิ่ม */}
        {files.length < maxFiles && (
          <button
            type="button"
            onClick={openFileDialog}
            className="w-24 h-24 flex items-center justify-center border rounded text-sm text-gray-600 hover:bg-gray-50"
          >
            เพิ่มรูป
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleSelectFiles}
        className="hidden"
      />

      <div className="text-sm text-gray-500">
        อัปโหลดได้สูงสุด {maxFiles} รูป — ตอนนี้ {files.length} รูป
      </div>
    </div>
  );
}