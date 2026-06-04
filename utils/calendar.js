const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function normalizeDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("Expected a valid Date instance");
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDateInputValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(ISO_DATE_RE);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatInputDate(date) {
  const normalizedDate = normalizeDate(date);
  const year = normalizedDate.getFullYear();
  const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
  const day = String(normalizedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateSerial(date) {
  const normalizedDate = normalizeDate(date);

  return Math.floor(
    Date.UTC(
      normalizedDate.getFullYear(),
      normalizedDate.getMonth(),
      normalizedDate.getDate()
    ) / DAY_MS
  );
}

export function isToday(date) {
  return getDateSerial(date) === getDateSerial(new Date());
}

export function calculateDayType(targetDate, startDate, startType = "work") {
  const diffDays = getDateSerial(targetDate) - getDateSerial(startDate);
  const cyclePosition = ((diffDays % 4) + 4) % 4;
  const startsWithWork = startType !== "off";
  const isFirstHalfOfCycle = cyclePosition < 2;

  return startsWithWork === isFirstHalfOfCycle ? "work" : "off";
}

export function generateCalendarMatrix(year, month, fillTrailingCells = true) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstWeekdayFromMonday = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < firstWeekdayFromMonday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  if (fillTrailingCells) {
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
  }

  return cells;
}
