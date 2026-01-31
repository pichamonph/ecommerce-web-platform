"use client";
import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";

export type Product = {
    id: string;
    name: string;
    price: number;
    totalsale?: number;
    inStock?: number | string;
};

interface Props {
    product?: Product;
    onClose: () => void;
    onNext: () => void; // เรียกเมื่อกด "ต่อไป" เพื่อให้ parent เปิด modal ถัดไป
}

export default function EditProductModal({ product, onClose, onNext }: Props) {
    const [name, setName] = useState(product?.name ?? "");
    const [price, setPrice] = useState(String(product?.price ?? 0));

    useEffect(() => {
        setName(product?.name ?? "");
        setPrice(String(product?.price ?? 0));
    }, [product]);

    // ปิดด้วย Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onMouseDown={onClose}
        >
            <div
                className="bg-[#F0F0F0] rounded-2xl w-full max-w-[70%] p-6 shadow-lg"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-modal-title"
            >
                <div className="bg-white w-full h-[150px] rounded-2xl  flex flex-col justify-around items-center mb-6">
                    <div className="w-full flex justify-around items-center">
                        <div className="w-10 h-10 rounded-full flex justify-around items-center bg-[#578FCA] text-white">1</div>
                        <div className="w-10 h-10 border border-[#578FCA] rounded-full flex justify-around items-center text-[#578FCA]">2</div>
                        <div className="w-10 h-10 border border-[#578FCA] rounded-full flex justify-around items-center text-[#578FCA]">3</div>
                        <div className="w-10 h-10 border border-[#578FCA] rounded-full flex justify-around items-center text-[#578FCA]">4</div>
                    </div>
                    <div className="w-[95%] bg-gray-200 rounded-full h-4">
                        <div className="bg-[#578FCA] h-4 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                </div>

                <div className="bg-white w-full h-full rounded-2xl p-6">
                    <div className="text-4xl mb-6">ข้อมูลพื้นฐาน</div>
                    <div className="w-full flex items-center justify-center">
                        <div className="w-[90%]">
                            <label className="block text-sm mb-1">ชื่อสินค้า</label>
                            <input
                                className="w-full border rounded-2xl px-6 py-2 mb-3"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ชื่อสินค้า (ตัวอย่าง)"
                            />
                            <label className="block text-sm mb-1">หมวดหมู่</label>
                            <div className=" px-4 w-full h-10 text-white  flex items-center justify-between rounded-2xl bg-[#578FCA] mb-3">
                                <select id="delivery" name="delivery" className="w-full bg-transparent focus:outline-none">
                                    <option className="text-[#578FCA]" value="flash">เสื้อผ้า</option>
                                    <option className="text-[#578FCA]" value="flash">กระเป๋า</option>
                                    <option className="text-[#578FCA]" value="flash">เครื่องใช้ไฟฟ้า</option>
                                </select>
                            </div>

                            <label className="block text-sm mb-1">คำอธิบายสินค้า</label>
                            <input
                                type="text"
                                className="w-full min-h-[150px] border rounded-2xl px-3 py-2 mb-4"
                                onChange={(e) => setPrice(e.target.value)}
                            />

                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-between gap-3 mt-6">
                    <button className="px-4 py-2 rounded bg-gray-300" onClick={onClose}>
                        ยกเลิก
                    </button>
                    <button
                        className="p-4 rounded-full bg-[#578FCA] text-white"
                        onClick={() => {
                            // ไม่บันทึกอะไร แค่ไป modal ถัดไป
                            onNext();
                        }}
                    >
                        <FaAngleRight />
                    </button>
                </div>
            </div>
        </div>
    );
}