import { describe, it, expect, vi, afterEach } from "vitest";
import getCurrentDate from "./get-current-date.js";

describe("getCurrentDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return a string in the format 'day monthName, year'", () => {
    // Mock the system time to return a fixed date
    const mockDate = new Date(2026, 3, 8); // April 8, 2026 (month is 0-indexed)
    vi.setSystemTime(mockDate);

    const result = getCurrentDate();

    // Should be "8 April, 2026"
    expect(result).toBe("8 April, 2026");
  });

  it("should use correct month names for different months", () => {
    // Test with January
    const janDate = new Date(2025, 0, 15); // January 15, 2025
    vi.setSystemTime(janDate);

    expect(getCurrentDate()).toBe("15 January, 2025");

    // Test with December
    const decDate = new Date(2024, 11, 25); // December 25, 2024
    vi.setSystemTime(decDate);

    expect(getCurrentDate()).toBe("25 December, 2024");
  });

  it("should handle single-digit days correctly", () => {
    const date = new Date(2024, 5, 3); // June 3, 2024
    vi.setSystemTime(date);

    expect(getCurrentDate()).toBe("3 June, 2024");
  });
});
