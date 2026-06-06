import AppLayout from "@/layouts/app-layout"
import { useDirection } from "@/context/direction/direction-provider"
import { Card, CardContent } from "@/components/ui/card"
import { TasksDataTable } from "@/components/tasks/tasks-data-table"

type TasksPageProps = {
  dashboardHref?: string
  breadcrumbTaglineKey?: string
  breadcrumbLabelKey?: string
}

export default function TasksPage({
  dashboardHref = "/user/dashboard",
  breadcrumbTaglineKey = "roles.overview",
  breadcrumbLabelKey = "roles.tasks",
}: TasksPageProps) {
  const { t } = useDirection()

  return (
    <AppLayout
      breadcrumbs={[
        { label: t(breadcrumbTaglineKey), href: dashboardHref },
        { label: t(breadcrumbLabelKey) },
      ]}
    >
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h1 className="text-lg font-medium">{t("tasks.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("tasks.subtitle")}</p>
        </div>

        <Card className="overflow-visible backdrop-blur-sm">
          <CardContent className="pt-2">
            <TasksDataTable />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
