import type { LinkType } from "./links.js";
import type { SeverityType } from "./report.js";

export type TemplateDependencyType = {
  name: string;
  vulnerabilities: TemplateVulnerabilityType[];
  severity: SeverityType;
  severityInitial: string;
  totalIssues: string;
};

export type TemplateVulnerabilityType = {
  severity: SeverityType;
  severityInitial: string;
  title: string;
  links: LinkType[];
  package?: string;
};

export type VulnerabilitiesCountType = {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  total: number;
};
