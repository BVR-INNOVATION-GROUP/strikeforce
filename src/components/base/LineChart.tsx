"use client";

import React from "react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Card from "@/src/components/core/Card";

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface Props {
  title: string;
  data: LineChartData[];
  lines: Array<{
    key: string;
    label: string;
    color?: string;
  }>;
  height?: number;
}

/**
 * Line Chart Component - displays time-series or sequential data
 * Uses theme colors from globals.css
 */
const LineChart = ({ title, data, lines, height = 300 }: Props) => {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
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
              borderRadius: "8px",
              fontSize: "12px"
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
          />
          {lines.map((line, index) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color || (index === 0 ? "var(--primary)" : index === 1 ? "var(--text-success)" : "var(--text-info)")}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default LineChart;

