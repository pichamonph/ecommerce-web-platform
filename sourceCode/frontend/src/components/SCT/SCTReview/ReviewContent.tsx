import Image from "next/image"
import MenuReviewPage from "./MenuReviewPage"
import StarRating from "./StarRating"
import Pagination from "../Pagination"

function ReviewContent() {
    return (
        <div className="flex flex-col p-6 w-full h-full">

            <div className="flex justify-between items-center mb-6">
                <div className="text-4xl">การรีวิว (1)</div>

                <div><div className="flex items-center justify-between px-4 w-full  h-10 text-white rounded-full bg-[#578FCA]">
                    <select id="delivery" name="delivery" className="pr-4 bg-transparent focus:outline-none">

                        <option className="text-[#578FCA]" value="flash">ทั้งหมด</option>

                    </select>
                </div>

                </div>
            </div>

            <MenuReviewPage />

            <div className=" flex-1 border-[#578FCA] rounded-2xl p-6">

                <div className="border border-[#578FCA] rounded-2xl p-6 mb-4">
                    <div className="border-b-1 pb-3 border-[#578FCA]">
                        <div className="flex justify-between items-center">
                            <div className="text-2xl font-medium">
                                IPhone 15 Pro
                            </div>
                            <div><StarRating rating={3} className="text-xl text-yellow-400" classNameTxt="text-xl" /></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <div className="text-xl font-light">
                                Jakkrit
                            </div>
                            <div>2024-09-20 เวลา 14:30</div>
                        </div>
                    </div>
                    <div className="p-3 border-b-1 pb-3 border-[#578FCA]">
                        <div>สินค้าดีมาก ใช้งานได้ดี การจัดส่งรวดเร็ว พอใจมากค่ะ</div>
                        <div className="border border-[#578FCA] w-28 h-28 rounded-2xl relative overflow-hidden mt-6">
                            <Image
                                src="/R.jpg"
                                alt="Pic"
                                fill={true}
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-4 gap-4">
                        <button className="border-[#578FCA] border rounded-full w-35 h-10">ยกเลิก</button>
                        <button className="bg-[#578FCA] text-white rounded-full  w-35 h-10">ตอบกลับ</button>
                    </div>
                </div>
                
            </div>
            <div className="w-full h-fit flex justify-center items-center"><Pagination /></div>
        </div>
    )
}
export default ReviewContent