import { TOTP } from "totp-generator";

export const generateOtp = (key) => {
  return TOTP.generate(key, { digits: 6, period: 30 }).otp;
};
