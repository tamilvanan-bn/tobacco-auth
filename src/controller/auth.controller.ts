import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { validateRequest } from '../utils/validation';
import { sendOtpSchema, verifyOtpSchema, googleAuthSchema } from '../validations/auth.validation';

const router = Router();
const authService = new AuthService();

router.post('/send-otp', validateRequest(sendOtpSchema), async (req, res) => {
  const { phoneNumber, name } = req.body;
  const result = await authService.sendOtp(phoneNumber, name);
  res.json(result);
});

router.post('/verify-otp', validateRequest(verifyOtpSchema), async (req, res) => {
  const { phoneNumber, otp, otpId } = req.body;
  const result = await authService.verifyOtp(phoneNumber, otp, otpId);
  res.json(result);
});

router.post('/google', validateRequest(googleAuthSchema), async (req, res) => {
  const { token } = req.body;
  const result = await authService.authenticateWithGoogle(token);
  res.json(result);
});

export { router as authRouter };
