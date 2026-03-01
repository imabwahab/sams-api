import test from "node:test";
import assert from "node:assert/strict";
import { Request, Response } from "express";
import { adminController } from "./admin.controller";
import { adminService } from "../services/admin.service";

function createMockResponse() {
  const response = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response as unknown as Response & {
    statusCode: number;
    body: unknown;
  };
}

const sampleAdmin = {
  id: 2,
  username: "admin_2",
  email: "admin2@example.com",
  fullName: "Admin Two",
  phone: null,
  role: "admin" as const,
  isActive: true,
  createdAt: new Date("2026-03-01T00:00:00.000Z"),
};

test("adminController.list returns admins", async () => {
  const original = adminService.listAdmins;

  adminService.listAdmins = async () => [sampleAdmin];

  const req = {
    user: { id: 1, role: "admin" },
    query: {},
  } as unknown as Request;
  const res = createMockResponse();

  await adminController.list(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal((res.body as { success: boolean }).success, true);

  adminService.listAdmins = original;
});

test("adminController.getOne returns a single admin", async () => {
  const original = adminService.getAdminById;

  adminService.getAdminById = async () => sampleAdmin;

  const req = {
    user: { id: 1, role: "admin" },
    params: { id: "2" },
  } as unknown as Request;
  const res = createMockResponse();

  await adminController.getOne(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal((res.body as { success: boolean }).success, true);

  adminService.getAdminById = original;
});

test("adminController.create creates admin", async () => {
  const original = adminService.createAdmin;

  adminService.createAdmin = async () => sampleAdmin;

  const req = {
    user: { id: 1, role: "admin" },
    body: {
      username: "new_admin",
      email: "new_admin@example.com",
      password: "secret123",
      fullName: "New Admin",
    },
  } as unknown as Request;
  const res = createMockResponse();

  await adminController.create(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal((res.body as { success: boolean }).success, true);

  adminService.createAdmin = original;
});

test("adminController.update updates admin", async () => {
  const original = adminService.updateAdmin;

  adminService.updateAdmin = async () => sampleAdmin;

  const req = {
    user: { id: 1, role: "admin" },
    params: { id: "2" },
    body: {
      fullName: "Updated Admin",
    },
  } as unknown as Request;
  const res = createMockResponse();

  await adminController.update(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal((res.body as { success: boolean }).success, true);

  adminService.updateAdmin = original;
});

test("adminController.remove deletes admin", async () => {
  const original = adminService.deleteAdmin;

  adminService.deleteAdmin = async () => {};

  const req = {
    user: { id: 1, role: "admin" },
    params: { id: "2" },
  } as unknown as Request;
  const res = createMockResponse();

  await adminController.remove(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal((res.body as { success: boolean }).success, true);

  adminService.deleteAdmin = original;
});
