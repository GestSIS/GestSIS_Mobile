export interface Materiel {
  id: number;
  sapeur_id: number;
  taille: string;
  remarque: string;
  attribution: string;
  retour: string;
  materiel_type_id: string;
  materiel_id: number;
  materiel: {
    id: number,
    uuid: string|undefined,
    numero: string|undefined,
  };
}
