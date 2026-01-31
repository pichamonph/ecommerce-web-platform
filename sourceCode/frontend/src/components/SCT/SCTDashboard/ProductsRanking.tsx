function Ranking() {

  return (
    <div className="p-8">
      <div className="text-2xl text-[#578FCA] mb-4">การจัดอันดับสินค้า</div>

      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-20" />
          <col className="w-auto" />
          <col className="w-32" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#578FCA]">
            <th className="text-[#578FCA] text-left py-2 font-medium">อันดับ</th>
            <th className="text-[#578FCA] text-left py-2 font-medium">ข้อมูลสินค้า</th>
            <th className="text-[#578FCA] text-right py-2 font-medium">ยอดขาย</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="py-3">
              <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center">1</div>
            </td>
            <td className="text-[#578FCA] py-3">เสื้อผ้า</td>
            <td className="text-[#578FCA] py-3 text-right">100,000</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="py-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">2</div>
            </td>
            <td className="text-[#578FCA] py-3">รองเท้า</td>
            <td className="text-[#578FCA] py-3 text-right">85,000</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="py-3">
              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">3</div>
            </td>
            <td className="text-[#578FCA] py-3">กระเป๋า</td>
            <td className="text-[#578FCA] py-3 text-right">70,000</td>
          </tr>
        </tbody>
      </table>
    </div>

  )
}
export default Ranking