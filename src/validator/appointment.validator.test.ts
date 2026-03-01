import test from "node:test";
import assert from "node:assert/strict";
import {
  appointmentIdParamSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from "./appointment.validator";

test("createAppointmentSchema accepts valid payload", () => {
  const parsed = createAppointmentSchema.parse({
    doctorId: 10,
    date: "2026-03-02",
    startTime: "09:00",
    endTime: "09:30",
    notes: "Consultation",
  });

  assert.equal(parsed.doctorId, 10);
  assert.equal(parsed.date, "2026-03-02");
});

test("createAppointmentSchema rejects invalid range", () => {
  assert.throws(
    () =>
      createAppointmentSchema.parse({
        doctorId: 10,
        date: "2026-03-02",
        startTime: "11:00",
        endTime: "10:30",
      }),
    /startTime must be earlier than endTime/
  );
});

test("updateAppointmentSchema rejects empty payload", () => {
  assert.throws(() => updateAppointmentSchema.parse({}), /At least one field/);
});

test("updateAppointmentSchema rejects malformed time", () => {
  assert.throws(
    () =>
      updateAppointmentSchema.parse({
        startTime: "24:61",
      }),
    /Invalid time format/
  );
});

test("appointmentIdParamSchema coerces id", () => {
  const parsed = appointmentIdParamSchema.parse({ id: "7" });
  assert.equal(parsed.id, 7);
});
