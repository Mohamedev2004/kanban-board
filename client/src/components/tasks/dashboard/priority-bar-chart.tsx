import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { TaskStats } from "@/api/types/tasks.types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Translate = (key: string, fallback?: string) => string

type PriorityBarChartProps = {
  data: TaskStats["by_priority"]
  t: Translate
}

export function PriorityBarChart({ data, t }: PriorityBarChartProps) {
  const chartConfig = {
    count: { label: t("dashboard.kpi.total") },
    low: { label: t("tasks.priority.low"), color: "var(--chart-1)" },
    medium: { label: t("tasks.priority.medium"), color: "var(--chart-2)" },
    high: { label: t("tasks.priority.high"), color: "var(--chart-3)" },
  } satisfies ChartConfig

  const chartData = [
    { priority: "low", count: data.low, fill: "var(--color-low)" },
    { priority: "medium", count: data.medium, fill: "var(--color-medium)" },
    { priority: "high", count: data.high, fill: "var(--color-high)" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.byPriority")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[260px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="priority"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                String(chartConfig[value as keyof typeof chartConfig]?.label ?? value)
              }
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="priority" hideLabel />}
            />
            <Bar dataKey="count" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
