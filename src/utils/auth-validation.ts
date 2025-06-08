import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    otpId: z.string(),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    token: z.string(),
  }),
});
