import test from "node:test";
import assert from "node:assert/strict";
import {
  createScheduleSchema,
  updateScheduleSchema,
} from "./schedule.validator";

test("createScheduleSchema accepts valid payload", () => {
  const parsed = createScheduleSchema.parse({
    date: "2026-03-09",
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    isAvailable: true,
  });

  assert.equal(parsed.dayOfWeek, "Monday");
});

test("createScheduleSchema rejects invalid time range", () => {
  assert.throws(
    () =>
      createScheduleSchema.parse({
        date: "2026-03-09",
        dayOfWeek: "Monday",
        startTime: "10:00",
        endTime: "09:00",
      }),
    /startTime must be earlier than endTime/
  );
});

test("createScheduleSchema rejects mismatched day and date", () => {
  assert.throws(
    () =>
      createScheduleSchema.parse({
        date: "2026-03-09",
        dayOfWeek: "Tuesday",
        startTime: "09:00",
        endTime: "10:00",
      }),
    /dayOfWeek must match the provided date/
  );
});

test("updateScheduleSchema rejects empty payload", () => {
  assert.throws(() => updateScheduleSchema.parse({}), /At least one field/);
});

test("updateScheduleSchema rejects malformed time", () => {
  assert.throws(
    () =>
      updateScheduleSchema.parse({
        startTime: "25:00",
      }),
    /Invalid time format/
  );
});

test("updateScheduleSchema rejects mismatched day and date", () => {
  assert.throws(
    () =>
      updateScheduleSchema.parse({
        date: "2026-03-09",
        dayOfWeek: "Tuesday",
      }),
    /dayOfWeek must match the provided date/
  );
});
