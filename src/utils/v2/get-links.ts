import type { VulnerabilityViaType } from "../../types/report.js";
import type { LinkType } from "../../types/links.js";

function getCVSSVersion(vectorString: string) {
  const version: string = vectorString.split(":")[1]?.split("/")[0] || "3.1";

  return version;
}

export default function getLinks(vulnerability: VulnerabilityViaType): LinkType[] {
  const links: LinkType[] = [];

  if (vulnerability.cwe.length > 0) {
    links.push(
      ...vulnerability.cwe.map((cwe) => ({
        url: `https://cwe.mitre.org/data/definitions/${cwe.replace("CWE-", "")}.html`,
        label: cwe,
      })),
    );
  }

  if (vulnerability.cvss.score > 0) {
    links.push({
      url: `https://www.first.org/cvss/calculator/${getCVSSVersion(vulnerability.cvss.vectorString)}#${vulnerability.cvss.vectorString}`,
      label: `CVSS ${vulnerability.cvss.score}`,
    });
  }

  return links;
}
