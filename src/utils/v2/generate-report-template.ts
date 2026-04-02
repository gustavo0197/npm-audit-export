import Handlebars from "handlebars";
import { type VulnerabilityViaType } from "../../types/report.js";
import loadTemplate from "../common/load-template.js";

export default function generateReportTemplateV2({
  report,
}: {
  report: { [key: string]: VulnerabilityViaType[] };
}): string {
  const template = loadTemplate();

  for (const key in report) {
    const vulnerabilities = report[key];

    if (!vulnerabilities || vulnerabilities.length === 0) {
      continue;
    }

    for (const vulnerability of vulnerabilities) {
    }
  }

  // NOTE: testing the template
  const hbsTemplate = Handlebars.compile(loadTemplate());

  const html = hbsTemplate({ vulnerabilities: report });

  return html;
}
