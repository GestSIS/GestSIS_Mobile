export class PresenceExercice {
  id: number;
  convoque: boolean;
  present: boolean;
  remplace: boolean;
  absent: boolean;
  excuse: boolean;
  amende: boolean;
  excuse_type: string;
  sapeur_id: string;
  excuse_type_id: number;
  presenceStatut = 0;
  heures:{
    id: number,
    heure_supplementaire_type_id: number,
    quantite: number,
  }[]
}
