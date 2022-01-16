import { Mission } from './mission';
import { Appel } from './appel';
import { Materiel } from './materiel';

export class Intervention {
  id: number;
  localUuid: string;
  en_creation= false;
  date_debut: string;
  date_fin: string;
  type_intervention_id: number;
  objet: string;
  lieu: string;
  loc_id: number;
  rapport_police: boolean;
  stat_fed_id: number;
  chef_inter_sap_id: number;
  nb_personnes_sauvees: number;
  nb_animaux_sauves: number;
  agent: string;

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

  description: string;
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
