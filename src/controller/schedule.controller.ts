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

function handleError(error: unknown, res: Response) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: getFirstIssueMessage(error) });
  }

  if (error instanceof ScheduleServiceError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  return res.status(500).json({ message: "Internal Server Error" });
}

export const scheduleController = {
  // GET doctor schedules
  async list(req: Request, res: Response) {
    try {
      const { id: doctorId } = doctorIdParamSchema.parse(req.params);

      const schedules = await scheduleService.getDoctorSchedules(doctorId);

      return res.json(schedules);
    } catch (error) {
      return handleError(error, res);
    }
  },

  // GET single schedule
  async getOne(req: Request, res: Response) {
    try {
      const { id: scheduleId } = scheduleIdParamSchema.parse(req.params);

      const schedule = await scheduleService.getScheduleById(scheduleId);

      return res.json(schedule);
    } catch (error) {
      return handleError(error, res);
    }
  },

  // POST create schedule
  async create(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "doctor") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsed = createScheduleSchema.parse(req.body);

      const schedule = await scheduleService.createSchedule(
        req.user!.id,
        parsed
      );

      return res.status(201).json(schedule);
    } catch (err) {
      return handleError(err, res);
    }
  },

  // PATCH update schedule
  async update(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "doctor") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id: scheduleId } = scheduleIdParamSchema.parse(req.params);
      const parsed = updateScheduleSchema.parse(req.body);

      const schedule = await scheduleService.updateSchedule(
        scheduleId,
        req.user.id,
        parsed
      );

      return res.json(schedule);
    } catch (error) {
      return handleError(error, res);
    }
  },

  // DELETE schedule
  async remove(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "doctor") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id: scheduleId } = scheduleIdParamSchema.parse(req.params);

      await scheduleService.deleteSchedule(scheduleId, req.user.id);

      return res.status(204).send();
    } catch (error) {
      return handleError(error, res);
    }
  },
};
