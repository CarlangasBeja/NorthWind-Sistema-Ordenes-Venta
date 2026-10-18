/** Display formats used by the Blazor views ($ {value:N2}, dd/MM/yyyy HH:mm). */
const moneyFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(value: number): string {
  return `$ ${moneyFormat.format(value ?? 0)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** The API sends local server dates without a time zone: they are shown as they come. */
function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function shortDate(value: string | Date): string {
  const date = toDate(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function time(value: string | Date): string {
  const date = toDate(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function dateTime(value: string | Date): string {
  return `${shortDate(value)} ${time(value)}`;
}
