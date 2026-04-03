import { describe, test, expect } from "vitest";
import getLinks from "./get-links.js";
import type { VulnerabilityViaType } from "../../types/report.js";
import type { LinkType } from "../../types/links.js";

// Helper function to create a base vulnerability object with sensible defaults
const createVulnerability = (overrides: Partial<VulnerabilityViaType> = {}): VulnerabilityViaType => ({
  source: 1234,
  name: "test-package",
  dependency: "test-dependency",
  title: "Test Vulnerability",
  url: "https://example.com/advisory",
  severity: "high",
  cwe: [],
  cvss: {
    score: 0,
    vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N",
  },
  range: "<1.0.0",
  ...overrides,
});

describe("getLinks", () => {
  describe("with empty vulnerability data", () => {
    test("should return empty array when no CWE and CVSS score is 0", () => {
      const vulnerability = createVulnerability();

      const result = getLinks(vulnerability);

      expect(result).toEqual([]);
    });
  });

  describe("with CWE data", () => {
    test("should create correct link for single CWE entry", () => {
      const vulnerability = createVulnerability({
        cwe: ["CWE-79"],
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        url: "https://cwe.mitre.org/data/definitions/79.html",
        label: "CWE-79",
      });
    });

    test("should create correct links for multiple CWE entries", () => {
      const vulnerability = createVulnerability({
        cwe: ["CWE-79", "CWE-89", "CWE-20"],
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {
          url: "https://cwe.mitre.org/data/definitions/79.html",
          label: "CWE-79",
        },
        {
          url: "https://cwe.mitre.org/data/definitions/89.html",
          label: "CWE-89",
        },
        {
          url: "https://cwe.mitre.org/data/definitions/20.html",
          label: "CWE-20",
        },
      ]);
    });

    test("should correctly strip 'CWE-' prefix from CWE numbers", () => {
      const vulnerability = createVulnerability({
        cwe: ["CWE-1234"],
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]?.url).toBe("https://cwe.mitre.org/data/definitions/1234.html");
    });
  });

  describe("with CVSS data", () => {
    test("should create correct CVSS link with version 3.1", () => {
      const vulnerability = createVulnerability({
        cvss: {
          score: 7.5,
          vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        url: "https://www.first.org/cvss/calculator/3.1#CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
        label: "CVSS 7.5",
      });
    });

    test("should create correct CVSS link with version 3.0", () => {
      const vulnerability = createVulnerability({
        cvss: {
          score: 9.8,
          vectorString: "CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        url: "https://www.first.org/cvss/calculator/3.0#CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        label: "CVSS 9.8",
      });
    });

    test("should default to version 3.1 when vector string format is invalid", () => {
      const vulnerability = createVulnerability({
        cvss: {
          score: 5.3,
          vectorString: "INVALID_FORMAT",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]?.url).toContain("/3.1#");
    });

    test("should not create CVSS link when score is 0", () => {
      const vulnerability = createVulnerability({
        severity: "low",
      });

      const result = getLinks(vulnerability);

      expect(result).toEqual([]);
    });

    test("should create CVSS link for low positive scores", () => {
      const vulnerability = createVulnerability({
        severity: "low",
        cvss: {
          score: 0.1,
          vectorString: "CVSS:3.1/AV:N/AC:H/PR:H/UI:R/S:U/C:L/I:N/A:N",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]?.label).toBe("CVSS 0.1");
    });

    test("should handle decimal CVSS scores correctly", () => {
      const vulnerability = createVulnerability({
        severity: "critical",
        cvss: {
          score: 9.8,
          vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]?.label).toBe("CVSS 9.8");
    });
  });

  describe("with combined CWE and CVSS data", () => {
    test("should create both CWE and CVSS links", () => {
      const vulnerability = createVulnerability({
        cwe: ["CWE-79", "CWE-352"],
        cvss: {
          score: 8.1,
          vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(3);
      expect(result[0]!).toEqual({
        url: "https://cwe.mitre.org/data/definitions/79.html",
        label: "CWE-79",
      });
      expect(result[1]!).toEqual({
        url: "https://cwe.mitre.org/data/definitions/352.html",
        label: "CWE-352",
      });
      expect(result[2]!).toEqual({
        url: "https://www.first.org/cvss/calculator/3.1#CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N",
        label: "CVSS 8.1",
      });
    });

    test("should maintain correct order: CWE links first, then CVSS link", () => {
      const vulnerability = createVulnerability({
        severity: "critical",
        cwe: ["CWE-89"],
        cvss: {
          score: 10.0,
          vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(2);
      expect(result[0]?.label).toBe("CWE-89");
      expect(result[1]?.label).toBe("CVSS 10");
    });
  });

  describe("edge cases", () => {
    test("should handle empty vector string gracefully", () => {
      const vulnerability = createVulnerability({
        cvss: {
          score: 7.5,
          vectorString: "",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]?.url).toContain("/3.1#");
    });

    test("should handle vector string with partial format", () => {
      const vulnerability = createVulnerability({
        cvss: {
          score: 6.5,
          vectorString: "CVSS:2.0",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]?.url).toContain("/2.0#");
    });

    test("should handle vector string without slashes", () => {
      const vulnerability = createVulnerability({
        cvss: {
          score: 5.0,
          vectorString: "CVSS:3.1",
        },
      });

      const result = getLinks(vulnerability);

      expect(result).toHaveLength(1);
      expect(result[0]?.url).toContain("/3.1#");
    });

    test("should return links array with proper LinkType structure", () => {
      const vulnerability = createVulnerability({
        cwe: ["CWE-79"],
        cvss: {
          score: 7.5,
          vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
        },
      });

      const result = getLinks(vulnerability);

      result.forEach((link: LinkType) => {
        expect(link).toHaveProperty("url");
        expect(link).toHaveProperty("label");
        expect(typeof link.url).toBe("string");
        expect(typeof link.label).toBe("string");
        expect(link.url).toMatch(/^https:\/\//);
      });
    });
  });
});
