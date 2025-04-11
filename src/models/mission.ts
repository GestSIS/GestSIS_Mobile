export class Mission {
  localUuid: string = "";
  date_debut: string = "";
  date_fin: string = "";
  sapeur: {
    id: number | null;
    designation: string | null;
  } = {
    id: null,
    designation: null,
  };
  titre: string = "";
  resume: string = "";
}
