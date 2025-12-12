export interface Groupe {
  id: number;
  type: number;
  no: string;
  designation: string;
  tri: number;
  pere_id: number;
  sapeur_ids: {
    id: number;
    sapeur_id: number;
  }[];
}
