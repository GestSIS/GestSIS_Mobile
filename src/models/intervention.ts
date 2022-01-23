import { Mission } from './mission';
import { Appel } from './appel';
import { Materiel } from './materiel';

export class Intervention {
  id: number;
  localUuid: string;
  en_creation= false;
  date_debut = new Date();
  date_fin: Date;
  objet: string;
  lieu: string;
  
  nb_personnes_sauvees = 0;
  nb_animaux_sauves = 0;

  rapport_police: boolean;
  agent: string;
  
  type_intervention_id: number;
  stat_federal_id: number;
  localite_id: number;
  sapeur_id: number;

  proprietaire: {
      nom: string;
      prenom: string;
      adresse: string;
      loc_id: number;
      telephone: string;
      email: string;
  } = {
    nom: null as any,
    prenom: null as any,
    adresse: null as any,
    loc_id: null as any,
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
    }>;
  }> = [];

  missions: Array<Mission> = [];
  appels: Array<Appel> = [];
  vehicules: Array<number> = [];
  materiel: Array<Materiel> = [];
  groupes: Array<number> = [];
}
