import { prisma } from "@/lib/prisma";
import { TwilioService } from "@/lib/twilio";
import { formatPhoneNumber, validateE164Format } from "@/lib/phone-utils";

export class UserService {
  /**
   * Send verification code to phone number
   */
  static async sendVerificationCode(phoneNumber: string) {
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
      throw new Error(
        "Invalid phone number format. Please include country code or use 10-digit US number."
      );
    }

    // Validate E.164 format
    if (!validateE164Format(formattedPhone)) {
      throw new Error("Invalid phone number format");
    }

    const result = await TwilioService.sendVerificationCode(formattedPhone);

    if (!result.success) {
      throw new Error(result.error || "Failed to send verification code");
    }

    return { success: true, message: "Verification code sent successfully" };
  }

  /**
   * Verify code and create/update user
   */
  static async verifyPhoneAndCreateUser(
    phoneNumber: string,
    code: string,
    name?: string
  ) {
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
      throw new Error(
        "Invalid phone number format. Please include country code or use 10-digit US number."
      );
    }

    // Validate E.164 format
    if (!validateE164Format(formattedPhone)) {
      throw new Error("Invalid phone number format");
    }

    // Verify the code with Twilio
    const verificationResult = await TwilioService.verifyCode(
      formattedPhone,
      code
    );

    if (!verificationResult.success) {
      throw new Error(verificationResult.error || "Invalid verification code");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });

    let user;
    if (existingUser) {
      // Update existing user to mark as verified
      user = await prisma.user.update({
        where: { phone: formattedPhone },
        data: {
          isPhoneVerified: true,
          phoneVerifiedAt: new Date(),
          name: name || existingUser.name, // Keep existing name if no new name provided
        },
      });
    } else {
      // Create new user with verified phone
      user = await prisma.user.create({
        data: {
          phone: formattedPhone,
          name: name || null,
          isPhoneVerified: true,
          phoneVerifiedAt: new Date(),
        },
      });
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      isPhoneVerified: user.isPhoneVerified,
      phoneVerifiedAt: user.phoneVerifiedAt,
    };
  }

  /**
   * Get all users
   */
  static async getAllUsers() {
    return await prisma.user.findMany();
  }

  /**
   * Create a new user
   */
  static async createUser(phone: string, name?: string) {
    return await prisma.user.create({
      data: {
        phone,
        name: name || null,
      },
    });
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get user by phone number
   */
  static async getUserByPhone(phone: string) {
    return await prisma.user.findUnique({
      where: { phone },
    });
  }
}
