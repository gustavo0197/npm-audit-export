import loadReportFile from "./utils/common/load-file.js";
import generateReportV2 from "./utils/v2/index.js";

async function main() {
  try {
    if (process.stdin.isTTY) {
      // Use arguments provided via CLI
      console.debug("PROVIDED ARGS", process.argv);
      const jsonIndex = process.argv.indexOf("--json");

      // --json argument is required
      if (jsonIndex === -1) {
        throw new Error("Please provide --json argument with npm audit JSON data.");
      }

      const jsonFilePath = process.argv[jsonIndex + 1];

      // --json argument must have a valid file path
      if (!jsonFilePath) {
        throw new Error("Please provide a valid file path for --json argument.");
      }

      // Load npm audit JSON file
      const fileContent = loadReportFile(jsonFilePath);

      // Parse JSON content
      const parsedInput = JSON.parse(fileContent);

      // TODO: Verify which version of report is being used and call the appropriate functions
      generateReportV2(parsedInput);

      process.exit(1);
    } else {
      console.debug("Reading from stdin...");
      // Read data from stdin
      const jsonInput = await process.stdin.toArray();

      // Convert the array of buffers to a single buffer and then to a string
      const bufferStr = Buffer.concat(jsonInput).toString("utf-8");

      // Npm audit JSON input
      const parsedInput = JSON.parse(bufferStr);

      console.log("Input: ", parsedInput);
    }
  } catch (error) {
    console.error("Error creating report: ", error);

    process.exit(1);
  }
}

main();
