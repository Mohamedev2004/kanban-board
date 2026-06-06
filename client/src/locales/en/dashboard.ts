export const dashboard = {
  dashboard: {
    kpi: {
      total: "Total tasks",
      todo: "To Do",
      inProgress: "In Progress",
      done: "Done",
      overdue: "Overdue",
      completed: "Completed",
      completionRate: "Completion rate",
      dueSoon: "Due soon",
      contributors: "Contributors",
    },
    charts: {
      byStatus: "Tasks by status",
      byStatusDesc: "Distribution across all statuses",
      byPriority: "Tasks by priority",
      byType: "Tasks by type",
      createdOverTime: "Created over time",
      createdOverTimeDesc: "New tasks over the last 30 days",
      byUser: "Top contributors",
      byUserDesc: "Tasks per user",
    },
    empty: "No data to display yet.",
  },
} as const
