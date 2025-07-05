export const formatPhoneNumber = (phoneNumber: string) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // If it's already in E.164 format (starts with +), return as is
  if (
    phoneNumber.startsWith("+") &&
    cleaned.length >= 7 &&
    cleaned.length <= 15
  ) {
    return phoneNumber;
  }

  // If it's a 10-digit US number, add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If it's an 11-digit US number starting with 1, add +
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }

  // If it's a valid international number (7-15 digits), add +
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  // Return empty string for invalid formats
  return "";
};

export const validateE164Format = (phoneNumber: string): boolean => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
};
