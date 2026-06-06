export const dashboard = {
  dashboard: {
    kpi: {
      total: "Total des tâches",
      todo: "À faire",
      inProgress: "En cours",
      done: "Terminé",
      overdue: "En retard",
      completed: "Terminées",
      completionRate: "Taux d'achèvement",
      dueSoon: "Bientôt dues",
      contributors: "Contributeurs",
    },
    charts: {
      byStatus: "Tâches par statut",
      byStatusDesc: "Répartition entre tous les statuts",
      byPriority: "Tâches par priorité",
      byType: "Tâches par type",
      createdOverTime: "Créées au fil du temps",
      createdOverTimeDesc: "Nouvelles tâches sur les 30 derniers jours",
      byUser: "Meilleurs contributeurs",
      byUserDesc: "Tâches par utilisateur",
    },
    empty: "Aucune donnée à afficher pour le moment.",
  },
} as const
