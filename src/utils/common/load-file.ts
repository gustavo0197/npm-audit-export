import { readFileSync } from "fs";
import { resolve } from "path";

export default function loadFile(filePath: string): string {
  if (!filePath) {
    throw new Error("File path is required to load the file.");
  }

  if (!filePath.includes(".json")) {
    throw new Error("Only JSON files are supported.");
  }

  // TODO: Validate that file is a JSON file

  const resolvedPath = resolve(process.cwd(), filePath);

  return readFileSync(resolvedPath, "utf-8");
}
