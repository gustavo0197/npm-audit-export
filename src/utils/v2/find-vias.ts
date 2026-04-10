import { type ReportV2Type } from "../../types/report.js";
import { type VulnerabilityV2ViaType } from "../../types/report.js";

export default function findVias({
  report,
  key,
  isParent = true,
}: Props): Array<Array<string | VulnerabilityV2ViaType>> {
  const vulns: Array<Array<string | VulnerabilityV2ViaType>> = [];

  if (!report.vulnerabilities[key]) {
    return [];
  }

  const vulnerability = report.vulnerabilities[key];

  for (let i = 0; i < vulnerability.via.length; i++) {
    const path: Array<string | VulnerabilityV2ViaType> = isParent ? [] : [key];
    const via = vulnerability.via[i];

    if (typeof via === "object") {
      // VulnerabilityVia object
      path.push(via);
      vulns.push(path);
    } else if (typeof via === "string") {
      // Another vulnerability key
      const nestedPaths = findVias({ report, key: via, isParent: false });

      for (const nestedPath of nestedPaths) {
        vulns.push([...path, ...nestedPath]);
      }
    } else {
      console.warn("Unknown via type:", typeof via, via);
    }
  }

  return vulns;
}

type Props = {
  /** JSON report exported from npm audit --json */
  report: ReportV2Type;
  /** Vulnerability key to find vias for */
  key: string;
  /** Is this the parent call, always true for the initial call */
  isParent: boolean;
};
