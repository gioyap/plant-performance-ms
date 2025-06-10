"use client"

import React from "react"
import { CartesianGrid, LineChart, XAxis, Line } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart"
import { ChartProps } from "@/src/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Label } from "@/src/components/ui/label"
import { useRouter } from "next/navigation"

const chartConfig = {
  abp: { label: "ABP", color: "hsl(var(--chart-1))" },
  master_plan: { label: "Master Plan", color: "hsl(var(--chart-2))" },
  actual_received: { label: "Actual Received", color: "hsl(var(--chart-3))" },
  w_requirements: { label: "W Requirements", color: "hsl(var(--chart-4))" },
  excess: { label: "Excess", color: "hsl(var(--chart-5))" },
  advance_prod: { label: "Advance Prod", color: "hsl(var(--chart-6))" },
  safekeep: { label: "Safekeep", color: "hsl(var(--chart-7))" },
  comp_to_master_plan: { label: "Comp to MPlan", color: "hsl(var(--chart-8))" },
}

export default function ChartPeriodPage({ period, year, data }: ChartProps) {
  const router = useRouter();

  return (
    <Card className="w-full max-h-[500px]">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Raw Mat Volume ({period})</CardTitle>
          <CardDescription>Data for year: {year}</CardDescription>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <Label htmlFor="period">Select Period:</Label>
            <Select
              value={period}
              onValueChange={(val) => router.push(`/rm-volume/${val}/${year}`)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="year">Select Year:</Label>
            <Select
              value={year.toString()}
              onValueChange={(val) => router.push(`/rm-volume/${period}/${val}`)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }).map((_, idx) => {
                  const y = 2020 + idx;
                  return (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={0}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `${value}`}
                  indicator="dot"
                />
              }
            />
            {Object.keys(chartConfig).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}