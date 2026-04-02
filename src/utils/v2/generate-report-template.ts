import Handlebars from "handlebars";
import { type VulnerabilityViaType } from "../../types/report.js";
import loadTemplate from "../common/load-template.js";
import type { ThemeType } from "../../types/theme.js";
import getLinks from "./get-links.js";
import type { TemplateDependencyType } from "../../types/template.js";

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

export default function generateReportTemplateV2({
  report,
  theme,
}: {
  report: { [key: string]: VulnerabilityViaType[] };
  theme: ThemeType;
}): string {
  const template = loadTemplate();
  const counts = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    total: 0,
  };
  const dependencies: TemplateDependencyType[] = [];

  for (const key in report) {
    const vulnerabilities = report[key];
    const dependency: TemplateDependencyType = {
      name: key,
      vulnerabilities: [],
      severity: "critical",
      severityInitial: "C",
      totalIssues: "",
    };

    if (!vulnerabilities || vulnerabilities.length === 0) {
      continue;
    }

    for (const vulnerability of vulnerabilities) {
      if (typeof vulnerability === "object") {
        if (Array.isArray(vulnerability)) {
          // If it's an array, the last item is the vulnerability object
          const vuln = vulnerability[vulnerability.length - 1];

          counts[vuln.severity as keyof typeof counts]++;

          dependency.vulnerabilities.push({
            title: vuln.title,
            severity: vuln.severity,
            severityInitial: vuln.severity[0]?.toUpperCase(),
            package: vulnerability[0],
            links: getLinks(vuln),
          });
        } else {
          counts[vulnerability.severity as keyof typeof counts]++;

          dependency.vulnerabilities.push({
            title: vulnerability.title,
            severity: vulnerability.severity,
            severityInitial: vulnerability.severity[0]?.toUpperCase() || "",
            links: getLinks(vulnerability),
          });
        }

        counts.total++;
      }
    }

    dependencies.push(dependency);
  }

  // Compile the template
  const hbsTemplate = Handlebars.compile(template);

  const html = hbsTemplate({ counts, theme, dependencies });

  return html;
}
