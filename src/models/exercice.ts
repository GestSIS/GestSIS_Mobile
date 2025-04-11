import type { PresenceExercice } from "./presence-exercice";

export interface Exercice {
  // Local data for modification
  localUuid: string;
  localStatus: "empty" | "in_progress" | "validated";
  initialSapeurs: PresenceExercice[];

  // Remote data
  id: number;
  date: string;
  heure: string;
  lieu: string;
  communications: string;
  designation: string;
  duree: number;
  statut: number;
  exercice_categorie_id: number;
  localite_id: number;
  sapeurs: PresenceExercice[];
}
