import { type ReportV2Type } from "../../types/report.js";

export default function getDirectIssues(report: ReportV2Type): ReportV2Type["vulnerabilities"] {
  const filteredReport: ReportV2Type["vulnerabilities"] = {};

  for (const key in report.vulnerabilities) {
    if (report.vulnerabilities[key]?.isDirect) {
      filteredReport[key] = report.vulnerabilities[key];
    }
  }

  return filteredReport;
}
