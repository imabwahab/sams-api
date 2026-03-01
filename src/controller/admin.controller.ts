import { Request, Response } from "express";
import { AdminServiceError, adminService } from "../services/admin.service";

function success(res: Response, message: string, data: unknown, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function handleError(error: unknown, res: Response) {
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

function parsePositiveId(value: string): number {
  const id = Number.parseInt(value, 10);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AdminServiceError("Invalid admin id", 400);
  }

  return id;
}

export const adminController = {
  async list(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const isActiveQuery =
        typeof req.query.isActive === "string" ? req.query.isActive : undefined;
      const isActive =
        isActiveQuery === undefined
          ? undefined
          : isActiveQuery === "true"
            ? true
            : isActiveQuery === "false"
              ? false
              : undefined;

      const admins = await adminService.listAdmins({ search, isActive });
      return success(res, "Admins fetched successfully", admins);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const id = parsePositiveId(req.params.id);
      const admin = await adminService.getAdminById(id);
      return success(res, "Admin fetched successfully", admin);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const admin = await adminService.createAdmin(req.body);
      return success(res, "Admin created successfully", admin, 201);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const id = parsePositiveId(req.params.id);

      if (req.user?.id === id && req.body?.isActive === false) {
        throw new AdminServiceError("You cannot deactivate your own account", 400);
      }

      const admin = await adminService.updateAdmin(id, req.body);
      return success(res, "Admin updated successfully", admin);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const id = parsePositiveId(req.params.id);

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
