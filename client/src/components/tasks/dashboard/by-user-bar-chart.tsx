import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { TaskUserStat } from "@/api/types/tasks.types"
import {
  Card,
  CardContent,
  CardDescription,
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

type ByUserBarChartProps = {
  data?: TaskUserStat[]
  t: Translate
}

const TOP_N = 8

export function ByUserBarChart({ data, t }: ByUserBarChartProps) {
  if (!data || data.length === 0) return null

  const chartConfig = {
    total: { label: t("dashboard.kpi.total"), color: "var(--chart-1)" },
  } satisfies ChartConfig

  const chartData = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_N)
    .map((user) => ({ username: user.username, total: user.total }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.byUser")}</CardTitle>
        <CardDescription>{t("dashboard.charts.byUserDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 8 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="username"
              tickLine={false}
              axisLine={false}
              width={96}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="username" hideLabel />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
