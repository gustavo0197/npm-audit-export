import loadReportFile from "./utils/common/load-report-file.js";
import generateReportV2 from "./utils/v2/index.js";
import generateReportTemplateV2 from "./utils/v2/generate-report-template.js";
import type { ThemeType } from "./types/theme.js";
import { writeFileSync } from "fs";
import getArg from "./utils/common/get-arg.js";
const VALID_THEMES = ["light", "dark"];

async function main() {
  try {
    let theme: ThemeType = (getArg("theme") || "light") as ThemeType;

    if (!VALID_THEMES.includes(theme)) {
      console.error(`Invalid theme ${theme}`);

      return process.exit(1);
    }

    if (process.stdin.isTTY) {
      // Use arguments provided via CLI
      console.debug("PROVIDED ARGS", process.argv);

      const jsonFilePath = getArg("json", true);

      // --json argument must have a valid file path
      if (!jsonFilePath) {
        throw new Error("Please provide a valid file path for --json argument.");
      }

      // Load npm audit JSON file
      const fileContent = loadReportFile(jsonFilePath);

      // Parse JSON content
      const parsedInput = JSON.parse(fileContent);

      // Verify which version of report is being used and call the appropriate functions
      switch (parsedInput.auditReportVersion) {
        case 1: {
          console.log("Audit v1 is not supported yet.");

          break;
        }
        case 2: {
          const report = generateReportV2(parsedInput);

          // Generate HTML file using the report data
          generateReportTemplateV2({ report, theme });

          break;
        }
        default: {
          throw new Error(`Unsupported audit report version: ${parsedInput.auditReportVersion}`);
        }
      }

      process.exit(0);
    } else {
      console.debug("Reading from stdin...", process.argv);
      // Read data from stdin
      const jsonInput = await process.stdin.toArray();

      // Convert the array of buffers to a single buffer and then to a string
      const bufferStr = Buffer.concat(jsonInput).toString("utf-8");

      // Npm audit JSON input
      const parsedInput = JSON.parse(bufferStr);

      switch (parsedInput.auditReportVersion) {
        case 1: {
          console.log("Audit v1 is not supported yet.");

          break;
        }
        case 2: {
          const report = generateReportV2(parsedInput);

          // Generate HTML file using the report data
          generateReportTemplateV2({ report, theme });
          break;
        }
      }

      process.exit(0);
    }
  } catch (error) {
    console.error("Error creating report: ", error);

    process.exit(1);
  }
}

main();
