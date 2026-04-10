export default function getArg(name: string, isRequired: boolean = false): string | undefined {
  const index = process.argv.indexOf(`--${name}`);

  // If is was not found and is required throw an error
  if (index === -1) {
    if (isRequired) {
      throw new Error(`Required argument was not provided: --${name}`);
    }

    return undefined;
  }

  return process.argv[index + 1];
}
