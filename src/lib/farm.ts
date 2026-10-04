export const roundCoord = (n: number) => Math.round(n * 100) / 100;

export const AREA_STEP = 0.5;
export const AREA_MIN = 0.5;
export const AREA_MAX = 100;
export function stepArea(current: number, dir: 1 | -1) {
  const next = Math.round((current + dir * AREA_STEP) * 2) / 2;
  return Math.min(AREA_MAX, Math.max(AREA_MIN, next));
}

export const isValidPhone = (digits: string) => /^[6-9]\d{9}$/.test(digits);
