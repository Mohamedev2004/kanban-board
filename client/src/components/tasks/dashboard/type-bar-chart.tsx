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

type TypeBarChartProps = {
  data: TaskStats["by_type"]
  t: Translate
}

export function TypeBarChart({ data, t }: TypeBarChartProps) {
  const chartConfig = {
    count: { label: t("dashboard.kpi.total") },
    bug: { label: t("tasks.type.bug"), color: "var(--chart-1)" },
    ticket: { label: t("tasks.type.ticket"), color: "var(--chart-2)" },
    epic: { label: t("tasks.type.epic"), color: "var(--chart-3)" },
  } satisfies ChartConfig

  const chartData = [
    { type: "bug", count: data.bug, fill: "var(--color-bug)" },
    { type: "ticket", count: data.ticket, fill: "var(--color-ticket)" },
    { type: "epic", count: data.epic, fill: "var(--color-epic)" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.byType")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[260px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
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
              content={<ChartTooltipContent nameKey="type" hideLabel />}
            />
            <Bar dataKey="count" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
