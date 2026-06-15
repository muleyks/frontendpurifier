import { isValidEmail, isValidOtp } from "../src/lib/validation";

describe("isValidEmail", () => {
  it("accepts well-formed emails (trims)", () => {
    expect(isValidEmail("you@example.com")).toBe(true);
    expect(isValidEmail("  a.b@c.co  ")).toBe(true);
  });
  it("rejects malformed input", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe("isValidOtp", () => {
  it("accepts 6 digits (string or array)", () => {
    expect(isValidOtp("123456")).toBe(true);
    expect(isValidOtp(["1", "2", "3", "4", "5", "6"])).toBe(true);
  });
  it("rejects wrong length / non-digits", () => {
    expect(isValidOtp("12345")).toBe(false);
    expect(isValidOtp("12345a")).toBe(false);
    expect(isValidOtp(["1", "2"])).toBe(false);
  });
});
