import { OAuth2Client } from 'google-auth-library';
import twilio from 'twilio';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { otpStorage, users } from '../utils/storage';
import { generateOtp } from '../utils/helpers';

export class AuthService {
  private twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async sendOtp(phoneNumber: string, name: string) {
    try {
      const otp = generateOtp();
      const otpId = `otp_${Date.now()}_${Math.random()}`;
      
      // Store OTP with expiration (5 minutes)
      otpStorage.set(otpId, {
        otp,
        phoneNumber,
        name,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      // Send OTP via Twilio
      await this.twilioClient.messages.create({
        body: `Your TobaccoFree verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      return { success: true, message: 'OTP sent successfully', otpId };
    } catch (error) {
      logger.error('Send OTP error:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOtp(phoneNumber: string, otp: string, otpId: string) {
    try {
      const otpData = otpStorage.get(otpId);
      
      if (!otpData) {
        throw new Error('Invalid or expired OTP');
      }

      if (Date.now() > otpData.expiresAt) {
        otpStorage.delete(otpId);
        throw new Error('OTP has expired');
      }

      if (otpData.otp !== otp || otpData.phoneNumber !== phoneNumber) {
        throw new Error('Invalid OTP');
      }

      // Create or get user
      const userId = `phone_${phoneNumber.replace(/[^0-9]/g, '')}`;
      const user = {
        id: userId,
        name: otpData.name,
        phone: phoneNumber,
      };
      
      users.set(userId, user);
      otpStorage.delete(otpId);

      // Generate JWT token
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });

      return { success: true, user, token };
    } catch (error) {
      logger.error('Verify OTP error:', error);
      throw error;
    }
  }

  async authenticateWithGoogle(token: string) {
    try {
      // Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token');
      }

      // Create or get user
      const userId = `google_${payload.sub}`;
      const user = {
        id: userId,
        name: payload.name || 'Google User',
        email: payload.email,
      };
      
      users.set(userId, user);

      // Generate JWT token
      const jwtToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });

      return { success: true, user, token: jwtToken };
    } catch (error) {
      logger.error('Google auth error:', error);
      throw new Error('Google authentication failed');
    }
  }
}
