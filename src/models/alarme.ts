export class Alarme {
  id: string;
  address: string;
  complement: string;
  location_wgs84: string;
  location_lv95: string;
  type: string;
  sis: string[];
  description: string;
  couleur: string;
  code: string;
  date_creation: string;
  debut_alarme: string;
  fin_alarme: string;
  has_been_read: boolean;
  groupes: Array<{
    name: string;
    number: string;
    sis: string;
  }> = [];
  firefighters: Array<{
    fullname: string;
    group_name: string;
    group_number: string;
    phone: string;
    sis: string;
    id: number;
  }> = [];
  unresolved: Array<{
    fullname: string;
    group_name: string;
    group_number: string;
    phone: string;
    sis: string;
  }> = [];
}
