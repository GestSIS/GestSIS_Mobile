export interface Sis {
  id: number;
  nom: string;
  abreviation: string | null;
  // Clé utilisée comme identifiant SIS côté app (en-tête `Sis-Key`,
  // clés de `permissions`, `activeSisKey`).
  api_key: string;
  // true si le SIS utilise GestSIS Mobile (données mobiles disponibles).
  mobile: boolean;
}
