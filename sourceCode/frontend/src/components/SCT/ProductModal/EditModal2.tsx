"use client";
import React, { useEffect, useState } from "react";
import type { Product } from "./EditProductModal";
import ImageUploader from "../ImageUploader";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

interface Props {
    product?: Product;
    onNext: () => void; // เรียกเมื่อกดบันทึกใน modal ถัดไป (จะปิดทั้งหมด)
    onPrev: () => void;
    onClose: () => void;
}

export default function EditModal2({ product, onPrev, onClose, onNext }: Props) {
    const [stock, setStock] = useState(String(product?.inStock ?? 0));

    useEffect(() => {
        setStock(String(product?.inStock ?? 0));
    }, [product]);

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
                        <div className="w-10 h-10 rounded-full flex justify-around items-center bg-[#578FCA] text-white">2</div>
                        <div className="w-10 h-10 border border-[#578FCA] rounded-full flex justify-around items-center text-[#578FCA]">3</div>
                        <div className="w-10 h-10 border border-[#578FCA] rounded-full flex justify-around items-center text-[#578FCA]">4</div>
                    </div>
                    <div className="w-[95%] bg-gray-200 rounded-full h-4">
                        <div className="bg-[#578FCA] h-4 rounded-full" style={{ width: "50%" }}></div>
                    </div>
                </div>

                <div className="bg-white w-full h-full rounded-2xl p-6">
                    <div className="text-4xl mb-6">รูปภาพสินค้า</div>
                    <div className="w-full ">
                        <ImageUploader maxFiles={5} />
                    </div>
                </div>
                <div className="w-full flex justify-between gap-3 mt-6">
                    <button className="p-4 rounded-full bg-[#578FCA] text-white" onClick={onPrev}>
                        <FaAngleLeft />
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