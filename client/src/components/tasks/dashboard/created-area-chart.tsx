import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { TaskSeriesPoint } from "@/api/types/tasks.types"
import type { Locale } from "@/context/direction/direction-provider"
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

type CreatedAreaChartProps = {
  data: TaskSeriesPoint[]
  locale: Locale
  t: Translate
}

function localeTag(locale: Locale) {
  return locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US"
}

export function CreatedAreaChart({ data, locale, t }: CreatedAreaChartProps) {
  const chartConfig = {
    count: { label: t("dashboard.kpi.total"), color: "var(--chart-1)" },
  } satisfies ChartConfig

  const tag = localeTag(locale)

  function formatTick(value: string): string {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString(tag, { month: "short", day: "numeric" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.createdOverTime")}</CardTitle>
        <CardDescription>
          {t("dashboard.charts.createdOverTimeDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[260px] w-full">
          <AreaChart accessibilityLayer data={data} margin={{ left: 4, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={formatTick}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatTick(String(value))}
                  indicator="line"
                />
              }
            />
            <defs>
              <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              dataKey="count"
              type="natural"
              fill="url(#fillCreated)"
              stroke="var(--color-count)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
