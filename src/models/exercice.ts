import { Presence } from './presence';

class Exercice {
  id: number;
  id_exe_lie: number;
  date: string;
  heure: string;
  en_creation = false;
  local = false;
  complet = false;
  lieu: string;
  communications: string;
  description: string;
  duree: number;
  statut: boolean;
  exercice_categorie_id: number;
  localite_id: number;
  presences_completees: boolean;
  sapeurs: Presence[]
}

export { Exercice}