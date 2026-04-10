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

  for (const entry of report) {
    const dependency: TemplateDependencyType = {
      name: entry.direct.name,
      vulnerabilities: [],
      severity: entry.direct.severity,
      severityInitial: entry.direct.severity[0]?.toUpperCase() || "C",
      totalIssues: "",
    };

    if (entry.viaPaths.length === 0) {
      continue;
    }

    for (const path of entry.viaPaths) {
      if (path.length === 0) {
        // If is empty skip this entry
        continue;
      } else if (path.length === 1) {
        // If there is only 1 item, it most likely be an object
        if (typeof path[0] === "object") {
          counts[path[0].severity as keyof typeof counts]++;

          dependency.vulnerabilities.push({
            title: path[0].title,
            severity: path[0].severity,
            severityInitial: path[0].severity.charAt(0).toUpperCase(),
            links: getLinks(path[0]),
          });
        }
      } else {
        // Last item is an object, all other items are strings ["package-1", "package-2", "package-3", Vulnerability Object]

        const vuln = path[path.length - 1] as VulnerabilityV2ViaType;

        counts[vuln.severity as keyof typeof counts]++;

        dependency.vulnerabilities.push({
          title: vuln.title,
          severity: vuln.severity,
          severityInitial: vuln.severity.charAt(0).toUpperCase(),
          links: getLinks(vuln),
          package: `${vuln.name}@${vuln.range}`,
        });
      }

      counts.total++;
    }

    dependencies.push(dependency);
  }

  const html = compileTemplate({ counts, dependencies, theme });

  writeReport(html);
}
