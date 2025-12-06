async function main() {
  try {
    if (process.stdin.isTTY) {
      // Use arguments provided via CLI
      console.error("Not implemented yet.");

      process.exit(1);
    } else {
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
