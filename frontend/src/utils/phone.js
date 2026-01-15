import parsePhoneNumberFromString from "libphonenumber-js";

/**
 * @param {string} phone
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  const phoneNumber = parsePhoneNumberFromString(phone, "US");

  if (phoneNumber.isValid()) {
    if (phoneNumber.country === "US") {
      return phoneNumber.formatNational();
    } else {
      return phoneNumber.formatInternational();
    }
  }

  return phone;
}
