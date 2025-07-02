export default function formatDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}
