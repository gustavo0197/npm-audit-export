import { type ReportV2Type } from "../../types/report.js";

/**
 * This function recursively finds all the "via" paths for a given vulnerability key.
 * @param param0
 * @returns
 */
export default function findVias({ report, key, isParent }: Props): any[] {
  // TODO: Define proper return type
  const vulns: any[][] = [];

  if (!report.vulnerabilities[key]) {
    return [];
  }

  for (let i = 0; i < report.vulnerabilities[key].via.length; i++) {
    if (isParent) {
      vulns.push([]);
    } else {
      vulns.push([key]);
    }

    const via = report.vulnerabilities[key].via[i];

    switch (typeof via) {
      case "object": {
        vulns[i]?.push(via);

        break;
      }
      case "string": {
        const data = findVias({ report, key: via, isParent: false });

        vulns[i]?.push(...data);

        break;
      }
      default: {
        console.warn("Unknown via type: ", {
          type: typeof via,
          via: via,
        });
      }
    }
  }

  if (isParent) {
    return vulns.flat();
  } else {
    return vulns;
  }
}

type Props = {
  /** JSON report exported from npm audit --json */
  report: ReportV2Type;
  /** Vulnerability key to find vias for */
  key: string;
  /** Is this the parent call, always true for the initial call */
  isParent: boolean;
};
