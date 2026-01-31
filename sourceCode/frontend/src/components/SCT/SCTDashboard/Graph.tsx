"use client"
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Graph() {
  const [activeLines, setActiveLines] = useState({
    sales: true,
    orders: true
  });

  const data = [
    { time: '00:00', sales: 0, orders: 0 },
    { time: '06:00', sales: 1000, orders: 50 },
    { time: '12:00', sales: 2000, orders: 100 },
    { time: '18:00', sales: 1500, orders: 75 },
  ];

  return (
    <div className='flex flex-col justify-center items-center w-full h-full'>
      <div className="flex gap-4 mb-4 justify-center items-center">
        <button
          onClick={() => setActiveLines({ ...activeLines, sales: !activeLines.sales })}
          className={activeLines.sales ? 'text-red-500' : 'text-gray-400'}
        >
          ● คำสั่งซื้อ
        </button>
        <button
          onClick={() => setActiveLines({ ...activeLines, orders: !activeLines.orders })}
          className={activeLines.orders ? 'text-teal-500' : 'text-gray-400'}
        >
          ● ยอดการขายสินค้า
        </button>
      </div>
      <ResponsiveContainer width="80%" height="80%">

        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          {activeLines.sales && <Line type="monotone" dataKey="sales" stroke="#ef4444" />}
          {activeLines.orders && <Line type="monotone" dataKey="orders" stroke="#14b8a6" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export default Graph