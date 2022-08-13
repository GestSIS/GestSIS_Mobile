export class Alarme {
    id: string;
    address: string;
    complement: string;
    location_wgs84: string;
    type: string;
    sis: string[];
    has_been_read: boolean;
    groupes: number[]
    firefighters: Array<{
        fullname: string;
        group_name: string;
        group_number: string;
        phone: string;
        sis: string;
        id: string;
    }> = [];
}
