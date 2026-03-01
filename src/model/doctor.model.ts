export type DoctorProfileModel = {
  id: number;
  specialization: string;
  bio: string | null;
  consultationFee: number | null;
  experienceYears: number | null;
  createdAt: Date;
};

export type DoctorModel = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "patient" | "doctor" | "admin";
  isActive: boolean;
  createdAt: Date;
  doctorProfile: DoctorProfileModel | null;
};

export type DoctorWithSchedulesModel = DoctorModel & {
  schedules: Array<{
    id: number;
    dayOfWeek:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
};
