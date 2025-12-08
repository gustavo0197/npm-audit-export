import { type ReportV2Type } from "../../types/report.js";
import findVias from "./find-vias.js";

/**
 * This function populates the direct vulnerabilities with their full via paths.
 * @param param0
 * @returns
 */
export default function populateVulnerabilities({ report, directIssues }: Props) {
  // for (const key in directIssues) {
  // }

  // TODO: Iterate over all direct issues and populate their vias
  return { express: JSON.stringify(findVias({ report, key: "express", isParent: true })) };
  // return { express: directIssues["express"] };
}

type Props = {
  report: ReportV2Type;
  directIssues: ReportV2Type["vulnerabilities"];
};
