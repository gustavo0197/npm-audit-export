import { describe, test, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import loadTemplate from "./load-template.js";

// Mock fs and path modules
vi.mock("fs");
vi.mock("path");

describe("loadTemplate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(path.resolve).mockReturnValue("/mocked/path/template.hbs");
  });

  test("returns file content when a valid .hbs path is provided", () => {
    vi.mocked(fs.readFileSync).mockReturnValue("{{template content}}");

    const result = loadTemplate("ui/template.hbs");

    expect(path.resolve).toHaveBeenCalledWith(process.cwd(), "ui/template.hbs");
    expect(fs.readFileSync).toHaveBeenCalledWith("/mocked/path/template.hbs", "utf-8");
    expect(result).toBe("{{template content}}");
  });

  test("uses the default path when no argument is provided", () => {
    vi.mocked(fs.readFileSync).mockReturnValue("default template");

    const result = loadTemplate();

    expect(path.resolve).toHaveBeenCalledWith(process.cwd(), "ui/template.hbs");
    expect(result).toBe("default template");
  });

  test("throws when an empty string is passed", () => {
    expect(() => loadTemplate("")).toThrow("File path is required to load the file.");
  });

  test("throws when a non-.hbs file path is provided", () => {
    expect(() => loadTemplate("ui/template.html")).toThrow("Only Handlebars files are supported.");
  });

  test("throws when readFileSync fails (e.g. file not found)", () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT: no such file or directory");
    });

    expect(() => loadTemplate("ui/template.hbs")).toThrow("ENOENT: no such file or directory");
  });
});
