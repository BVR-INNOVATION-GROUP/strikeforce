"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "@/src/components/core/Card";
import { getChartColor } from "@/src/constants/chartColors";

export interface PieChartDataItem {
  name: string;
  value: number;
}

export interface Props {
  title: string;
  data: PieChartDataItem[];
  height?: number;
}

/**
 * Pie Chart - parts of a whole. Each slice uses complementary palette (one per chart).
 */
const PieChart = ({ title, data, height = 320 }: Props) => {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="78%"
            paddingAngle={2}
            stroke="var(--paper)"
            strokeWidth={1}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={getChartColor(index, undefined, title)} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--paper)",
              border: `1px solid var(--border)`,
              borderRadius: "4px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string, item: { payload?: { value?: number } }) => {
              const total = data.reduce((s, d) => s + d.value, 0) || 1;
              const v = item?.payload?.value ?? value;
              const pct = ((Number(v) / total) * 100).toFixed(0);
              return [`${v} (${pct}%)`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PieChart;
