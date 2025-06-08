// In-memory storage (replace with database in production)
export const otpStorage = new Map<string, {
  otp: string;
  phoneNumber: string;
  name: string;
  expiresAt: number;
}>();

export const users = new Map<string, {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}>();
