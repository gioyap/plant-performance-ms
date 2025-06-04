"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../ui/card"
import { ChartConfig, ChartContainer, ChartLegend,ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import { createClient } from "@/src/utils/supabase/client"
import { ChartRow } from "@/src/lib/types"

const chartConfig = {
  abp: { label: "ABP", color: "hsl(var(--chart-1))" },
  master_plan: { label: "Master Plan", color: "hsl(var(--chart-2))" },
  actual_received: { label: "Actual Received", color: "hsl(var(--chart-3))" },
  w_requirements: { label: "W Requirements", color: "hsl(var(--chart-4))" },
  excess: { label: "Excess", color: "hsl(var(--chart-5))" },
  advance_prod: { label: "Advance Prod", color: "hsl(var(--chart-6))" },
  safekeep: { label: "Safekeep", color: "hsl(var(--chart-7))" },
  comp_to_master_plan: { label: "Comp to MPlan", color: "hsl(var(--chart-8))" },
} satisfies ChartConfig

export function FreshVolumeChart() {
  const [data, setData] = React.useState<ChartRow[]>([])

  const fetchChartData = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("mf_raw_sizes")
      .select("date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan")
      .eq("size", "total_volume")
      .order("date", { ascending: true })

    if (error) {
      console.error("Failed to fetch chart data:", error.message)
    } else {
            const monthOrder = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      const sortedData = (data as ChartRow[]).sort((a, b) =>
        monthOrder.indexOf(a.date) - monthOrder.indexOf(b.date)
      )

      setData(sortedData)
          }
  }
  React.useEffect(() => {
    fetchChartData()
  }, [])

  return (
    <Card className="w-full max-h-96">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Raw Mat Volume</CardTitle>
          <CardDescription>
            Showing total computation of Volume this year
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              {Object.keys(chartConfig).map((key) => (
                <linearGradient id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1" key={key}>
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
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
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill-${key})`}
                stroke={`var(--color-${key})`}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}