import { writeFileSync } from "fs";
import { resolve } from "path";

export default function writeReport(html: string, fileName = "report.html"): void {
  const resolvedPath = resolve(process.cwd(), fileName);

  writeFileSync(resolvedPath, html, "utf-8");
}
