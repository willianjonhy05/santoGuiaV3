const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function splitDateString(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString ?? '');

  if (!match) {
    throw new Error('A data precisa estar no formato YYYY-MM-DD.');
  }

  const [, year, month, day] = match;

  return { year, month, day };
}

export function formatDateLong(dateString) {
  const { year, month, day } = splitDateString(dateString);
  const monthName = MONTHS[Number(month) - 1];

  return `${Number(day)} de ${monthName} de ${year}`;
}

export function formatDateShort(dateString) {
  const { year, month, day } = splitDateString(dateString);
  return `${day}/${month}/${year}`;
}
