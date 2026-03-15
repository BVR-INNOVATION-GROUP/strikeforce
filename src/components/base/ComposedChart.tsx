"use client";

import React from "react";
import {
  ComposedChart as RechartsComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import Card from "@/src/components/core/Card";
import { getChartColor } from "@/src/constants/chartColors";

export interface ComposedChartData {
  name: string;
  [key: string]: string | number;
}

type SeriesType = "bar" | "line" | "area";

export interface Props {
  title: string;
  data: ComposedChartData[];
  series: Array<{
    key: string;
    label: string;
    type: SeriesType;
    color?: string;
  }>;
  height?: number;
}

/**
 * Composed Chart - mix bars, lines, and areas in one chart. Uses complementary palette.
 */
const ComposedChart = ({ title, data, series, height = 300 }: Props) => {
  const barSeries = series.filter((s) => s.type === "bar");
  const hasSingleBar = barSeries.length === 1;

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsComposedChart data={data}>
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
          {series.map((s, index) => {
            const color = s.color ?? getChartColor(index, undefined, title);
            if (s.type === "bar") {
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                >
                  {hasSingleBar && barSeries[0]?.key === s.key
                    ? data.map((_, i) => (
                        <Cell key={i} fill={getChartColor(i, undefined, title)} />
                      ))
                    : null}
                </Bar>
              );
            }
            if (s.type === "area") {
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              );
            }
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            );
          })}
        </RechartsComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ComposedChart;
