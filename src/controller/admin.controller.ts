import { Request, Response } from "express";
import { z } from "zod";
import {
  adminIdParamSchema,
  createAdminSchema,
  listAdminsQuerySchema,
  updateAdminSchema,
} from "../validator/admin.validator";
import { AdminServiceError, adminService } from "../services/admin.service";

function getFirstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}

function success(res: Response, message: string, data: unknown, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function handleError(error: unknown, res: Response) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: getFirstIssueMessage(error),
      data: null,
    });
  }

  if (error instanceof AdminServiceError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: null,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    data: null,
  });
}

function ensureAdmin(req: Request, res: Response): boolean {
  if (!req.user || req.user.role !== "admin") {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
      data: null,
    });
    return false;
  }

  return true;
}

export const adminController = {
  async list(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const parsed = listAdminsQuerySchema.parse(req.query);
      const admins = await adminService.listAdmins(parsed);
      return success(res, "Admins fetched successfully", admins);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const { id } = adminIdParamSchema.parse(req.params);
      const admin = await adminService.getAdminById(id);
      return success(res, "Admin fetched successfully", admin);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const parsed = createAdminSchema.parse(req.body);
      const admin = await adminService.createAdmin(parsed);
      return success(res, "Admin created successfully", admin, 201);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const { id } = adminIdParamSchema.parse(req.params);
      const parsed = updateAdminSchema.parse(req.body);

      if (req.user?.id === id && parsed.isActive === false) {
        throw new AdminServiceError("You cannot deactivate your own account", 400);
      }

      const admin = await adminService.updateAdmin(id, parsed);
      return success(res, "Admin updated successfully", admin);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const { id } = adminIdParamSchema.parse(req.params);

      if (req.user?.id === id) {
        throw new AdminServiceError("You cannot delete your own account", 400);
      }

      await adminService.deleteAdmin(id);
      return success(res, "Admin deleted successfully", null);
    } catch (error) {
      return handleError(error, res);
    }
  },
};
