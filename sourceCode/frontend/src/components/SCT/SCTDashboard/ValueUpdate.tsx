function ValueUpdate() {
  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-2 gap-4 w-full h-full">
        <div className=" min-h-[150px] flex flex-col justify-center items-center bg-white rounded-3xl shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25)]">
          <div className="text-5xl h-3/5 flex justify-center items-center">0</div>
          <div>ยอดขาย</div>
        </div>
        <div className=" min-h-[150px] flex flex-col justify-center items-center bg-white rounded-3xl shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25)]">
          <div className="text-5xl h-3/5 flex justify-center items-center">0</div>
          <div>คำสั่งซื้อ</div>
        </div>
        <div className=" min-h-[150px] flex flex-col justify-center items-center bg-white rounded-3xl shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25)]">
          <div className="text-5xl h-3/5 flex justify-center items-center">0</div>
          <div>อัตราขาย</div>
        </div>
        <div className=" min-h-[150px] flex flex-col justify-center items-center bg-white rounded-3xl shadow-[inset_0_-4px_6px_rgba(0,0,0,0.25)]">
          <div className="text-5xl h-3/5 flex justify-center items-center">0</div>
          <div>จำนวนผู้เยี่ยมชม</div>
        </div>

      </div>
    </div>
  )
}
export default ValueUpdate