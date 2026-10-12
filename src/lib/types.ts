export type DayKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export const DAYS: DayKey[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const DAY_LABELS: Record<DayKey, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
  domingo: 'Dom',
};

export const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8-22

export type PersonAvailability = {
  [day in DayKey]: number[];
};

export type AllAvailability = {
  [name: string]: PersonAvailability;
};

export type CellData = {
  count: number;
  available: string[];
  unavailable: string[];
};

export type HeatmapData = Record<DayKey, Record<number, CellData>>;