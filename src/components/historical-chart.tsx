"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoricalMetric } from "@/types/metrics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { get } from 'lodash';

interface HistoricalChartProps {
  data: HistoricalMetric[];
  title: string;
  dataKey: keyof HistoricalMetric | string;
  valueFormatter?: (value: number) => string;
}

export function HistoricalChart({ data, title, dataKey, valueFormatter }: HistoricalChartProps) {
  const chartData = data.map(metric => ({
    timestamp: new Date(metric.timestamp).toLocaleTimeString(),
    value: Number(get(metric, dataKey, 0)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis tickFormatter={valueFormatter} />
            <Tooltip
              formatter={valueFormatter ? (value) => valueFormatter(Number(value)) : undefined}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
