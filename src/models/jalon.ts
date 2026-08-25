export class Jalon {
  localUuid: string = "";
  titre: string = "";
  description: string = "";
  date_time: string = "";
  sapeur: {
    id: number | null;
    designation: string | null;
  } = {
    id: null,
    designation: null,
  };
}
