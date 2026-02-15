const { test, expect, describe } = require("@jest/globals");
const { validateUsername } = require("./script.js");

describe("Username Validation", () => {
  describe("Valid usernames", () => {
    test("accepts username with uppercase, special char, and min length", () => {
      expect(validateUsername("Test!")).toBe(true);
    });

    test("accepts username with multiple uppercase letters", () => {
      expect(validateUsername("TEST@123")).toBe(true);
    });

    test("accepts username with multiple special characters", () => {
      expect(validateUsername("Hello@World!")).toBe(true);
    });

    test("accepts username exactly 5 characters", () => {
      expect(validateUsername("Ab#12")).toBe(true);
    });

    test("accepts username longer than 5 characters", () => {
      expect(validateUsername("MyUser@Name123")).toBe(true);
    });

    test("accepts username with various special characters", () => {
      expect(validateUsername("User#1")).toBe(true);
      expect(validateUsername("User$1")).toBe(true);
      expect(validateUsername("User%1")).toBe(true);
      expect(validateUsername("User&1")).toBe(true);
      expect(validateUsername("User*1")).toBe(true);
      expect(validateUsername("User@1")).toBe(true);
    });
  });

  describe("Invalid usernames", () => {
    test("rejects username shorter than 5 characters", () => {
      expect(validateUsername("Ab#")).toBe(false);
    });

    test("rejects username without uppercase letter", () => {
      expect(validateUsername("test@123")).toBe(false);
    });

    test("rejects username without special character", () => {
      expect(validateUsername("Test123")).toBe(false);
    });

    test("rejects username with only lowercase", () => {
      expect(validateUsername("testuser")).toBe(false);
    });

    test("rejects empty string", () => {
      expect(validateUsername("")).toBe(false);
    });

    test("rejects username with only uppercase and length", () => {
      expect(validateUsername("TESTUSER")).toBe(false);
    });

    test("rejects username with only special chars and length", () => {
      expect(validateUsername("!@#$%")).toBe(false);
    });

    test("rejects username with 4 characters even with uppercase and special", () => {
      expect(validateUsername("Ab@1")).toBe(false);
    });

    test("rejects username with only numbers", () => {
      expect(validateUsername("12345")).toBe(false);
    });
  });

  describe("Edge cases", () => {
    test("handles username with spaces", () => {
      expect(validateUsername("User Name!")).toBe(true);
    });

    test("handles username with numbers", () => {
      expect(validateUsername("User123@")).toBe(true);
    });

    test("handles username with mixed case", () => {
      expect(validateUsername("UsErNaMe@123")).toBe(true);
    });

    test("rejects undefined", () => {
      expect(validateUsername(undefined)).toBe(false);
    });

    test("rejects null", () => {
      expect(validateUsername(null)).toBe(false);
    });
  });
});
