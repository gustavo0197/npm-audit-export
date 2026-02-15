import { readFileSync } from "fs";
import { resolve } from "path";

export default function loadTemplate(filePath: string = "ui/template.html"): string {
  if (!filePath) {
    throw new Error("File path is required to load the file.");
  }

  if (!filePath.includes(".html")) {
    throw new Error("Only HTML files are supported.");
  }

  // TODO: Validate that file is an HTML file
  const resolvedPath = resolve(process.cwd(), filePath);

  return readFileSync(resolvedPath, "utf-8");
}
