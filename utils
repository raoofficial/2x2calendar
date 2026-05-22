const DAY_MS = 86400000;

export function normalizeDate(date) {

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

}

export function isToday(date) {

  const today =
    normalizeDate(
      new Date()
    );

  return (
    date.getTime() ===
    today.getTime()
  );
}

export function calculateDayType(
  targetDate,
  startDate,
  startType
) {

  const normalizedTarget =
    normalizeDate(targetDate);

  const normalizedStart =
    normalizeDate(startDate);

  const diffDays = Math.floor(

    (
      normalizedTarget -
      normalizedStart
    ) / DAY_MS

  );

  const cyclePosition =

    (
      (diffDays % 4) + 4
    ) % 4;

  const startIsWork =
    startType === "work";

  if (startIsWork) {

    return cyclePosition < 2
      ? "work"
      : "off";

  }

  return cyclePosition < 2
    ? "off"
    : "work";
}

export function generateCalendarMatrix(
  year,
  month
) {

  const firstDay =
    new Date(year, month, 1);

  const lastDay =
    new Date(year, month + 1, 0);

  const daysInMonth =
    lastDay.getDate();

  let startingWeekDay =
    firstDay.getDay();

  startingWeekDay =
    startingWeekDay === 0
      ? 6
      : startingWeekDay - 1;

  const cells = [];

  for (
    let i = 0;
    i < startingWeekDay;
    i++
  ) {

    cells.push(null);

  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    cells.push(
      new Date(
        year,
        month,
        day
      )
    );

  }

  return cells;
}
