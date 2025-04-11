export interface PresenceExercice {
  id: number;
  convoque: boolean;
  present: boolean;
  remplace: boolean;
  absent: boolean;
  excuse: boolean;
  amende: boolean;
  excuse_type: string;
  sapeur_id: number | null;
  excuse_type_id: number | null;
  presenceStatut: number;
  heures: {
    id: number | null;
    heure_exercice_type_id: number;
    quantite: number;
  }[];
}
