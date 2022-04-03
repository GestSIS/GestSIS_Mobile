import { Mission } from './mission';
import { Appel } from './appel';
import { DateTime } from 'luxon';

export class Intervention {
  localUuid: string;
  localStatus: "in_progress" | "validated";

  id: number;
  date_debut = DateTime.now().toISO();
  date_fin: string;
  objet: string;
  lieu: string;

  degre: number;
  stat_nb = 1; // Correspond au nombre d'interventions effectif
  sauve_personne = 0;
  sauve_animaux = 0;

  rapport_police = false;
  agent: string;
  
  type_intervention_id: number;
  stat_federal_id: number;
  localite_id: number;
  sapeur_id: number;

  proprietaire: {
      nom: string;
      prenom: string;
      adresse: string;
      localite_id: number;
      telephone: string;
      email: string;
  } = {
    nom: null as any,
    prenom: null as any,
    adresse: null as any,
    localite_id: null as any,
    telephone: null as any,
    email: null as any
  };

  responsables: string; // Utile ?

  description = '';
  sapeurs: Array<{
    id: number;
    nom: string;
    prenom: string;
    presences: Array<{
      date_debut: string;
      date_fin: string;
      piquet: boolean;
    }>;
  }> = [];

  missions: Mission[] = [];
  appels: Appel[] = [];
  materiel: any; // id_materiel : quantite
  vehicules: number[];
  groupes: number[] = [];
}
