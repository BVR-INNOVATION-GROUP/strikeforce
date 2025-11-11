"use client";

import React from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Card from "@/src/components/core/Card";

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

/**
 * Bar Chart Component - displays categorical data comparisons
 * Uses theme colors from globals.css
 */
const BarChart = ({ title, data, bars, height = 300 }: Props) => {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
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
          {bars.map((bar, index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color || (index === 0 ? "var(--primary)" : index === 1 ? "var(--text-success)" : "var(--text-info)")}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BarChart;

