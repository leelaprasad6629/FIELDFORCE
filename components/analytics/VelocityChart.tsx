"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", tasks: 42 },
  { day: "Tue", tasks: 55 },
  { day: "Wed", tasks: 49 },
  { day: "Thu", tasks: 68 },
  { day: "Fri", tasks: 61 },
  { day: "Sat", tasks: 78 },
  { day: "Sun", tasks: 85 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-background/90 px-3 py-2 backdrop-blur-md">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-bold text-cyan">{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
}

export default function VelocityChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ stroke: "rgba(6,182,212,0.3)" }} content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="tasks"
          stroke="#06B6D4"
          strokeWidth={2.5}
          fill="url(#velocityFill)"
          animationDuration={1400}
          dot={{ r: 3, fill: "#06B6D4", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#06B6D4", stroke: "#0E1521", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
