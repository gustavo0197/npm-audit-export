export default function unwindVias(vulnerabilities: any[]): any[] {
  const flat: any[][] = [[]];

  for (const vulnerability of vulnerabilities) {
    switch (typeof vulnerability) {
      case "string": {
        // If it's a string, just push it to the last array in flat
        flat[flat.length - 1]?.push(vulnerability);

        break;
      }
      case "object": {
        if (Array.isArray(vulnerability)) {
          const children = unwindVias(vulnerability.slice(1));
          const hasArrays = children.every((n) => Array.isArray(n));

          // If children are arrays, we need to create new paths
          if (hasArrays) {
            for (const child of children) {
              flat[flat.length - 1]?.push([vulnerability[0], ...child]);
            }
          } else {
            // If children are not arrays, just push them as a single path
            flat[flat.length - 1]?.push([vulnerability[0], ...children]);
          }
        } else {
          // If it's an object but not an array, just push it as is
          flat[flat.length - 1]?.push(vulnerability);
        }

        break;
      }
      default:
        console.warn("unknown type", typeof vulnerability);
    }
  }

  return flat.flat();
}
