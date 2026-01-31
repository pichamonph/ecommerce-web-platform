import { FaAngleLeft,FaAngleRight } from "react-icons/fa6";


function Pagination() {
  return (
    <div className="flex items-center">
      <div className=" w-fit flex gap-8 ">
          <button className="bg-[#578FCA] p-3 rounded-full text-white text-center"><FaAngleLeft /></button>
          <div className="flex text-center gap-7 items-center">
              <button>1</button>
              <button className="bg-[#F5F0CD] w-9 h-9 rounded-full">2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
          </div>
          <button className="bg-[#578FCA] p-3 rounded-full text-white text-center"><FaAngleRight /></button>
      </div>

      
    </div>
  )
}
export default Pagination