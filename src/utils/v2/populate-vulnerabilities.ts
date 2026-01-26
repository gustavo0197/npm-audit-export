import { type ReportV2Type } from "../../types/report.js";
import findVias from "./find-vias.js";
import unwindVias from "./unwind-vias.js";

/**
 * This function populates the direct vulnerabilities with their full via paths.
 * @param param0
 * @returns
 */
export default function populateVulnerabilities({ report, directIssues }: Props) {
  const vulnerabilities: { [key: string]: any } = {};

  // Iterate over all direct issues and populate their vias
  for (const key in directIssues) {
    const vias = findVias({ report, key, isParent: true });

    vulnerabilities[key] = unwindVias(vias);
  }

  return vulnerabilities;
}

type Props = {
  report: ReportV2Type;
  directIssues: ReportV2Type["vulnerabilities"];
};
