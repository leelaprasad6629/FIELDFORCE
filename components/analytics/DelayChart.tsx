"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { day: "Mon", delay: 1.2 },
  { day: "Tue", delay: 2.4 },
  { day: "Wed", delay: 3.0 },
  { day: "Thu", delay: 1.8 },
  { day: "Fri", delay: 2.8 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-background/90 px-3 py-2 backdrop-blur-md">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-bold text-cyan">{payload[0].value}h delay</p>
      </div>
    );
  }
  return null;
}

export default function DelayChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} unit="h" />
        <Tooltip cursor={{ fill: "rgba(99,102,241,0.08)" }} content={<CustomTooltip />} />
        <Bar dataKey="delay" radius={[6, 6, 0, 0]} animationDuration={1200}>
          {data.map((_, i) => (
            <Cell key={i} fill="#06B6D4" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
