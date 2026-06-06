import { Label, Pie, PieChart } from "recharts"

import type { TaskStatsByStatus } from "@/api/types/tasks.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Translate = (key: string, fallback?: string) => string

type StatusDonutChartProps = {
  data: TaskStatsByStatus
  t: Translate
}

export function StatusDonutChart({ data, t }: StatusDonutChartProps) {
  const chartConfig = {
    todo: { label: t("dashboard.kpi.todo"), color: "var(--chart-1)" },
    in_progress: {
      label: t("dashboard.kpi.inProgress"),
      color: "var(--chart-2)",
    },
    done: { label: t("dashboard.kpi.done"), color: "var(--chart-3)" },
    overdue: { label: t("dashboard.kpi.overdue"), color: "var(--destructive)" },
  } satisfies ChartConfig

  const chartData = [
    { status: "todo", count: data.todo, fill: "var(--color-todo)" },
    {
      status: "in_progress",
      count: data.in_progress,
      fill: "var(--color-in_progress)",
    },
    { status: "done", count: data.done, fill: "var(--color-done)" },
    { status: "overdue", count: data.overdue, fill: "var(--color-overdue)" },
  ]

  const total =
    data.todo + data.in_progress + data.done + data.overdue

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.byStatus")}</CardTitle>
        <CardDescription>{t("dashboard.charts.byStatusDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="status" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={4}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-nowrap"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold text-nowrap"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 22}
                          className="fill-muted-foreground text-xs text-nowrap"
                        >
                          {t("dashboard.kpi.total")}
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
