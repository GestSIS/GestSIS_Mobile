import Api from "../http/Request.ts";
import type { Intervention } from "../models/intervention.ts";
import useGroupes from "../store/useGroupes.ts";
import useLocalites from "../store/useLocalites.ts";

export default {
  //TODO: Optionnel Nouvelle api - Récupérer les dernières interventions (n jours)
  getInterventions(): Promise<Intervention[]> {
    return Api.api().get("/interventions");
  },
  async exportInterventions(interventions: Intervention[]): Promise<string[]> {
    const localitesStore = useLocalites();
    const groupesStore = useGroupes();

    const formattedInterventions = interventions.map((i) => {
      const formattedLocalite = localitesStore.state.value.find(
        (l) => l.id == i.proprietaire?.localite_id,
      )?.designation;

      return {
        ...i,
        date_debut: i.date_debut?.split(" ")[0],
        heure_debut: i.date_debut?.split(" ")[1]?.slice(0, 5),
        date_fin: i.date_fin?.split(" ")[0],
        heure_fin: i.date_fin?.split(" ")[1],
        proprietaire:
          `${i.proprietaire?.nom ?? ""} ${i.proprietaire?.prenom ?? ""}\n` +
          `${
            i.proprietaire?.adresse ? (i.proprietaire.adresse ?? "") + ", " : ""
          }${formattedLocalite ?? ""}\n` +
          `${i.proprietaire?.email ? (i.proprietaire.email ?? "") + ", " : ""}${
            i.proprietaire?.telephone ?? ""
          }`,
        sapeurs: i.sapeurs.flatMap((sapeur) =>
          sapeur.presences.map((p) => ({
            debut: p.date_debut,
            fin: p.date_fin,
            sapeur_id: sapeur.id,
            piquet: p.piquet,
          })),
        ),
        groupes: i.groupes.map((id) =>
          groupesStore.state.value.find((g) => g.id == id),
        ),
        materiel: Object.entries(i.materiel).map(([key, value]) => ({
          materiel_id: parseInt(key),
          quantite: value,
        })),
        missions: i.missions
          .map((m) => ({
            titre: m.titre,
            resume: m.resume,
            debut: m.date_debut,
            fin: m.date_fin,
            sapeur_id: m.sapeur.id,
            sapeur: m.sapeur.designation,
          }))
          .map((m) => {
            const entry = m as { titre: string; resume: string; debut: string; fin: string; sapeur_id?: number | null; sapeur?: string | null };
            if (entry.sapeur_id) {
              delete entry.sapeur;
            } else {
              delete entry.sapeur_id;
            }
            return entry;
          }),
        jalons: i.jalons
          .map((j) => ({
            titre: j.titre,
            description: j.description,
            date_time: j.date_time,
            sapeur_id: j.sapeur?.id ?? null,
            sapeur: j.sapeur?.designation ?? null,
          }))
          .map((j) => {
            const entry = j as { titre: string; description: string; date_time: string; sapeur_id?: number | null; sapeur?: string | null };
            if (entry.sapeur_id) {
              delete entry.sapeur;
            } else {
              delete entry.sapeur_id;
            }
            return entry;
          }),
      };
    });

    const results = await Promise.allSettled(
      formattedInterventions.map((intervention) =>
        Api.api().post("/interventions-complet", intervention),
      ),
    );

    // Return the localUuids that were exported successfully, so the caller
    // removes only those. Failed ones stay queued for the next sync instead
    // of being lost, and successful ones are not re-sent (which duplicated
    // them server-side on a partial failure).
    return formattedInterventions
      .filter((_, index) => results[index].status === "fulfilled")
      .map((i) => i.localUuid)
      .filter((uuid): uuid is string => !!uuid);
  },
  createIntervention(interventionData: object) {
    return Api.api().post("/interventions", interventionData);
  },
  saveIntervention(interventionId: number, interventionData: object) {
    return Api.api().put("/interventions/" + interventionId, interventionData);
  },

  //Matériel
  addMateriel(interventionId: number, materielData: object) {
    return Api.api().post("/interventions/" + interventionId + "/materiels", {
      materiels: [materielData],
    });
  },
  editMateriel(interventionId: number, materielData: object) {
    return Api.api().put("/interventions/" + interventionId + "/materiels", {
      materiels: [materielData],
    });
  },
  removeMateriel(interventionId: number, materielId: number) {
    return Api.api().delete("/interventions/" + interventionId + "/materiels", {
      data: { materiels: [materielId] },
    });
  },

  //Vehicules
  addVehicules(interventionId: number, vehiculesData: object) {
    return Api.api().post("/interventions/" + interventionId + "/vehicules", {
      vehicules: vehiculesData,
    });
  },
  removeVehicules(interventionId: number, vehiculesId: number[]) {
    return Api.api().delete("/interventions/" + interventionId + "/vehicules", {
      data: { vehicules: vehiculesId },
    });
  },

  //Groupes
  addGroupes(interventionId: number, groupesData: object) {
    return Api.api().post("/interventions/" + interventionId + "/groupes", {
      groupes: groupesData,
    });
  },
  removeGroupes(interventionId: number, groupesId: number) {
    return Api.api().delete("/interventions/" + interventionId + "/groupes", {
      data: { groupes: groupesId },
    });
  },

  //Quittances
  addQuittances(interventionId: number, quittancesData: object) {
    return Api.api().post("/interventions/" + interventionId + "/quittances", {
      quittances: quittancesData,
    });
  },
  removeQuittances(interventionId: number, quittancesId: number) {
    return Api.api().delete(
      "/interventions/" + interventionId + "/quittances",
      {
        data: { quittances: quittancesId },
      },
    );
  },

  //Sapeurs
  addSapeurs(interventionId: number, sapeursData: object) {
    return Api.api().post(
      "/interventions/" + interventionId + "/sapeurs",
      sapeursData,
    );
  },
  editSapeurs(interventionId: number, sapeursData: object) {
    return Api.api().put(
      "/interventions/" + interventionId + "/sapeurs",
      sapeursData,
    );
  },
  removeSapeurs(interventionId: number, sapeursIds: number[]) {
    return Api.api().delete("/interventions/" + interventionId + "/sapeurs", {
      data: sapeursIds,
    });
  },

  //Appel
  addAppel(interventionId: number, appelData: object) {
    return Api.api().post("/interventions/" + interventionId + "/appels", {
      appels: [appelData],
    });
  },
  editAppel(interventionId: number, appelData: object) {
    return Api.api().put("/interventions/" + interventionId + "/appels", {
      appels: [appelData],
    });
  },
  removeAppel(interventionId: number, appelId: number) {
    return Api.api().delete("/interventions/" + interventionId + "/appels", {
      data: { appels: [appelId] },
    });
  },

  //Mission
  addMission(interventionId: number, missionData: object) {
    return Api.api().post("/interventions/" + interventionId + "/missions", {
      missions: [missionData],
    });
  },
  editMission(interventionId: number, missionData: object) {
    return Api.api().put("/interventions/" + interventionId + "/missions", {
      missions: [missionData],
    });
  },
  removeMission(interventionId: number, missionId: number) {
    return Api.api().delete("/interventions/" + interventionId + "/missions", {
      data: { missions: [missionId] },
    });
  },

  //Phase
  addPhase(interventionId: number, phaseData: object) {
    return Api.api().post("/interventions/" + interventionId + "/phases", {
      phases: [phaseData],
    });
  },
  editPhase(interventionId: number, phaseData: object) {
    return Api.api().put("/interventions/" + interventionId + "/phases", {
      phases: [phaseData],
    });
  },
  removePhase(interventionId: number, phaseId: number) {
    return Api.api().delete("/interventions/" + interventionId + "/phases", {
      data: { phases: [phaseId] },
    });
  },
};
