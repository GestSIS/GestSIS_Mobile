import type { Mission } from "./mission.ts";
import type { Appel } from "./appel.ts";
import { DateTime } from "luxon";
import type { Alarme } from "./alarme.ts";
import { v4 as uuidv4 } from "uuid";

export class Intervention {
  localUuid: string = uuidv4();
  localStatus: "in_progress" | "validated" = "in_progress";

  id: number | null = null;
  // SQL format ("yyyy-MM-dd HH:mm") to stay consistent with the rest of the
  // app (useDateFormatter/BaseDatetime use fromSQL, and export splits on " ").
  date_debut =
    DateTime.now().toSQL({ includeOffset: false })?.slice(0, 16) ?? "";
  date_fin: string = "";
  objet: string = "";
  lieu: string = "";
  wgs84 = "";

  degre: number | null = null;
  stat_nb = 1; // Correspond au nombre d'interventions effectif
  sauve_personne = 0;
  sauve_animaux = 0;

  rapport_police = false;
  agent: string = "";

  type_intervention_id: number | null = null;
  stat_federal_id: number | null = null;
  localite_id: number | null = null;
  sapeur_id: number | null = null;

  proprietaire: {
    nom: string;
    prenom: string;
    adresse: string;
    localite_id: number | null;
    telephone: string;
    email: string;
  } = {
    nom: "",
    prenom: "",
    adresse: "",
    localite_id: null,
    telephone: "",
    email: "",
  };

  responsable: string = ""; // Utile ?

  description = "";
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

  quittances: number[] = [];
  missions: Mission[] = [];
  appels: Appel[] = [];
  materiel: any = {}; // id_materiel : quantite
  vehicules: number[] = [];
  groupes: number[] = [];

  alarme: Alarme | null = null;
}
