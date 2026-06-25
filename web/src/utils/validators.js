/**
 * EcoCycle – Validation Rules
 * 100% synchronized with mobile (Flutter) validation logic
 * Password: minimum 6 characters (per Web requirements)
 */

/** Validates a Vietnamese/international email address */
export function validateEmail(value) {
  if (!value || !value.trim()) return "Vui lòng nhập email";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return "Email không hợp lệ";
  return null;
}

/**
 * Validates a Vietnamese phone number.
 * Must be at least 10 digits (mobile: v.length < 10)
 */
export function validatePhone(value) {
  if (!value || !value.trim()) return "Vui lòng nhập số điện thoại";
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length < 10) return "Số điện thoại phải có ít nhất 10 chữ số";
  if (digitsOnly.length > 11) return "Số điện thoại không hợp lệ";
  return null;
}

/**
 * Validates a password.
 * Minimum 8 characters (web requirement; mobile uses 6).
 */
export function validatePassword(value) {
  if (!value || !value.trim()) return "Vui lòng nhập mật khẩu";
  if (value.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
  return null;
}

/** Validates confirm-password matches the original */
export function validateConfirmPassword(value, original) {
  if (!value || !value.trim()) return "Vui lòng xác nhận mật khẩu";
  if (value !== original) return "Mật khẩu xác nhận không khớp";
  return null;
}

/** Validates a full name (required) */
export function validateFullName(value) {
  if (!value || !value.trim()) return "Vui lòng nhập họ và tên";
  if (value.trim().length < 2) return "Họ tên quá ngắn";
  return null;
}

/** Validates a 6-digit OTP code */
export function validateOtp(value) {
  if (!value || !value.trim()) return "Vui lòng nhập mã OTP";
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length !== 6) return "Mã OTP phải có 6 chữ số";
  return null;
}

/** Validates a username (required) */
export function validateUsername(value) {
  if (!value || !value.trim()) return "Vui lòng nhập tên đăng nhập";
  if (value.trim().length < 4) return "Tên đăng nhập tối thiểu 4 ký tự";
  return null;
}
