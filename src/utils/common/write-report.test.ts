import { describe, test, expect, beforeEach, vi } from "vitest";
import { writeFileSync } from "fs";
import { resolve } from "path";
import writeReport from "./write-report.js";

// Mock fs module
vi.mock("fs", () => ({
  writeFileSync: vi.fn(),
}));

// Mock path module
vi.mock("path", () => ({
  resolve: vi.fn((...args) => args.join("/")),
}));

describe("writeReport", () => {
  const mockHtml = "<html><body>Test Report</body></html>";
  const defaultFileName = "report.html";
  const customFileName = "custom-report.html";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should write HTML content to default file name", () => {
    writeReport(mockHtml);

    expect(resolve).toHaveBeenCalledWith(process.cwd(), defaultFileName);
    expect(writeFileSync).toHaveBeenCalledWith(`${process.cwd()}/${defaultFileName}`, mockHtml, "utf-8");
  });

  test("should write HTML content to custom file name", () => {
    writeReport(mockHtml, customFileName);

    expect(resolve).toHaveBeenCalledWith(process.cwd(), customFileName);
    expect(writeFileSync).toHaveBeenCalledWith(`${process.cwd()}/${customFileName}`, mockHtml, "utf-8");
  });

  test("should handle empty HTML string", () => {
    const emptyHtml = "";
    writeReport(emptyHtml);

    expect(writeFileSync).toHaveBeenCalledWith(`${process.cwd()}/${defaultFileName}`, emptyHtml, "utf-8");
  });

  test("should handle HTML with special characters", () => {
    const specialHtml = "<html><body>Test & 'quotes' \"double\" <script></script></body></html>";
    writeReport(specialHtml);

    expect(writeFileSync).toHaveBeenCalledWith(`${process.cwd()}/${defaultFileName}`, specialHtml, "utf-8");
  });

  test("should handle file names with paths", () => {
    const fileNameWithPath = "output/reports/test-report.html";
    writeReport(mockHtml, fileNameWithPath);

    expect(resolve).toHaveBeenCalledWith(process.cwd(), fileNameWithPath);
    expect(writeFileSync).toHaveBeenCalledWith(`${process.cwd()}/${fileNameWithPath}`, mockHtml, "utf-8");
  });

  test("should use utf-8 encoding", () => {
    writeReport(mockHtml);

    const writeFileSyncCalls = vi.mocked(writeFileSync).mock.calls;
    expect(writeFileSyncCalls[0][2]).toBe("utf-8");
  });

  test("should resolve path relative to current working directory", () => {
    const cwd = process.cwd();
    writeReport(mockHtml, customFileName);

    expect(resolve).toHaveBeenCalledWith(cwd, customFileName);
  });
});
