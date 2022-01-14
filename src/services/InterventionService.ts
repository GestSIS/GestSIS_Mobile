import Api from '@/http/Request';
import { Intervention } from '@/models/bundle';

export default {
  //TODO: Nouvelle api - Récupérer les dernières interventions (n jours)
  getInterventions() : Promise<Intervention[]> {
    return Api.api().get('/interventions');
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
    return Api.api().delete(
      '/interventions/' + interventionId + '/materiels',
      {
        data: { materiels: [materielId] },
      }
    );
  },

  //Vehicules
  addVehicules(interventionId: number, vehiculesData: any) {
    return Api.api().post('/interventions/' + interventionId + '/vehicules', {
      vehicules: vehiculesData,
    });
  },
  removeVehicules(interventionId: number, vehiculesId: number[]) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/vehicules',
      {
        data: { vehicules: vehiculesId },
      }
    );
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

  // Rapport d'intervention
  downloadRapport(interventionId: number, params: any) {
    return Api.apiFileDownload('rapport.pdf').post(
      '/interventions/' + interventionId + '/rapport',
      params
    );
  },
};
