export class Groupe {
    id: number;
    type: number;
    no: number;
    designation: string;
    tri: number;
    pere_id: number;
    sapeur_ids: number[]; //TODO: Next correct to fit the effective returne type
}
