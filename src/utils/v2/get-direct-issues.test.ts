import { describe, test, expect } from "vitest";
import getDirectIssues from "./get-direct-issues.js";
import type { ReportV2Type, SeverityType, VulnerabilityViaType } from "../../types/report.js";

// Helper function to create a vulnerability via object with sensible defaults
const createVulnerabilityVia = (overrides: Partial<VulnerabilityViaType> = {}): VulnerabilityViaType => ({
  source: 1234,
  name: "test-package",
  dependency: "test-dependency",
  title: "Test Vulnerability",
  url: "https://example.com/advisory",
  severity: "high",
  cwe: [],
  cvss: {
    score: 7.5,
    vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N",
  },
  range: "<1.0.0",
  ...overrides,
});

// Helper function to create a vulnerability object
const createVulnerability = (
  name: string,
  isDirect: boolean,
  severity: SeverityType = "high",
): ReportV2Type["vulnerabilities"][string] => ({
  name,
  severity,
  isDirect,
  via: [createVulnerabilityVia({ name })],
  effects: [],
  range: ">=1.0.0",
  nodes: [`node_modules/${name}`],
  fixAvailable: true,
});

// Helper function to create a mock report
const createReport = (vulnerabilities: ReportV2Type["vulnerabilities"] = {}): ReportV2Type => ({
  auditReportVersion: 2,
  vulnerabilities,
  metadata: {
    vulnerabilities: {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      total: 0,
    },
    dependencies: {
      prod: 0,
      dev: 0,
      optional: 0,
      peer: 0,
      peerOptional: 0,
      total: 0,
    },
  },
});

describe("getDirectIssues", () => {
  describe("with empty vulnerabilities", () => {
    test("should return empty object when report has no vulnerabilities", () => {
      const report = createReport({});

      const result = getDirectIssues(report);

      expect(result).toEqual({});
    });
  });

  describe("with only direct vulnerabilities", () => {
    test("should return single direct vulnerability", () => {
      const directVuln = createVulnerability("lodash", true);
      const report = createReport({
        lodash: directVuln,
      });

      const result = getDirectIssues(report);

      expect(result).toEqual({
        lodash: directVuln,
      });
    });

    test("should return all direct vulnerabilities when multiple exist", () => {
      const directVuln1 = createVulnerability("lodash", true, "high");
      const directVuln2 = createVulnerability("axios", true, "critical");
      const directVuln3 = createVulnerability("express", true, "moderate");
      const report = createReport({
        lodash: directVuln1,
        axios: directVuln2,
        express: directVuln3,
      });

      const result = getDirectIssues(report);

      expect(result).toEqual({
        lodash: directVuln1,
        axios: directVuln2,
        express: directVuln3,
      });
      expect(Object.keys(result)).toHaveLength(3);
    });
  });

  describe("with only indirect vulnerabilities", () => {
    test("should return empty object when all vulnerabilities are indirect", () => {
      const indirectVuln1 = createVulnerability("lodash", false);
      const indirectVuln2 = createVulnerability("axios", false);
      const report = createReport({
        lodash: indirectVuln1,
        axios: indirectVuln2,
      });

      const result = getDirectIssues(report);

      expect(result).toEqual({});
    });

    test("should return empty object for single indirect vulnerability", () => {
      const indirectVuln = createVulnerability("lodash", false);
      const report = createReport({
        lodash: indirectVuln,
      });

      const result = getDirectIssues(report);

      expect(result).toEqual({});
    });
  });

  describe("with mixed direct and indirect vulnerabilities", () => {
    test("should filter out indirect vulnerabilities and keep only direct ones", () => {
      const directVuln1 = createVulnerability("lodash", true);
      const indirectVuln1 = createVulnerability("axios", false);
      const directVuln2 = createVulnerability("express", true);
      const indirectVuln2 = createVulnerability("react", false);
      const report = createReport({
        lodash: directVuln1,
        axios: indirectVuln1,
        express: directVuln2,
        react: indirectVuln2,
      });

      const result = getDirectIssues(report);

      expect(result).toEqual({
        lodash: directVuln1,
        express: directVuln2,
      });
      expect(Object.keys(result)).toHaveLength(2);
    });

    test("should preserve all properties of direct vulnerabilities", () => {
      const directVuln = createVulnerability("lodash", true, "critical");
      directVuln.effects = ["package-a", "package-b"];
      directVuln.nodes = ["node_modules/lodash", "node_modules/pkg/node_modules/lodash"];
      directVuln.fixAvailable = false;

      const indirectVuln = createVulnerability("axios", false);
      const report = createReport({
        lodash: directVuln,
        axios: indirectVuln,
      });

      const result = getDirectIssues(report);

      expect(result.lodash).toEqual(directVuln);
      expect(result.lodash?.effects).toEqual(["package-a", "package-b"]);
      expect(result.lodash?.nodes).toHaveLength(2);
      expect(result.lodash?.fixAvailable).toBe(false);
      expect(result.lodash?.severity).toBe("critical");
    });
  });

  describe("with different severity levels", () => {
    test("should include direct vulnerabilities of all severity levels", () => {
      const criticalVuln = createVulnerability("package-critical", true, "critical");
      const highVuln = createVulnerability("package-high", true, "high");
      const moderateVuln = createVulnerability("package-moderate", true, "moderate");
      const lowVuln = createVulnerability("package-low", true, "low");
      const infoVuln = createVulnerability("package-info", true, "info");

      const report = createReport({
        "package-critical": criticalVuln,
        "package-high": highVuln,
        "package-moderate": moderateVuln,
        "package-low": lowVuln,
        "package-info": infoVuln,
      });

      const result = getDirectIssues(report);

      expect(Object.keys(result)).toHaveLength(5);
      expect(result["package-critical"]?.severity).toBe("critical");
      expect(result["package-high"]?.severity).toBe("high");
      expect(result["package-moderate"]?.severity).toBe("moderate");
      expect(result["package-low"]?.severity).toBe("low");
      expect(result["package-info"]?.severity).toBe("info");
    });
  });

  describe("return value characteristics", () => {
    test("should return a new object, not mutate the original", () => {
      const directVuln = createVulnerability("lodash", true);
      const vulnerabilities = {
        lodash: directVuln,
      };
      const report = createReport(vulnerabilities);

      const result = getDirectIssues(report);

      expect(result).not.toBe(report.vulnerabilities);
      expect(result).toEqual(vulnerabilities);
    });

    test("should preserve references to vulnerability objects", () => {
      const directVuln = createVulnerability("lodash", true);
      const report = createReport({
        lodash: directVuln,
      });

      const result = getDirectIssues(report);

      // The vulnerability object itself should be the same reference
      expect(result.lodash).toBe(directVuln);
    });

    test("should return proper type structure", () => {
      const directVuln = createVulnerability("lodash", true);
      const report = createReport({
        lodash: directVuln,
      });

      const result = getDirectIssues(report);

      expect(typeof result).toBe("object");
      expect(result).not.toBeNull();
      expect(result.lodash).toHaveProperty("name");
      expect(result.lodash).toHaveProperty("severity");
      expect(result.lodash).toHaveProperty("isDirect");
      expect(result.lodash).toHaveProperty("via");
      expect(result.lodash).toHaveProperty("effects");
      expect(result.lodash).toHaveProperty("range");
      expect(result.lodash).toHaveProperty("nodes");
      expect(result.lodash).toHaveProperty("fixAvailable");
    });
  });

  describe("edge cases", () => {
    test("should handle vulnerability with isDirect explicitly set to false", () => {
      const vuln = createVulnerability("lodash", false);
      vuln.isDirect = false; // Explicitly set to false
      const report = createReport({
        lodash: vuln,
      });

      const result = getDirectIssues(report);

      expect(result).toEqual({});
    });

    test("should handle large number of vulnerabilities efficiently", () => {
      const vulnerabilities: ReportV2Type["vulnerabilities"] = {};

      // Create 100 vulnerabilities, half direct and half indirect
      for (let i = 0; i < 100; i++) {
        const isDirect = i % 2 === 0;
        vulnerabilities[`package-${i}`] = createVulnerability(`package-${i}`, isDirect);
      }

      const report = createReport(vulnerabilities);

      const result = getDirectIssues(report);

      // Should have exactly 50 direct vulnerabilities
      expect(Object.keys(result)).toHaveLength(50);

      // Verify all returned vulnerabilities are direct
      Object.values(result).forEach((vuln) => {
        expect(vuln?.isDirect).toBe(true);
      });
    });

    test("should handle vulnerabilities with complex via arrays", () => {
      const complexVuln = createVulnerability("lodash", true);
      complexVuln.via = [
        "some-package",
        createVulnerabilityVia({ name: "lodash", title: "First vulnerability" }),
        "another-package",
        createVulnerabilityVia({ name: "lodash", title: "Second vulnerability" }),
      ];

      const report = createReport({
        lodash: complexVuln,
      });

      const result = getDirectIssues(report);

      expect(result.lodash).toEqual(complexVuln);
      expect(result.lodash?.via).toHaveLength(4);
    });

    test("should handle vulnerabilities with empty effects array", () => {
      const vuln = createVulnerability("lodash", true);
      vuln.effects = [];
      const report = createReport({
        lodash: vuln,
      });

      const result = getDirectIssues(report);

      expect(result.lodash?.effects).toEqual([]);
    });

    test("should handle vulnerabilities with empty nodes array", () => {
      const vuln = createVulnerability("lodash", true);
      vuln.nodes = [];
      const report = createReport({
        lodash: vuln,
      });

      const result = getDirectIssues(report);

      expect(result.lodash?.nodes).toEqual([]);
    });
  });
});
