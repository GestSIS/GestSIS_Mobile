import Api from '@/http/Request';
import { Intervention } from '@/models/bundle';
import useGroupes from '@/store/useGroupes';
import useLocalites from '@/store/useLocalites';

export default {
  //TODO: Optionnel Nouvelle api - Récupérer les dernières interventions (n jours)
  getInterventions(): Promise<Intervention[]> {
    return Api.api().get('/interventions');
  },
  exportInterventions(interventions: Intervention[]): Promise<any> {
    const localitesStore = useLocalites();
    const groupesStore = useGroupes();

    const formattedInterventions = interventions.map((i) => {
      const formattedLocalite = localitesStore.state.value.find(
        (l) => l.id == i.proprietaire?.localite_id
      )?.designation;
      return {
        ...i,
        date_debut: i.date_debut.split(' ')[0],
        heure_debut: i.date_debut.split(' ')[1],
        date_fin: i.date_fin.split(' ')[0],
        heure_fin: i.date_fin.split(' ')[1],
        proprietaire:
          `${i.proprietaire.nom ?? ''} ${i.proprietaire.prenom ?? ''}\n` +
          `${
            i.proprietaire.adresse ? (i.proprietaire.adresse ?? '') + ', ' : ''
          }${formattedLocalite ?? ''}\n` +
          `${i.proprietaire.email ? i.proprietaire.email ?? '' + ', ' : ''}${
            i.proprietaire.telephone ?? ''
          }`,
        sapeurs: i.sapeurs.flatMap((sapeur) =>
          sapeur.presences.map((p) => ({
            debut: p.date_debut,
            fin: p.date_fin,
            sapeur_id: sapeur.id,
            piquet: p.piquet,
          }))
        ),
        groupes: i.groupes.map((id) =>
          groupesStore.state.value.find((g) => g.id == id)
        ),
        materiel: Object.entries(i.materiel).map(([key, value]) => ({
          materiel_id: parseInt(key),
          quantite: value,
        })),
        missions: i.missions.map((m) => ({
          titre: m.titre,
          resume: m.resume,
          debut: m.date_debut,
          fin: m.date_fin,
          sapeur_id: m.sapeur.id,
        })),
      };
    });

    return Promise.all(
      formattedInterventions.map((intervention) =>
        Api.api().post('/interventions-complet', intervention)
      )
    );
  },
  createIntervention(interventionData: any) {
    return Api.api().post('/interventions', interventionData);
  },
  saveIntervention(interventionId: number, interventionData: any) {
    return Api.api().put('/interventions/' + interventionId, interventionData);
  },

  //Matériel
  addMateriel(interventionId: number, materielData: any) {
    return Api.api().post('/interventions/' + interventionId + '/materiels', {
      materiels: [materielData],
    });
  },
  editMateriel(interventionId: number, materielData: any) {
    return Api.api().put('/interventions/' + interventionId + '/materiels', {
      materiels: [materielData],
    });
  },
  removeMateriel(interventionId: number, materielId: number) {
    return Api.api().delete('/interventions/' + interventionId + '/materiels', {
      data: { materiels: [materielId] },
    });
  },

  //Vehicules
  addVehicules(interventionId: number, vehiculesData: any) {
    return Api.api().post('/interventions/' + interventionId + '/vehicules', {
      vehicules: vehiculesData,
    });
  },
  removeVehicules(interventionId: number, vehiculesId: number[]) {
    return Api.api().delete('/interventions/' + interventionId + '/vehicules', {
      data: { vehicules: vehiculesId },
    });
  },

  //Groupes
  addGroupes(interventionId: number, groupesData: any) {
    return Api.api().post('/interventions/' + interventionId + '/groupes', {
      groupes: groupesData,
    });
  },
  removeGroupes(interventionId: number, groupesId: number) {
    return Api.api().delete('/interventions/' + interventionId + '/groupes', {
      data: { groupes: groupesId },
    });
  },

  //Quittances
  addQuittances(interventionId: number, quittancesData: any) {
    return Api.api().post('/interventions/' + interventionId + '/quittances', {
      quittances: quittancesData,
    });
  },
  removeQuittances(interventionId: number, quittancesId: number) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/quittances',
      {
        data: { quittances: quittancesId },
      }
    );
  },

  //Sapeurs
  addSapeurs(interventionId: number, sapeursData: any) {
    return Api.api().post(
      '/interventions/' + interventionId + '/sapeurs',
      sapeursData
    );
  },
  editSapeurs(interventionId: number, sapeursData: any) {
    return Api.api().put(
      '/interventions/' + interventionId + '/sapeurs',
      sapeursData
    );
  },
  removeSapeurs(interventionId: number, sapeursIds: number[]) {
    return Api.api().delete('/interventions/' + interventionId + '/sapeurs', {
      data: sapeursIds,
    });
  },

  //Appel
  addAppel(interventionId: number, appelData: any) {
    return Api.api().post('/interventions/' + interventionId + '/appels', {
      appels: [appelData],
    });
  },
  editAppel(interventionId: number, appelData: any) {
    return Api.api().put('/interventions/' + interventionId + '/appels', {
      appels: [appelData],
    });
  },
  removeAppel(interventionId: number, appelId: number) {
    return Api.api().delete('/interventions/' + interventionId + '/appels', {
      data: { appels: [appelId] },
    });
  },

  //Mission
  addMission(interventionId: number, missionData: any) {
    return Api.api().post('/interventions/' + interventionId + '/missions', {
      missions: [missionData],
    });
  },
  editMission(interventionId: number, missionData: any) {
    return Api.api().put('/interventions/' + interventionId + '/missions', {
      missions: [missionData],
    });
  },
  removeMission(interventionId: number, missionId: number) {
    return Api.api().delete('/interventions/' + interventionId + '/missions', {
      data: { missions: [missionId] },
    });
  },

  //Phase
  addPhase(interventionId: number, phaseData: any) {
    return Api.api().post('/interventions/' + interventionId + '/phases', {
      phases: [phaseData],
    });
  },
  editPhase(interventionId: number, phaseData: any) {
    return Api.api().put('/interventions/' + interventionId + '/phases', {
      phases: [phaseData],
    });
  },
  removePhase(interventionId: number, phaseId: number) {
    return Api.api().delete('/interventions/' + interventionId + '/phases', {
      data: { phases: [phaseId] },
    });
  },
};
