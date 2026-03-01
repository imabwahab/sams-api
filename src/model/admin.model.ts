export type AdminModel = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "patient" | "doctor" | "admin";
  isActive: boolean;
  createdAt: Date;
};
