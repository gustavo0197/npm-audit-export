import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { resolve } from "path";
import loadFile from "./load-report-file";

describe("loadFile", () => {
  const testFilePath = "test-report.json";
  const resolvedTestPath = resolve(process.cwd(), testFilePath);
  const testJsonContent = JSON.stringify({ test: "data", vulnerabilities: {} });

  beforeEach(() => {
    // Clean up any existing test file
    if (existsSync(resolvedTestPath)) {
      unlinkSync(resolvedTestPath);
    }
  });

  afterEach(() => {
    // Clean up test file after each test
    if (existsSync(resolvedTestPath)) {
      unlinkSync(resolvedTestPath);
    }
  });

  it("should successfully load a valid JSON file", () => {
    // Create a test JSON file
    writeFileSync(resolvedTestPath, testJsonContent, "utf-8");

    const result = loadFile(testFilePath);

    expect(result).toBe(testJsonContent);
  });

  it("should throw an error when file path is not provided", () => {
    expect(() => loadFile("")).toThrow("File path is required to load the file.");
  });

  it("should throw an error when file path does not include .json extension", () => {
    expect(() => loadFile("report.txt")).toThrow("Only JSON files are supported.");
  });

  it("should throw an error when file does not exist", () => {
    expect(() => loadFile("non-existent-file.json")).toThrow();
  });

  it("should resolve file path relative to current working directory", () => {
    // Create a test JSON file
    writeFileSync(resolvedTestPath, testJsonContent, "utf-8");

    const result = loadFile(testFilePath);

    expect(result).toBe(testJsonContent);
  });

  it("should read file contents as UTF-8", () => {
    const unicodeContent = JSON.stringify({ message: "Hello 世界 🌍" });
    writeFileSync(resolvedTestPath, unicodeContent, "utf-8");

    const result = loadFile(testFilePath);

    expect(result).toBe(unicodeContent);
  });
});
