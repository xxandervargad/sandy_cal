import { Twilio } from "twilio";

const client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!verifyServiceSid) {
  throw new Error("TWILIO_VERIFY_SERVICE_SID is not set");
}

export class TwilioService {
  static async sendVerificationCode(
    phoneNumber: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const verification = await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: "sms",
        });

      return { success: verification.status === "pending" };
    } catch (error) {
      console.error("Error sending verification code:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
      };
    }
  }

  static async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const verificationCheck = await client.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });

      return { success: verificationCheck.status === "approved" };
    } catch (error) {
      console.error("Error verifying code:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify code",
      };
    }
  }
}
