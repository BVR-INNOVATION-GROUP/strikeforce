"use client";

import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "@/src/components/core/Card";
import { getChartColor } from "@/src/constants/chartColors";

export interface AreaChartData {
  name: string;
  [key: string]: string | number;
}

export interface Props {
  title: string;
  data: AreaChartData[];
  areas: Array<{
    key: string;
    label: string;
    color?: string;
  }>;
  height?: number;
}

/**
 * Area Chart - filled trend/volume over time. Uses complementary palette per chart.
 */
const AreaChart = ({ title, data, areas, height = 300 }: Props) => {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary)"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--paper)",
              border: `1px solid var(--border)`,
              borderRadius: "4px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          {areas.map((area, index) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.label}
              stroke={getChartColor(index, area.color, title)}
              fill={getChartColor(index, area.color, title)}
              fillOpacity={0.35}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default AreaChart;
