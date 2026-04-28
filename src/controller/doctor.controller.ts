import { Request, Response } from "express";
import { z } from "zod";
import {
  createDoctorSchema,
  doctorIdParamSchema,
  listDoctorsQuerySchema,
  updateDoctorSchema,
  updateOwnDoctorSchema,
} from "../validator/doctor.validator";
import {
  DoctorServiceError,
  doctorService,
} from "../services/doctor.service";

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

function mapDoctorProfileFields<T extends { doctorProfile?: any }>(doctor: T) {
  return {
    ...doctor,
    specialization: doctor.doctorProfile?.specialization ?? null,
    bio: doctor.doctorProfile?.bio ?? null,
    consultationFee: doctor.doctorProfile?.consultationFee ?? null,
    experienceYears: doctor.doctorProfile?.experienceYears ?? null,
  };
}

function handleError(error: unknown, res: Response) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: getFirstIssueMessage(error),
      data: null,
    });
  }

  if (error instanceof DoctorServiceError) {
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

export const doctorController = {
  async list(req: Request, res: Response) {
    try {
      const parsed = listDoctorsQuerySchema.parse(req.query);
      const doctors = await doctorService.listDoctors(parsed);
      return success(res, "Doctors fetched successfully", doctors);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = doctorIdParamSchema.parse(req.params);
      const doctor = await doctorService.getDoctorById(id);
      return success(res, "Doctor fetched successfully", doctor);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "doctor") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const doctor = await doctorService.getOwnDoctorById(req.user.id);
      return success(
        res,
        "Doctor profile fetched successfully",
        mapDoctorProfileFields(doctor)
      );
    } catch (error) {
      return handleError(error, res);
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const parsed = createDoctorSchema.parse(req.body);
      const doctor = await doctorService.createDoctor(parsed);
      return success(res, "Doctor created successfully", doctor, 201);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const { id } = doctorIdParamSchema.parse(req.params);
      const parsed = updateDoctorSchema.parse(req.body);
      const doctor = await doctorService.updateDoctor(id, parsed);
      return success(res, "Doctor updated successfully", doctor);
    } catch (error) {
      return handleError(error, res);
    }
  },

  async updateMe(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "doctor") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const parsed = updateOwnDoctorSchema.parse(req.body);
      const doctor = await doctorService.updateOwnDoctor(req.user.id, parsed);
      return success(
        res,
        "Doctor profile updated successfully",
        mapDoctorProfileFields(doctor)
      );
    } catch (error) {
      return handleError(error, res);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;

      const { id } = doctorIdParamSchema.parse(req.params);
      await doctorService.deleteDoctor(id);
      return success(res, "Doctor deleted successfully", null);
    } catch (error) {
      return handleError(error, res);
    }
  },
};
