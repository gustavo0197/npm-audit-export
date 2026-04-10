import getDirectVulnerabilities from "./get-direct-issues.js";
import findVias from "./find-vias.js";
import { type ReportV2Type, type EnrichedDirectVulnerabilityV2Type } from "../../types/report.js";

/**
 * Generate a report that can be used to generate an html report using template.hbs
 * @param report
 * @returns
 */
export default function generateReportV2(report: ReportV2Type) {
  const directVulns = getDirectVulnerabilities(report);
  const result: EnrichedDirectVulnerabilityV2Type[] = [];

  for (const key in directVulns) {
    const direct = directVulns[key];

    if (!direct) {
      console.warn("Direct vulnerability not found: ", key);

      continue;
    }

    // Get vias of direct vulnerability
    const viaPaths = findVias({ report, key, isParent: true });

    // Push direct vulnerability with its vias
    result.push({
      direct,
      viaPaths,
    });
  }

  return result;
}
