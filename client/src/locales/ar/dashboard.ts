export const dashboard = {
  dashboard: {
    kpi: {
      total: "إجمالي المهام",
      todo: "قيد الانتظار",
      inProgress: "قيد التنفيذ",
      done: "منجزة",
      overdue: "متأخرة",
      completed: "المكتملة",
      completionRate: "نسبة الإنجاز",
      dueSoon: "تستحق قريبًا",
      contributors: "المساهمون",
    },
    charts: {
      byStatus: "المهام حسب الحالة",
      byStatusDesc: "التوزيع عبر جميع الحالات",
      byPriority: "المهام حسب الأولوية",
      byType: "المهام حسب النوع",
      createdOverTime: "المنشأة عبر الزمن",
      createdOverTimeDesc: "المهام الجديدة خلال آخر 30 يومًا",
      byUser: "أبرز المساهمين",
      byUserDesc: "المهام لكل مستخدم",
    },
    empty: "لا توجد بيانات لعرضها بعد.",
  },
} as const
