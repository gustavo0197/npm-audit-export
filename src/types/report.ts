export type ReportV2Type = {
  /** Version of the audit report schema */
  auditReportVersion: number;
  /** Vulnerabilities found in the project */
  vulnerabilities: {
    [key: string]: VulnerabilityType;
  };
  metadata: {
    /** Vulnerability counts by severity */
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
    /** Total counts of dependencies by type */
    dependencies: {
      prod: number;
      dev: number;
      optional: number;
      peer: number;
      peerOptional: number;
      total: number;
    };
  };
};

type SeverityType = "critical" | "high" | "moderate" | "low" | "info";

type VulnerabilityType = {
  /** Name of the vulnerable package (Same as the key) e.g., "react" */
  name: string;
  /** Severity of the vulnerability */
  severity: SeverityType;
  /** Is this vulnerability directly affecting your project */
  isDirect: boolean;
  /** This array contains information about how the vulnerability is introduced */
  via: Array<string | VulnerabilityViaType>;
  /** Dependencies on your project that rely on this vulnerable package */
  effects: string[];
  /** Range of versions affected. E.g., "<1.20.3" */
  range: string;
  /** Actual filesystem locations of the vulnerable copies: */
  nodes: string[];
  /** Is a fix available for this vulnerability */
  fixAvailable: boolean;
};

export type VulnerabilityViaType = {
  source: number;
  /** Dependency name */
  name: string;
  /** Dependency name */
  dependency: string;
  /** Vulnerability title */
  title: string;
  /** Vulnerability URL */
  url: string;
  /** Severity of the vulnerability */
  severity: SeverityType;
  /** CVE identifiers */
  cwe: string[];
  /** CVSS details */
  cvss: {
    /** CVSS score */
    score: number;
    /** CVSS vector string */
    vectorString: string;
  };
  /** Range of versions affected. E.g., "<1.20.3" */
  range: string;
};
