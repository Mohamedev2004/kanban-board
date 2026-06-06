import { CheckCircle2, Clock, ListTodo, TrendingUp, Users } from "lucide-react"

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
import { ByUserBarChart } from "@/components/tasks/dashboard/by-user-bar-chart"

export default function AdminDashboard() {
  const { t, locale } = useDirection()
  const { data: stats, isLoading } = useTasksStats()

  return (
    <AppLayout
      breadcrumbs={[
        { label: t("roles.overview"), href: "/admin/dashboard" },
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
                label={t("dashboard.kpi.completed")}
                value={stats.completed}
                icon={CheckCircle2}
                accentClassName="bg-green-500/10 text-green-600 dark:text-green-400"
              />
              <StatCard
                label={t("dashboard.kpi.overdue")}
                value={stats.overdue}
                icon={Clock}
                accentClassName="bg-red-500/10 text-red-600 dark:text-red-400"
              />
              <StatCard
                label={t("dashboard.kpi.completionRate")}
                value={`${stats.completion_rate}%`}
                icon={TrendingUp}
                accentClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              />
              <StatCard
                label={t("dashboard.kpi.contributors")}
                value={stats.by_user?.length ?? 0}
                icon={Users}
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
            <ByUserBarChart data={stats.by_user} t={t} />
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
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-[320px] w-full rounded-md" />
        ))}
      </div>
    </>
  )
}
