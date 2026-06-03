import AppLayout from "../../layouts/app-layout"
import { useDirection } from "../../context/direction/direction-provider"
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern"

export default function UserKanban() {
  const { t } = useDirection()

  // Empty placeholder board — three columns, no data wired up yet.
  const columns = [
    t("kanban.todo", "To Do"),
    t("kanban.inProgress", "In Progress"),
    t("kanban.done", "Done"),
  ]

  return (
    <AppLayout
      breadcrumbs={[
        { label: t("roles.overview"), href: "/user/dashboard" },
        { label: t("roles.kanban") },
      ]}
    >
      <div className="grid flex-1 auto-rows-min gap-4 md:grid-cols-3">
        {columns.map((title) => (
          <div key={title} className="flex flex-col gap-3 rounded-xl border bg-sidebar/40 p-3">
            <div className="px-1 text-sm font-medium text-muted-foreground">
              {title}
            </div>
            <PlaceholderPattern className="min-h-[70vh] flex-1 rounded-lg bg-sidebar" />
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
