/**
 * Diferença a quantidade de dias de diferença entre a date1 e date2
 * @param date1 1° data
 * @param date2 2° data
 * @returns Quantidade de dias de diferença entra a data1 e data2
 */
export function dateDiffInDays(date1: Date, date2: Date) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
