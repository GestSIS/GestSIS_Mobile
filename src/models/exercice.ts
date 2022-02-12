export class Exercice {
  localUuid: string;
  id: number;
  date: string;
  heure: string;
  en_creation = false;
  local = false;
  complet = false;
  lieu: string;
  communications: string;
  designation: string;
  duree: number;
  statut: number;
  exercice_categorie_id: number;
  localite_id: number;
  presences_completees: boolean;
  sapeurs: Array<{
    id: number;
    convoque: boolean;
    present: boolean;
    remplace: boolean;
    absent: boolean;
    excuse: boolean;
    amende: boolean;
    sapeur_id: string;
    excuse_type: string;
    excuse_type_id: number;
    presenceStatut: number;
  }>;
  initialSapeurs: Array<{
    id: number;
    convoque: boolean;
    present: boolean;
    remplace: boolean;
    absent: boolean;
    excuse: boolean;
    amende: boolean;
    sapeur_id: string;
    excuse_type: string;
    excuse_type_id: number;
    presenceStatut: number;
  }>;
}
