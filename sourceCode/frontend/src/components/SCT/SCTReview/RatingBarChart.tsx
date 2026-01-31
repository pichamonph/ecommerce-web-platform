"use client";

import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "5 ดาว", value: 120 },
    { name: "4 ดาว", value: 150 },
    { name: "3 ดาว", value: 80 },
    { name: "2 ดาว", value: 30 },
    { name: "1 ดาว", value: 10 },
];

export default function RatingBarChart() {

      const gradientId = "barGradient";

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <defs>
                        <linearGradient id={gradientId} x1="1" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#578FCA" />
                            <stop offset="100%" stopColor="#154B85" />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="value"  fill={`url(#${gradientId})`}  radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
