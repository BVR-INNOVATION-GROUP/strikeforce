"use client";

import React from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import Card from "@/src/components/core/Card";
import { getChartColor } from "@/src/constants/chartColors";

export interface BarChartData {
  name: string;
  [key: string]: string | number;
}

export interface Props {
  title: string;
  data: BarChartData[];
  bars: Array<{
    key: string;
    label: string;
    color?: string;
  }>;
  height?: number;
}

const MAX_TICK_LEN = 16;

function truncateAxisLabel(raw: string): string {
  const s = String(raw);
  if (s.length <= MAX_TICK_LEN) return s;
  return `${s.slice(0, MAX_TICK_LEN - 1)}…`;
}

/**
 * Bar Chart Component - displays categorical data comparisons
 * Uses a theme-agnostic palette so each series has a distinct color.
 */
const BarChart = ({ title, data, bars, height = 340 }: Props) => {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary)"
            tick={{ fontSize: 10 }}
            height={56}
            interval={0}
            angle={-35}
            textAnchor="end"
            tickFormatter={truncateAxisLabel}
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
            labelFormatter={(label) => String(label)}
          />
          <Legend 
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
          />
          {bars.map((bar, barIndex) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color ?? getChartColor(barIndex, undefined, title)}
              radius={[4, 4, 0, 0]}
            >
              {bars.length === 1
                ? data.map((_, dataIndex) => (
                    <Cell key={dataIndex} fill={bar.color ?? getChartColor(dataIndex, undefined, title)} />
                  ))
                : null}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BarChart;

