"use client";
import React, { useEffect, useState } from "react";
import type { Product } from "./EditProductModal";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

interface Props {
    product?: Product;
    onPrev: () => void;
    onClose: () => void;
    onNext: () => void;
    separateWeightSize: boolean;
}

export default function EditModal4({ product, separateWeightSize, onPrev, onClose, onNext }: Props) {
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
                        <div className="w-10 h-10 rounded-full flex justify-around items-center bg-[#578FCA] text-white">3</div>
                        <div className="w-10 h-10 rounded-full flex justify-around items-center bg-[#578FCA] text-white">4</div>
                    </div>
                    <div className="w-[95%] bg-gray-200 rounded-full h-4">
                        <div className="bg-[#578FCA] h-4 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                </div>

                <div className="bg-white w-full h-full rounded-2xl p-6">
                    <div className="text-4xl mb-8">การจัดส่ง</div>
                    <div>
                        {!separateWeightSize && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6">
                                <div>
                                    <label className="block text-sm mb-1">น้ำหนัก (กรัม)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="น้ำหนัก"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">ความกว้าง (ซม.)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="ความกว้าง"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">ความยาว (ซม.)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="ความยาว"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">ความสูง (ซม.)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="ความสูง"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-full flex flex-col justify-center items-center gap-6">
                        <div className="w-[90%] flex justify-between items-center">
                            <p>ส่งสินค้าขนาดใหญ่</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" />
                                <div
                                    className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#578FCA]
                                                    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                                                    after:bg-white after:border-gray-300 after:border after:rounded-full
                                                    after:h-5 after:w-5 after:transition-all
                                                    peer-checked:after:translate-x-full peer-checked:after:border-white">
                                </div>
                            </label>
                        </div>
                        <div className="w-[90%] flex justify-between items-center">
                            <p>ส่งธรรมดาในประเทศ</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" />
                                <div
                                    className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#578FCA]
                                                    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                                                    after:bg-white after:border-gray-300 after:border after:rounded-full
                                                    after:h-5 after:w-5 after:transition-all
                                                    peer-checked:after:translate-x-full peer-checked:after:border-white">
                                </div>
                            </label>
                        </div>
                        <div className="w-[90%] flex justify-between items-center">
                            <p>ส่งด่วน</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" />
                                <div
                                    className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#578FCA]
                                                    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                                                    after:bg-white after:border-gray-300 after:border after:rounded-full
                                                    after:h-5 after:w-5 after:transition-all
                                                    peer-checked:after:translate-x-full peer-checked:after:border-white">
                                </div>
                            </label>
                        </div>

                    </div>
                </div>

                <div className="w-full flex justify-between gap-3 mt-6">
                    <button className="p-4 rounded-full bg-[#578FCA] text-white" onClick={onPrev}>
                        <FaAngleLeft />
                    </button>
                    <button className="px-4 py-2 rounded bg-[#578FCA] text-white" onClick={() => { onNext(); }}><FaAngleRight /></button>
                </div>
            </div>
        </div>
    );
}