import { IoSearch } from "react-icons/io5";
import { LiaUndoAltSolid } from "react-icons/lia";

function MenuOrderPage() {
    return (
        <div className="">
            <div className="flex flex-row items-center gap-2 md:gap-20">
                <button className="w-[160px] py-1 rounded-full bg-[#578FCA] text-[#d7eaff] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.25)]">ทั้งหมด</button>
                <button className="hover:bg-[#578FCA] hover:text-white w-[160px] py-1 rounded-full text-[#578FCA] bg-[#d7eaff] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.25)]">ที่ต้องจัดส่ง</button>
                <button className="hover:bg-[#578FCA] hover:text-white w-[160px] py-1 rounded-full text-[#578FCA] bg-[#d7eaff] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.25)]">กำลังจัดส่ง</button>
                <button className="hover:bg-[#578FCA] hover:text-white w-[160px] py-1 rounded-full text-[#578FCA] bg-[#d7eaff] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.25)]">สำเร็จ</button>
                <button className="hover:bg-[#578FCA] hover:text-white w-[160px] py-1 rounded-full text-[#578FCA] bg-[#d7eaff] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.25)]">ยังไม่ชำระ</button>
            </div>
            <div className="my-8">
                <form action="" className="flex gap-6">
                    <input type="text" placeholder="ระบุคำค้นหา" className=" px-4 w-100 h-10 rounded-full bg-[#f0f0f0]" />
                    <div className="flex items-center justify-between px-4 w-90 h-10 text-white rounded-full bg-[#578FCA]">
                        <label htmlFor="delivery">ช่องทางการจัดส่ง : </label>
                        <select id="delivery" name="delivery" className="pr-4">
                            <option className="text-[#578FCA]" value="flash">Dinyc Express</option>

                        </select>
                    </div>
                    <button className=" flex items-center gap-2 px-10 py-1 h-10 text-white rounded-full bg-[#578FCA]">
                        <IoSearch className="text-xl" />
                        <div>ค้นหา</div>
                    </button>
                    <button className=" flex items-center gap-2 px-10 py-1 h-10 text-[#578FCA] rounded-full bg-white border border-[#578FCA]">
                        <LiaUndoAltSolid className="text-xl" />
                        <div>รีเซ็ต</div>
                    </button>
                </form>
            </div>
        </div>
    )
}
export default MenuOrderPage