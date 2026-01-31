"use client";
import React, { useEffect, useState } from "react";
import type { Product } from "./EditProductModal";
import { BsFillPencilFill } from "react-icons/bs";
import { MdDone } from "react-icons/md";

interface Props {
    product?: Product;
    onPrev: () => void;
    onClose: () => void;
    onDone: () => void;
}

export default function EditModal2({ product, onPrev, onClose, onDone }: Props) {
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
                className="bg-[#ffffff] rounded-2xl w-full max-w-[30%] p-6 shadow-lg"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-modal-title"
            >
                <div className=" flex flex-col justify-around items-center py-10">
                    <div className="bg-[#74FF79] w-fit p-5  rounded-full mb-6">
                        <MdDone className="text-8xl text-white" />
                    </div>
                    <div className="text-4xl text-[#74FF79]">
                        เผยแพร่สำเร็จ
                    </div>
                </div>


                <div className="w-full flex justify-between gap-3 mt-6">
                    <button className="flex justify-center items-center gap-3 px-12 py-2 rounded-full bg-white border border-[#578FCA] text-[#578FCA]" onClick={onPrev}>
                       <BsFillPencilFill /> แก้ไข
                    </button>
                    <button
                        className="px-4 py-2 rounded-full bg-[#578FCA] text-white"
                        onClick={() => {
                            // ไม่บันทึกอะไร แค่ไป modal ถัดไป
                            onDone();
                        }}
                    >
                        กลับสู่หน้าสินค้าของฉัน
                    </button>
                </div>
            </div>
        </div>
    );
}