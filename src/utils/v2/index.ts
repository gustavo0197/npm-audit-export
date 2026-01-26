import getDirectIssues from "./get-direct-issues.js";
import populateVulnerabilities from "./populate-vulnerabilities.js";
import { type ReportV2Type } from "../../types/report.js";

export default function generateReportV2(report: ReportV2Type) {
  const directIssues = getDirectIssues(report);

  return populateVulnerabilities({ report, directIssues });
}
