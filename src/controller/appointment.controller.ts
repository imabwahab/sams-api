import { Request, Response } from "express";
import {
  AppointmentServiceError,
  appointmentService,
} from "../services/appointment.service";
import {
  appointmentIdParamSchema,
  createAppointmentSchema,
  listAppointmentsQuerySchema,
  updateAppointmentSchema,
} from "../validator/appointment.validator";
import { z } from "zod";

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

  if (error instanceof AppointmentServiceError) {
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

export const appointmentController = {
  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const { status } = listAppointmentsQuerySchema.parse(req.query);
      const data = await appointmentService.listAppointments(
        { id: req.user.id, role: req.user.role },
        status
      );

      return success(res, "Appointments fetched successfully", data);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const { id } = appointmentIdParamSchema.parse(req.params);
      const appointment = await appointmentService.getAppointmentById(id, {
        id: req.user.id,
        role: req.user.role,
      });

      return success(res, "Appointment fetched successfully", appointment);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "patient") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const parsed = createAppointmentSchema.parse(req.body);
      const appointment = await appointmentService.createAppointment(
        req.user.id,
        parsed
      );

      return success(res, "Appointment created successfully", appointment, 201);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const { id } = appointmentIdParamSchema.parse(req.params);
      const parsed = updateAppointmentSchema.parse(req.body);

      const appointment = await appointmentService.updateAppointment(
        id,
        { id: req.user.id, role: req.user.role },
        parsed
      );

      return success(res, "Appointment updated successfully", appointment);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const { id } = appointmentIdParamSchema.parse(req.params);
      await appointmentService.deleteAppointment(id, {
        id: req.user.id,
        role: req.user.role,
      });

      return success(res, "Appointment deleted successfully", null);
    } catch (error) {
      return handleError(error, res);
    }
  },
};
