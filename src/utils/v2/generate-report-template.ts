import { type VulnerabilityV2ViaType, type EnrichedDirectVulnerabilityV2Type } from "../../types/report.js";
import type { ThemeType } from "../../types/theme.js";
import getLinks from "./get-links.js";
import type { TemplateDependencyType } from "../../types/template.js";
import writeReport from "../common/write-report.js";
import compileTemplate from "../common/hbs.js";

export default function generateReportTemplateV2({
  report,
  theme,
}: {
  report: EnrichedDirectVulnerabilityV2Type[];
  theme: ThemeType;
}): void {
  const counts = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    total: 0,
  };
  const dependencies: TemplateDependencyType[] = [];
  const globalSources = new Set<number>();

  for (const entry of report) {
    const dependency: TemplateDependencyType = {
      name: entry.direct.name,
      vulnerabilities: [],
      severity: entry.direct.severity,
      severityInitial: entry.direct.severity[0]?.toUpperCase() || "C",
      totalIssues: "",
      isDirect: entry.direct.isDirect,
    };

    if (entry.viaPaths.length === 0) {
      continue;
    }

    // Track unique vulnerability sources within this dependency to avoid duplicates
    const sourcesInEntry = new Set<number>();

    for (const path of entry.viaPaths) {
      if (path.length === 0) {
        // If is empty skip this entry
        continue;
      }

      // Extract vulnerability object based on path length
      let vuln: VulnerabilityV2ViaType | null = null;

      if (path.length === 1) {
        // If there is only 1 item, it most likely be an object
        if (typeof path[0] === "object") {
          vuln = path[0] as VulnerabilityV2ViaType;
        }
      } else {
        // Last item is an object, all other items are strings ["package-1", "package-2", "package-3", Vulnerability Object]
        vuln = path[path.length - 1] as VulnerabilityV2ViaType;
      }

      if (!vuln) {
        continue;
      }

      // Skip if we've already seen this vulnerability source within this dependency
      if (sourcesInEntry.has(vuln.source)) {
        continue;
      }

      // Add to global sources
      if (!globalSources.has(vuln.source)) {
        globalSources.add(vuln.source);

        // Count vulnerabilities
        counts[vuln.severity as keyof typeof counts]++;
        counts.total++;
      }

      // Add to seen sources
      sourcesInEntry.add(vuln.source);

      const vulnerabilityEntry = {
        title: vuln.title,
        severity: vuln.severity,
        severityInitial: vuln.severity.charAt(0).toUpperCase(),
        links: getLinks(vuln),
      };

      // Add package info only for transitive vulnerabilities (path length > 1)
      if (path.length > 1) {
        (vulnerabilityEntry as any).package = `${vuln.name}@${vuln.range}`;
      }

      dependency.vulnerabilities.push(vulnerabilityEntry);
    }

    dependencies.push(dependency);
  }

  const html = compileTemplate({ counts, dependencies, theme });

  writeReport(html);
}
