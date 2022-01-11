export class Presence {
  id: number;
  nom: string;
  prenom: string;
  convoque: boolean;
  present: boolean;
  remplace: boolean;
  absent: boolean;
  excuse: boolean;
  amende: boolean;
  excuse_type: string;
  excuse_type_id: number;
  presenceStatut = 0;
}
