export class Mission {
  localUuid: string;
  date_debut: string;
  date_fin: string;
  sapeur: {
    id: number | null;
    designation: string | null;
  } = {
    id: null as any,
    designation: null as any,
  };
  titre: string;
  resume: string;
}
