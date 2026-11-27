export interface Sapeur {
  id: number;
  nom: string;
  prenom: string;
  // 0 = jamais, 1 = actif, 2 = inactif (recalculé depuis les mutations)
  statut_sapeur: number;
  statut_civil: number;
}

export const STATUT_ACTIF = 1;
