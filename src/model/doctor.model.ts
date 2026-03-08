export type DoctorProfileModel = {
  id: number;
  specialization: string;
  bio: string | null;
  consultationFee: number;
  experienceYears: number;
};

export type DoctorModel = {
  id: number;
  username: string;
  email: string | null;
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
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday";
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
};
