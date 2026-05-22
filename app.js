import {
  calculateDayType,
  generateCalendarMatrix,
  isToday
} from "./utils/calendar.js";

const STORAGE_KEY =
  "twoByTwoSchedule";

const calendarEl =
  document.getElementById("calendar");

const monthLabelEl =
  document.getElementById("monthLabel");

const workCountEl =
  document.getElementById("workCount");

const offCountEl =
  document.getElementById("offCount");

const startDateInput =
  document.getElementById("startDate");

const startTypeSelect =
  document.getElementById("startType");

const prevMonthBtn =
  document.getElementById("prevMonth");

const nextMonthBtn =
  document.getElementById("nextMonth");

const todayBtn =
  document.getElementById("todayBtn");

let currentDate = new Date();

let settings = {
  startDate: new Date(),
  startType: "work"
};

function saveSettings() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      startDate:
        settings.startDate.toISOString(),

      startType:
        settings.startType
    })
  );
}

function loadSettings() {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (data) {

    const parsed =
      JSON.parse(data);

    settings = {
      ...parsed,
      startDate:
        new Date(parsed.startDate)
    };

  }

  syncInputs();

  renderCalendar();
}

function syncInputs() {

  startDateInput.value =
    formatInputDate(
      settings.startDate
    );

  startTypeSelect.value =
    settings.startType;
}

function formatInputDate(date) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthName(date) {

  return date.toLocaleDateString(
    "ru-RU",
    {
      month: "long",
      year: "numeric"
    }
  );
}

function renderCalendar() {

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const matrix =
    generateCalendarMatrix(
      year,
      month
    );

  monthLabelEl.textContent =
    getMonthName(currentDate);

  const fragment =
    document.createDocumentFragment();

  let workCount = 0;

  let offCount = 0;

  matrix.forEach((date) => {

    const cell =
      document.createElement("div");

    cell.className =
      "day fade-in";

    if (!date) {

      cell.classList.add("empty");

      fragment.appendChild(cell);

      return;
    }

    const type =
      calculateDayType(
        date,
        settings.startDate,
        settings.startType
      );

    cell.classList.add(type);

    if (isToday(date)) {
      cell.classList.add("today");
    }

    if (type === "work") {
      workCount++;
    } else {
      offCount++;
    }

    cell.textContent =
      date.getDate();

    fragment.appendChild(cell);

  });

  calendarEl.replaceChildren(
    fragment
  );

  workCountEl.textContent =
    workCount;

  offCountEl.textContent =
    offCount;
}

function updateSchedule() {

  settings.startDate =
    new Date(
      startDateInput.value
    );

  settings.startType =
    startTypeSelect.value;

  saveSettings();

  renderCalendar();
}

prevMonthBtn.addEventListener(
  "click",
  () => {

    currentDate =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );

    renderCalendar();

  }
);

nextMonthBtn.addEventListener(
  "click",
  () => {

    currentDate =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );

    renderCalendar();

  }
);

todayBtn.addEventListener(
  "click",
  () => {

    currentDate =
      new Date();

    renderCalendar();

  }
);

startDateInput.addEventListener(
  "change",
  updateSchedule
);

startTypeSelect.addEventListener(
  "change",
  updateSchedule
);

if ("serviceWorker" in navigator) {

  navigator.serviceWorker.register(
    "./sw.js"
  );

}

loadSettings();