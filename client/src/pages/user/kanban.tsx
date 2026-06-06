import AppLayout from "../../layouts/app-layout"
import { useDirection } from "../../context/direction/direction-provider"
import { TaskBoard } from "@/components/tasks/task-board"

type KanbanPageProps = {
  dashboardHref?: string
  breadcrumbTaglineKey?: string
  breadcrumbLabelKey?: string
}

export default function UserKanban({
  dashboardHref = "/user/dashboard",
  breadcrumbTaglineKey = "roles.overview",
  breadcrumbLabelKey = "roles.kanban",
}: KanbanPageProps) {
  const { t } = useDirection()

  return (
    <AppLayout
      breadcrumbs={[
        { label: t(breadcrumbTaglineKey), href: dashboardHref },
        { label: t(breadcrumbLabelKey) },
      ]}
    >
      <TaskBoard />
    </AppLayout>
  )
}
