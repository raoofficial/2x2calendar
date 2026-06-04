import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateDayType,
  formatInputDate,
  generateCalendarMatrix,
  parseDateInputValue
} from "../utils/calendar.js";

describe("date parsing and formatting", () => {
  it("parses date input values as local calendar dates", () => {
    const date = parseDateInputValue("2026-06-04");

    assert.equal(date.getFullYear(), 2026);
    assert.equal(date.getMonth(), 5);
    assert.equal(date.getDate(), 4);
    assert.equal(formatInputDate(date), "2026-06-04");
  });

  it("rejects impossible or malformed dates", () => {
    assert.equal(parseDateInputValue("2026-02-30"), null);
    assert.equal(parseDateInputValue("04.06.2026"), null);
    assert.equal(parseDateInputValue(""), null);
  });
});

describe("2x2 schedule calculation", () => {
  const start = parseDateInputValue("2026-06-01");

  it("keeps two work days followed by two days off", () => {
    assert.equal(calculateDayType(parseDateInputValue("2026-06-01"), start, "work"), "work");
    assert.equal(calculateDayType(parseDateInputValue("2026-06-02"), start, "work"), "work");
    assert.equal(calculateDayType(parseDateInputValue("2026-06-03"), start, "work"), "off");
    assert.equal(calculateDayType(parseDateInputValue("2026-06-04"), start, "work"), "off");
    assert.equal(calculateDayType(parseDateInputValue("2026-06-05"), start, "work"), "work");
  });

  it("supports schedules that start with days off", () => {
    assert.equal(calculateDayType(parseDateInputValue("2026-06-01"), start, "off"), "off");
    assert.equal(calculateDayType(parseDateInputValue("2026-06-02"), start, "off"), "off");
    assert.equal(calculateDayType(parseDateInputValue("2026-06-03"), start, "off"), "work");
  });

  it("calculates days before the start date correctly", () => {
    assert.equal(calculateDayType(parseDateInputValue("2026-05-31"), start, "work"), "off");
    assert.equal(calculateDayType(parseDateInputValue("2026-05-30"), start, "work"), "off");
    assert.equal(calculateDayType(parseDateInputValue("2026-05-29"), start, "work"), "work");
  });

  it("is stable across daylight-saving-time boundaries", () => {
    const dstStart = parseDateInputValue("2026-03-28");

    assert.equal(calculateDayType(parseDateInputValue("2026-03-28"), dstStart, "work"), "work");
    assert.equal(calculateDayType(parseDateInputValue("2026-03-29"), dstStart, "work"), "work");
    assert.equal(calculateDayType(parseDateInputValue("2026-03-30"), dstStart, "work"), "off");
  });
});

describe("calendar matrix", () => {
  it("starts the week on Monday", () => {
    const matrix = generateCalendarMatrix(2026, 4);

    assert.equal(matrix[0], null);
    assert.equal(matrix[1], null);
    assert.equal(matrix[2], null);
    assert.equal(matrix[3], null);
    assert.equal(formatInputDate(matrix[4]), "2026-05-01");
  });

  it("fills the last week with empty cells", () => {
    const matrix = generateCalendarMatrix(2026, 2);

    assert.equal(matrix.length, 42);
    assert.equal(matrix.length % 7, 0);
    assert.equal(formatInputDate(matrix[6]), "2026-03-01");
    assert.equal(formatInputDate(matrix[36]), "2026-03-31");
    assert.equal(matrix[41], null);
  });
});
