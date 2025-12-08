import getDirectIssues from "./get-direct-issues.js";
import populateVulnerabilities from "./populate-vulnerabilities.js";
import { type ReportV2Type } from "../../types/report.js";

export default function generateReportV2(report: ReportV2Type) {
  const directIssues = getDirectIssues(report);

  console.log("DIRECT ISSUES FOUND: ", Object.values(directIssues).length);

  const populatedVulnerabilities = populateVulnerabilities({ report, directIssues });
  console.log("DIRECT ISSUES: ", populatedVulnerabilities);
  // return populateVulnerabilities({ report, directIssues });
}
