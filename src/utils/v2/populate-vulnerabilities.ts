import { type ReportV2Type } from "../../types/report.js";

export default function populateVulnerabilities({ report, directIssues }: Props) {
  return directIssues["express"];
}

type Props = {
  report: ReportV2Type;
  directIssues: ReportV2Type["vulnerabilities"];
};
