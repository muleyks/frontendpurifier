// Pure form-validation helpers (frontend-only mock).

export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// OTP as a string or an array of digit strings.
export function isValidOtp(code) {
  const s = Array.isArray(code) ? code.join("") : String(code ?? "");
  return /^\d{6}$/.test(s);
}
