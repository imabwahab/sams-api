import test from "node:test";
import assert from "node:assert/strict";
import {
  adminIdParamSchema,
  createAdminSchema,
  listAdminsQuerySchema,
  updateAdminSchema,
} from "./admin.validator";

test("createAdminSchema accepts valid payload", () => {
  const parsed = createAdminSchema.parse({
    username: "admin_user",
    email: "admin@example.com",
    password: "strongPass123",
    fullName: "Main Admin",
    phone: "1234567890",
    isActive: true,
  });

  assert.equal(parsed.username, "admin_user");
  assert.equal(parsed.email, "admin@example.com");
});

test("updateAdminSchema rejects empty payload", () => {
  assert.throws(() => updateAdminSchema.parse({}), /At least one field/);
});

test("adminIdParamSchema coerces id", () => {
  const parsed = adminIdParamSchema.parse({ id: "5" });
  assert.equal(parsed.id, 5);
});

test("listAdminsQuerySchema parses isActive boolean", () => {
  const parsed = listAdminsQuerySchema.parse({ isActive: "false", search: "john" });
  assert.equal(parsed.isActive, false);
  assert.equal(parsed.search, "john");
});
