export const system = {
  validation: {
    required: "Ce champ est requis.",
    email: "Saisissez une adresse e-mail valide.",
    min: "Doit contenir au moins {min} caractères.",
    max: "Doit contenir au plus {max} caractères.",
    len: "Doit contenir exactement {len} caractères.",
    invalid: "Valeur invalide.",
  },
  api: {
    defaultError: "Une erreur s'est produite. Veuillez réessayer.",
    sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
    forbidden: "Vous n'avez pas l'autorisation d'effectuer cette action.",
    serverError: "Une erreur serveur est survenue.",
    networkError:
      "Impossible de joindre le serveur. Vérifiez qu'il est démarré.",
  },
} as const
