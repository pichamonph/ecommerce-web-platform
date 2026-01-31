"use client";
import React, { useEffect, useState } from "react";
import type { Product } from "./EditProductModal";
import { FaPlus } from "react-icons/fa6";
import { FaTrashCan } from "react-icons/fa6";
import ImageUploader from "../ImageUploader";
import { FaAngleRight,FaAngleLeft } from "react-icons/fa6";
interface Props {
    product?: Product;
    onPrev: () => void;
    onNext: () => void; // เรียกเมื่อกดบันทึกใน modal ถัดไป (จะปิดทั้งหมด)
    onClose: () => void;
    separateWeightSize: boolean;      // ✅ เพิ่ม
    setSeparateWeightSize: (v: boolean) => void;
}

export default function EditModal3({ product,separateWeightSize,
  setSeparateWeightSize, onPrev, onClose, onNext }: Props) {
    const [stock, setStock] = useState(String(product?.inStock ?? 0));
    const [enableImage, setEnableImage] = useState(false);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={onClose}>
            <div
                className="bg-[#F0F0F0] rounded-2xl w-full max-w-[70%] min-w-[600px] p-6 shadow-lg"
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
                        <div className="w-10 h-10 border border-[#578FCA] rounded-full flex justify-around items-center text-[#578FCA]">4</div>
                    </div>
                    <div className="w-[95%] bg-gray-200 rounded-full h-4">
                        <div className="bg-[#578FCA] h-4 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                </div>

                <div className="bg-white w-full h-full rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-4xl">
                            ข้อมูลการขาย
                        </div>
                        <div className="flex">
                            <div className="flex mr-6">
                                <p className="mr-3">กำหนดน้ำหนัก - ขนาดแยกตามตัวเลือก</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer"
                                        checked={separateWeightSize}
                                        onChange={(e) => setSeparateWeightSize(e.target.checked)} />
                                    <div
                                        className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#578FCA]
                                                    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                                                    after:bg-white after:border-gray-300 after:border after:rounded-full
                                                    after:h-5 after:w-5 after:transition-all
                                                    peer-checked:after:translate-x-full peer-checked:after:border-white">
                                    </div>
                                </label>
                            </div>
                            <div className="flex">
                                <p className="mr-3">เปิดใช้งานรูปภาพ</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer"
                                        checked={enableImage}
                                        onChange={(e) => setEnableImage(e.target.checked)} />
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
                    <div className="grid grid-cols-2 w-full gap-6">
                        <div className="border border-[#578FCA] rounded-2xl p-4">
                            <div className="flex justify-between mb-3">
                                <p>ตัวเลือกที่ 1</p>
                                <div>
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
                            <div>
                                <input
                                    type="text"
                                    className="w-full  bg-[#f0f0f0] rounded-2xl px-5 py-2 mb-4"
                                    placeholder="สี"
                                />
                            </div>
                        </div>
                        <div className="border border-[#578FCA] rounded-2xl p-4">
                            <div className="flex justify-between mb-3">
                                <p>ตัวเลือกที่ 2</p>
                                <div>
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
                            <div>
                                <input
                                    type="text"
                                    className="w-full  bg-[#f0f0f0] rounded-2xl px-5 py-2 mb-4"
                                    placeholder="ขนาด"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 mb-6">
                        <div className="text-4xl">
                            รายการสินค้า
                        </div>
                        <div><button className="text-white px-4 py-2 bg-[#578FCA] flex items-center justify-center rounded-2xl"><FaPlus className="mr-2" />เพื่มตัวเลือก</button></div>
                    </div>
                    <div className="w-full h-[310px] overflow-x-scroll">
                        <div className="border px-6 py-2 mt-2 rounded-2xl">
                            <div className="flex justify-between items-center"><p>รายการที่ 1</p><button><FaTrashCan /></button></div>

                            <div className="grid grid-cols-4 gap-x-6">
                                {enableImage && (
                                    <div className="row-span-2">
                                        <ImageUploader maxFiles={1} />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm mb-1">สี</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="สี"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">ขนาด</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="ขนาด"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">SKU</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="SKU"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">ราคา</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="ราคา"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">คลัง</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="คลัง"
                                    />
                                </div>
                            </div>
                            {separateWeightSize && (
                                <div className="grid grid-cols-4 gap-x-6">
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
                        <div className="border px-6 py-2 mt-2 rounded-2xl">
                            <div className="flex justify-between items-center"><p>รายการที่ 1</p><button><FaTrashCan /></button></div>

                            <div className="grid grid-cols-4 gap-x-6">
                                {enableImage && (
                                    <div className="row-span-2">
                                        <ImageUploader maxFiles={1} />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm mb-1">สี</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="สี"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">ขนาด</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="ขนาด"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">SKU</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="SKU"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">ราคา</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="ราคา"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">คลัง</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#f0f0f0] rounded-2xl px-3 py-2 mb-4"
                                        placeholder="คลัง"
                                    />
                                </div>
                            </div>
                            {separateWeightSize && (
                                <div className="grid grid-cols-4 gap-x-6">
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