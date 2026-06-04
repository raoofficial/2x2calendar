import {
  calculateDayType,
  formatInputDate,
  generateCalendarMatrix,
  isToday,
  normalizeDate,
  parseDateInputValue
} from "./utils/calendar.js";

const STORAGE_KEY = "twoByTwoSchedule:v2";
const LEGACY_STORAGE_KEY = "twoByTwoSchedule";
const VALID_DAY_TYPES = new Set(["work", "off"]);
const DAY_TYPE_LABELS = {
  work: "рабочий день",
  off: "выходной день"
};

const elements = {
  calendar: getRequiredElement("calendar"),
  monthLabel: getRequiredElement("monthLabel"),
  workCount: getRequiredElement("workCount"),
  offCount: getRequiredElement("offCount"),
  startDate: getRequiredElement("startDate"),
  startType: getRequiredElement("startType"),
  prevMonth: getRequiredElement("prevMonth"),
  nextMonth: getRequiredElement("nextMonth"),
  today: getRequiredElement("todayBtn"),
  status: getRequiredElement("status")
};

let currentDate = normalizeDate(new Date());
let settings = createDefaultSettings();

function getRequiredElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Element #${id} not found`);
  }

  return element;
}

function createDefaultSettings() {
  return {
    startDate: formatInputDate(new Date()),
    startType: "work"
  };
}

function normalizeSettings(value) {
  const fallback = createDefaultSettings();
  const startDate = parseDateInputValue(value?.startDate) ? value.startDate : fallback.startDate;
  const startType = VALID_DAY_TYPES.has(value?.startType) ? value.startType : fallback.startType;

  return {
    startDate,
    startType
  };
}

function migrateLegacySettings() {
  const legacySettings = localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!legacySettings || localStorage.getItem(STORAGE_KEY)) {
    return null;
  }

  try {
    const parsed = JSON.parse(legacySettings);
    const storedDate = typeof parsed.startDate === "string" ? parsed.startDate.slice(0, 10) : null;
    const legacyDate = storedDate && parseDateInputValue(storedDate)
      ? storedDate
      : formatInputDate(new Date(parsed.startDate));

    if (!parseDateInputValue(legacyDate)) {
      return null;
    }

    return normalizeSettings({
      startDate: legacyDate,
      startType: parsed.startType
    });
  } catch {
    return null;
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadSettings() {
  try {
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    const parsedSettings = storedSettings ? JSON.parse(storedSettings) : migrateLegacySettings();

    settings = normalizeSettings(parsedSettings);
    saveSettings();
  } catch {
    settings = createDefaultSettings();
    localStorage.removeItem(STORAGE_KEY);
  }

  syncInputs();
  renderCalendar();
}

function syncInputs() {
  elements.startDate.value = settings.startDate;
  elements.startType.value = settings.startType;
}

function getMonthName(date) {
  return date.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric"
  });
}

function getFullDateLabel(date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long"
  });
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = getMonthName(currentDate);
  const startDate = parseDateInputValue(settings.startDate) ?? normalizeDate(new Date());
  const matrix = generateCalendarMatrix(year, month);
  const fragment = document.createDocumentFragment();
  let workCount = 0;
  let offCount = 0;

  elements.monthLabel.textContent = monthName;
  elements.calendar.setAttribute("aria-label", `Календарь на ${monthName}`);

  for (const date of matrix) {
    if (!date) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "day empty";
      emptyCell.setAttribute("aria-hidden", "true");
      fragment.appendChild(emptyCell);
      continue;
    }

    const dayType = calculateDayType(date, startDate, settings.startType);
    const dayLabel = DAY_TYPE_LABELS[dayType];
    const dateLabel = getFullDateLabel(date);
    const dateKey = formatInputDate(date);
    const cell = document.createElement("time");

    cell.className = `day fade-in ${dayType}`;
    cell.dateTime = dateKey;
    cell.textContent = String(date.getDate());
    cell.title = `${dateLabel}: ${dayLabel}`;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `${dateLabel}, ${dayLabel}`);

    if (isToday(date)) {
      cell.classList.add("today");
      cell.setAttribute("aria-current", "date");
    }

    if (dayType === "work") {
      workCount += 1;
    } else {
      offCount += 1;
    }

    fragment.appendChild(cell);
  }

  elements.calendar.replaceChildren(fragment);
  elements.workCount.textContent = String(workCount);
  elements.offCount.textContent = String(offCount);
  elements.status.textContent = `${monthName}: рабочих дней — ${workCount}, выходных — ${offCount}.`;
}

function updateSchedule() {
  const selectedDate = parseDateInputValue(elements.startDate.value);
  const selectedType = elements.startType.value;

  if (!selectedDate || !VALID_DAY_TYPES.has(selectedType)) {
    syncInputs();
    return;
  }

  settings = {
    startDate: formatInputDate(selectedDate),
    startType: selectedType
  };

  saveSettings();
  renderCalendar();
}

function changeMonth(offset) {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
  renderCalendar();
}

elements.prevMonth.addEventListener("click", () => changeMonth(-1));
elements.nextMonth.addEventListener("click", () => changeMonth(1));
elements.today.addEventListener("click", () => {
  currentDate = normalizeDate(new Date());
  renderCalendar();
});
elements.startDate.addEventListener("change", updateSchedule);
elements.startType.addEventListener("change", updateSchedule);

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

loadSettings();
