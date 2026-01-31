import { IoSearch } from "react-icons/io5";
import { LiaUndoAltSolid } from "react-icons/lia";

function MenuProductsPage() {
    return (
        <div className="mb-4">
            <form action="" className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#578FCA]">
                        <IoSearch className="text-xl" />
                        <div className="h-5 border-1.5 border-r border-white ml-3"></div>
                    </div>
                    <input
                        type="text"
                        placeholder="ระบุคำค้นหา"
                        className="pl-15 pr-4 w-full h-10 rounded-full bg-[#f0f0f0] focus:outline-none focus:ring-1 focus:ring-[#578FCA]"
                    />
                </div>

                <div className="flex items-center justify-between px-4 w-full md:w-80 h-10 text-white rounded-full bg-[#578FCA]">
                    <label htmlFor="delivery w-fit">ช่องทางการจัดส่ง : </label>
                    <select id="delivery" name="delivery" className="pr-4 bg-transparent focus:outline-none">
                        <option className="text-[#578FCA]" value="flash">Dinyc Express</option>
                    </select>
                </div>
                <div className="flex flex-row gap-6 ">
                    <button className="flex items-center gap-2 px-10 py-1 h-10 text-white rounded-full bg-[#578FCA]">
                        <IoSearch className="text-xl" />
                        <div>ค้นหา</div>
                    </button>
                    <button className="flex items-center gap-2 px-10 py-1 h-10 text-[#578FCA] rounded-full bg-white border border-[#578FCA]">
                        <LiaUndoAltSolid className="text-xl" />
                        <div>รีเซ็ต</div>
                    </button>
                </div>
            </form>
        </div>
    )
}
export default MenuProductsPage 