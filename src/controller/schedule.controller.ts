import { Request, Response } from "express";
import {
  ScheduleServiceError,
  scheduleService,
} from "../services/schedule.service";
import {
  createScheduleSchema,
  doctorIdParamSchema,
  scheduleIdParamSchema,
  updateScheduleSchema,
} from "../validator/schedule.validator";
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
  console.error("[scheduleController]", error);

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: getFirstIssueMessage(error),
      data: null,
    });
  }

  if (error instanceof ScheduleServiceError) {
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

export const scheduleController = {
  // GET doctor schedules
  async list(req: Request, res: Response) {
    try {
      const { id: doctorId } = doctorIdParamSchema.parse(req.params);

      const schedules = await scheduleService.getDoctorSchedules(doctorId);

      return success(res, "Schedules fetched successfully", schedules);
    } catch (error) {
      return handleError(error, res);
    }
  },

  // GET single schedule
  async getOne(req: Request, res: Response) {
    try {
      const { id: scheduleId } = scheduleIdParamSchema.parse(req.params);

      const schedule = await scheduleService.getScheduleById(scheduleId);

      return success(res, "Schedule fetched successfully", schedule);
    } catch (error) {
      return handleError(error, res);
    }
  },

  // POST create schedule
  async create(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "doctor") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const parsed = createScheduleSchema.parse(req.body);

      const schedule = await scheduleService.createSchedule(req.user.id, parsed);

      return success(res, "Schedule created successfully", schedule, 201);
    } catch (err) {
      return handleError(err, res);
    }
  },

  // PATCH update schedule
  async update(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "doctor") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const { id: scheduleId } = scheduleIdParamSchema.parse(req.params);
      const parsed = updateScheduleSchema.parse(req.body);

      const schedule = await scheduleService.updateSchedule(
        scheduleId,
        req.user.id,
        parsed
      );

      return success(res, "Schedule updated successfully", schedule);
    } catch (error) {
      return handleError(error, res);
    }
  },

  // DELETE schedule
  async remove(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "doctor") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const { id: scheduleId } = scheduleIdParamSchema.parse(req.params);

      await scheduleService.deleteSchedule(scheduleId, req.user.id);

      return success(res, "Schedule deleted successfully", null);
    } catch (error) {
      return handleError(error, res);
    }
  },
};
