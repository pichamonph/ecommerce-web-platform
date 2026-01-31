"use client"
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function ChartResponse() {

    const orderData = [
        { name: 'การตอบกลับ 1', value: 187, percentage: 50, color: '#F6D365', bgColor: '#FEF6E8' },
        { name: 'การตอบกลับ 2', value: 94, percentage: 25, color: '#5B7FE8', bgColor: '#EEF2FC' },
        { name: 'การตอบกลับ 3', value: 93, percentage: 25, color: '#7DD3D9', bgColor: '#E8F7F8' }
    ];
    const totalOrders = orderData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="p-6 h-full w-full">
            <div className="text-4xl h-1/4">การตอบกลับ</div>

            <div className="flex items-center justify-around h-fit w-full mx-auto ">
                {/* ส่วนซ้าย - รายการสถิติ */}
                <div className=" h-full  flex items-center  gap-3 flex-col">
                    {orderData.map((item, index) => (
                        <div key={index} className="flex items-center gap-8 px-4 py-1 rounded-2xl " style={{ backgroundColor: item.bgColor }}>
                            <div
                                className="flex items-center gap-2 min-w-[120px] px-3 py-2 rounded-md"
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-gray-600 text-sm">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-800 min-w-[80px]">
                                {item.value} การตอบกลับ
                            </span>
                            <span className="font-bold text-gray-800 text-lg">
                                {item.percentage}%
                            </span>
                        </div>
                    ))}
                </div>

                {/* ส่วนขวา - Donut Chart */}
                <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={orderData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {orderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* ตัวเลขตรงกลาง */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800">{totalOrders}</span>
                        <span className="text-sm text-gray-500">การตอบกลับ</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ChartResponse