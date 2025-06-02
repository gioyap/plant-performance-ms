"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../ui/select"
import { ChartConfig, ChartContainer, ChartLegend,ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import { createClient } from "@/src/utils/supabase/client"

const chartConfig = {
  abp: {
    label: "ABP",
    color: "hsl(var(--chart-1))",
  },
  totalrm: {
    label: "Total RM",
    color: "hsl(var(--chart-2))",
  },
    lastabp: {
    label: "Last ABP",
    color: "hsl(var(--chart-3))",
  },
    lasttotalrm: {
    label: "Last Total RM",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

type ChartRow = {
  date: string
  abp: number
  totalrm: number
    lasttotalrm: number
      lastabp: number
}

export function DashboardChart() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [data, setData] = React.useState<ChartRow[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchChartData = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("interactions_charts")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Failed to fetch chart data:", error.message)
    } else {
      setData(data as ChartRow[])
    }

    setLoading(false)
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
        {loading ? (
          <div className="text-center text-muted-foreground text-sm">Loading chart...</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillabp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-abp)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-abp)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillrm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-totalrm)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-totalrm)" stopOpacity={0.1} />
                </linearGradient>
                   <linearGradient id="filllastabp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-lastabp)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-lastabp)" stopOpacity={0.1} />
                </linearGradient>
                   <linearGradient id="filllastrm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-lasttotalrm)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-lasttotalrm)" stopOpacity={0.1} />
                </linearGradient>
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
              <Area
                dataKey="abp"
                type="natural"
                fill="url(#fillabp)"
                stroke="var(--color-abp)"
                stackId="a"
              />
              <Area
                dataKey="totalrm"
                type="natural"
                fill="url(#fillrm)"
                stroke="var(--color-totalrm)"
                stackId="a"
              />
                <Area
                dataKey="lastabp"
                type="natural"
                fill="url(#filllastabp)"
                stroke="var(--color-lastabp)"
                stackId="a"
              />
              <Area
                dataKey="lasttotalrm"
                type="natural"
                fill="url(#filllastrm)"
                stroke="var(--color-lasttotalrm)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>   
        )}
      </CardContent>
    </Card>
  )
}
