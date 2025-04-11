export interface Groupe {
  id: number;
  type: number;
  no: number;
  designation: string;
  tri: number;
  pere_id: number;
  sapeur_ids: {
    id: number;
    sapeur_id: number;
  }[];
}
