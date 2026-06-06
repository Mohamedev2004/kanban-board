import {
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
  TrendingUp,
} from "lucide-react"

import AppLayout from "../../layouts/app-layout"
import { useDirection } from "../../context/direction/direction-provider"
import { useTasksStats } from "@/hooks/tasks/use-tasks-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/tasks/dashboard/stat-card"
import { StatusDonutChart } from "@/components/tasks/dashboard/status-donut-chart"
import { PriorityBarChart } from "@/components/tasks/dashboard/priority-bar-chart"
import { TypeBarChart } from "@/components/tasks/dashboard/type-bar-chart"
import { CreatedAreaChart } from "@/components/tasks/dashboard/created-area-chart"

export default function UserDashboard() {
  const { t, locale } = useDirection()
  const { data: stats, isLoading } = useTasksStats()

  return (
    <AppLayout
      breadcrumbs={[
        { label: t("roles.overview"), href: "/user/dashboard" },
        { label: t("roles.dashboard") },
      ]}
    >
      <div className="flex flex-1 flex-col gap-4">
        {isLoading ? (
          <DashboardSkeleton />
        ) : !stats ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              {t("dashboard.empty")}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                label={t("dashboard.kpi.total")}
                value={stats.total}
                icon={ListTodo}
              />
              <StatCard
                label={t("dashboard.kpi.todo")}
                value={stats.by_status.todo}
                icon={ListTodo}
                accentClassName="bg-slate-500/10 text-slate-600 dark:text-slate-400"
              />
              <StatCard
                label={t("dashboard.kpi.inProgress")}
                value={stats.by_status.in_progress}
                icon={Loader2}
                accentClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              />
              <StatCard
                label={t("dashboard.kpi.done")}
                value={stats.by_status.done}
                icon={CheckCircle2}
                accentClassName="bg-green-500/10 text-green-600 dark:text-green-400"
              />
              <StatCard
                label={t("dashboard.kpi.overdue")}
                value={stats.overdue}
                icon={Clock}
                accentClassName="bg-red-500/10 text-red-600 dark:text-red-400"
              />
            </div>

            <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label={t("dashboard.kpi.completionRate")}
                value={`${stats.completion_rate}%`}
                icon={TrendingUp}
              />
              <StatCard
                label={t("dashboard.kpi.dueSoon")}
                value={stats.due_soon}
                icon={Clock}
              />
              <StatCard
                label={t("dashboard.kpi.completed")}
                value={stats.completed}
                icon={CheckCircle2}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <StatusDonutChart data={stats.by_status} t={t} />
              <PriorityBarChart data={stats.by_priority} t={t} />
              <TypeBarChart data={stats.by_type} t={t} />
              <CreatedAreaChart
                data={stats.created_series}
                locale={locale}
                t={t}
              />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 w-full rounded-md" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-[320px] w-full rounded-md" />
        ))}
      </div>
    </>
  )
}
