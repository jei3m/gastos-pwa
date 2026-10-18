export const timeStringToDate = (
  timeString?: string
): Date | undefined => {
  if (!timeString) return undefined;
  const [hours, minutes] = timeString
    .split(':')
    .map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const dateToTimeString = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date
    .getMinutes()
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}`;
};
