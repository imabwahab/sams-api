import test from "node:test";
import assert from "node:assert/strict";
import {
  createDoctorSchema,
  doctorIdParamSchema,
  listDoctorsQuerySchema,
  updateDoctorSchema,
} from "./doctor.validator";

test("createDoctorSchema accepts valid payload", () => {
  const parsed = createDoctorSchema.parse({
    username: "dr_ahmed",
    email: "doctor@example.com",
    password: "password123",
    fullName: "Dr Ahmed",
    specialization: "Cardiology",
    consultationFee: 1500,
    experienceYears: 5,
  });

  assert.equal(parsed.username, "dr_ahmed");
  assert.equal(parsed.specialization, "Cardiology");
});

test("createDoctorSchema rejects invalid username", () => {
  assert.throws(
    () =>
      createDoctorSchema.parse({
        username: "dr ahmed",
        email: "doctor@example.com",
        password: "password123",
        fullName: "Dr Ahmed",
        specialization: "Cardiology",
      }),
    /Username can only contain letters, numbers, and underscores/
  );
});

test("updateDoctorSchema rejects empty payload", () => {
  assert.throws(() => updateDoctorSchema.parse({}), /At least one field/);
});

test("doctorIdParamSchema coerces id", () => {
  const parsed = doctorIdParamSchema.parse({ id: "12" });
  assert.equal(parsed.id, 12);
});

test("listDoctorsQuerySchema rejects empty search", () => {
  assert.throws(
    () => listDoctorsQuerySchema.parse({ search: "   " }),
    /Search term cannot be empty/
  );
});
