export class Mission {
    date_debut: string;
    date_fin: string;
    sapeur: {
      id: number;
      nom: string;
      prenom: string;
    } = {
      id: null as any,
      nom: null as any,
      prenom: null as any
    };
    titre: string;
    resume: string;
}
