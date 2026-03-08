import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SAMS API",
      version: "1.0.0",
      description:
        "API documentation for authentication, doctors, schedules, appointments, and admin management.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "auth", description: "Authentication and account endpoints" },
      { name: "doctor", description: "Doctor management endpoints" },
      { name: "schedule", description: "Doctor schedule endpoints" },
      { name: "appointment", description: "Appointment management endpoints" },
      { name: "admin", description: "Admin management endpoints" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            data: { nullable: true, example: null },
          },
          required: ["success", "message", "data"],
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", format: "email", example: "john@example.com" },
            username: { type: "string", example: "john_doe" },
            role: {
              type: "string",
              enum: ["patient", "doctor", "admin"],
              example: "patient",
            },
            fullName: { type: "string", example: "John Doe" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
          required: ["id", "username", "role", "fullName"],
        },
        DoctorProfile: {
          type: "object",
          properties: {
            id: { type: "integer", example: 12 },
            specialization: { type: "string", example: "Cardiology" },
            bio: { type: "string", nullable: true, example: "10+ years of experience." },
            consultationFee: { type: "integer", example: 3000 },
            experienceYears: { type: "integer", example: 10 },
          },
        },
        UserMe: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", format: "email", nullable: true },
            username: { type: "string", example: "john_doe" },
            role: { type: "string", enum: ["patient", "doctor", "admin"] },
            fullName: { type: "string", example: "John Doe" },
            isActive: { type: "boolean", example: true },
            doctorProfile: {
              allOf: [{ $ref: "#/components/schemas/DoctorProfile" }],
              nullable: true,
            },
          },
        },
        Admin: {
          type: "object",
          properties: {
            id: { type: "integer", example: 2 },
            username: { type: "string", example: "admin_user" },
            email: { type: "string", format: "email", nullable: true },
            fullName: { type: "string", example: "Admin User" },
            phone: { type: "string", nullable: true, example: "+1234567890" },
            role: { type: "string", example: "admin" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Doctor: {
          type: "object",
          properties: {
            id: { type: "integer", example: 10 },
            username: { type: "string", example: "dr_smith" },
            email: { type: "string", format: "email", nullable: true },
            fullName: { type: "string", example: "Dr. Smith" },
            phone: { type: "string", nullable: true, example: "+1234567890" },
            role: { type: "string", example: "doctor" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            doctorProfile: { $ref: "#/components/schemas/DoctorProfile" },
          },
        },
        Schedule: {
          type: "object",
          properties: {
            id: { type: "integer", example: 4 },
            doctorId: { type: "integer", example: 10 },
            dayOfWeek: {
              type: "string",
              enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              example: "Monday",
            },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "13:00" },
            isAvailable: { type: "boolean", example: true },
          },
        },
        AppointmentParty: {
          type: "object",
          properties: {
            id: { type: "integer", example: 5 },
            fullName: { type: "string", example: "Alice Johnson" },
            email: { type: "string", format: "email", nullable: true },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            patientId: { type: "integer", example: 5 },
            doctorId: { type: "integer", example: 10 },
            date: { type: "string", format: "date", example: "2026-03-05" },
            startTime: { type: "string", example: "14:00" },
            endTime: { type: "string", example: "14:30" },
            status: {
              type: "string",
              enum: ["pending", "accepted", "cancelled", "done"],
              example: "pending",
            },
            notes: { type: "string", nullable: true, example: "Follow-up checkup" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AppointmentWithRelations: {
          allOf: [
            { $ref: "#/components/schemas/Appointment" },
            {
              type: "object",
              properties: {
                patient: { $ref: "#/components/schemas/AppointmentParty" },
                doctor: { $ref: "#/components/schemas/AppointmentParty" },
              },
            },
          ],
        },
        LoginRequest: {
          type: "object",
          properties: {
            username: { type: "string", example: "john_doe" },
            password: { type: "string", format: "password", example: "StrongPass123" },
          },
          required: ["username", "password"],
        },
        RegisterRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email", example: "john@example.com" },
            username: { type: "string", example: "john_doe" },
            password: { type: "string", format: "password", example: "StrongPass123" },
            fullName: { type: "string", example: "John Doe" },
            role: { type: "string", enum: ["patient", "doctor"], example: "patient" },
            specialization: { type: "string", example: "Cardiology" },
            bio: { type: "string", example: "Cardiologist with 10 years of experience." },
            consultationFee: { type: "number", example: 3000 },
            experienceYears: { type: "number", example: 10 },
          },
          required: ["email", "username", "password", "fullName", "role"],
        },
        ForgotPasswordRequest: {
          type: "object",
          properties: {
            identifier: { type: "string", example: "john@example.com" },
          },
          required: ["identifier"],
        },
        ResetPasswordRequest: {
          type: "object",
          properties: {
            token: { type: "string", example: "reset-token-value" },
            newPassword: { type: "string", format: "password", example: "NewStrongPass123" },
            confirmPassword: { type: "string", format: "password", example: "NewStrongPass123" },
          },
          required: ["token", "newPassword", "confirmPassword"],
        },
        ChangePasswordRequest: {
          type: "object",
          properties: {
            currentPassword: { type: "string", format: "password", example: "CurrentPass123" },
            newPassword: { type: "string", format: "password", example: "NewStrongPass123" },
          },
          required: ["currentPassword", "newPassword"],
        },
        CreateAdminRequest: {
          type: "object",
          properties: {
            username: { type: "string", example: "admin_new" },
            email: { type: "string", format: "email", example: "admin@example.com" },
            password: { type: "string", format: "password", example: "AdminPass123" },
            fullName: { type: "string", example: "Admin User" },
            phone: { type: "string", example: "+923001234567" },
            isActive: { type: "boolean", example: true },
          },
          required: ["username", "email", "password", "fullName"],
        },
        UpdateAdminRequest: {
          type: "object",
          properties: {
            username: { type: "string", example: "admin_updated" },
            email: { type: "string", format: "email", example: "admin.updated@example.com" },
            password: { type: "string", format: "password", example: "AdminPass321" },
            fullName: { type: "string", example: "Updated Admin" },
            phone: { type: "string", nullable: true, example: "+923009998887" },
            isActive: { type: "boolean", example: true },
          },
        },
        CreateDoctorRequest: {
          type: "object",
          properties: {
            username: { type: "string", example: "dr_khan" },
            email: { type: "string", format: "email", example: "dr.khan@example.com" },
            password: { type: "string", format: "password", example: "DoctorPass123" },
            fullName: { type: "string", example: "Dr. Khan" },
            phone: { type: "string", example: "+923001112223" },
            specialization: { type: "string", example: "Dermatology" },
            bio: { type: "string", example: "Experienced dermatologist." },
            consultationFee: { type: "number", example: 2500 },
            experienceYears: { type: "number", example: 7 },
            isActive: { type: "boolean", example: true },
          },
          required: [
            "username",
            "email",
            "password",
            "fullName",
            "specialization",
            "consultationFee",
          ],
        },
        UpdateDoctorRequest: {
          type: "object",
          properties: {
            username: { type: "string", example: "dr_khan2" },
            email: { type: "string", format: "email", example: "dr.khan2@example.com" },
            fullName: { type: "string", example: "Dr. K. Khan" },
            phone: { type: "string", nullable: true, example: "+923001112224" },
            specialization: { type: "string", example: "Dermatology" },
            bio: { type: "string", nullable: true, example: "Updated bio." },
            consultationFee: { type: "number", example: 2800 },
            experienceYears: { type: "number", example: 8 },
            isActive: { type: "boolean", example: true },
          },
        },
        CreateScheduleRequest: {
          type: "object",
          properties: {
            dayOfWeek: {
              type: "string",
              enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
            },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "12:00" },
            isAvailable: { type: "boolean", example: true },
          },
          required: ["dayOfWeek", "startTime", "endTime"],
        },
        UpdateScheduleRequest: {
          type: "object",
          properties: {
            dayOfWeek: {
              type: "string",
              enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
            },
            startTime: { type: "string", example: "10:00" },
            endTime: { type: "string", example: "13:00" },
            isAvailable: { type: "boolean", example: true },
          },
        },
        CreateAppointmentRequest: {
          type: "object",
          properties: {
            doctorId: { type: "integer", example: 10 },
            date: { type: "string", format: "date", example: "2026-03-10" },
            startTime: { type: "string", example: "11:00" },
            endTime: { type: "string", example: "11:30" },
            notes: { type: "string", example: "Routine follow-up" },
          },
          required: ["doctorId", "date", "startTime", "endTime"],
        },
        UpdateAppointmentRequest: {
          type: "object",
          properties: {
            date: { type: "string", format: "date", example: "2026-03-11" },
            startTime: { type: "string", example: "12:00" },
            endTime: { type: "string", example: "12:30" },
            notes: { type: "string", nullable: true, example: "Updated notes" },
            status: {
              type: "string",
              enum: ["pending", "accepted", "cancelled", "done"],
              example: "accepted",
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src/routes/*.ts"),
    path.join(process.cwd(), "src/controller/*.ts"),
    path.join(process.cwd(), "dist/routes/*.js"),
    path.join(process.cwd(), "dist/controller/*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
