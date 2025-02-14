export interface EventType {
  id: number;
  nom: string;
  description: string;
  validable: number;
  materiel_types: Array<{
    id: number;
    designation: string;
    materiel_categorie_id: string;
  }>;
}
