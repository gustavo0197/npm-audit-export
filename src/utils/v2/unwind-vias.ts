export default function unwindVias(vias: any[][], sibbling?: string): any[] {
  const unwoundVias: any[][] = [];

  for (let x = 0; x < vias.length; x++) {
    unwoundVias.push([]);
    let parent = "";

    if (x === 0 && sibbling) {
      unwoundVias[x]?.push(sibbling);
    }

    if (typeof vias[0] === "string") {
      parent = vias[0];
    }

    if (!vias[x]) {
      continue;
    }

    switch (typeof vias[x]) {
      case "string": {
        unwoundVias[x]?.push([vias[x]]);
        break;
      }
      case "object": {
        if (!vias[x]) {
          continue;
        }

        if (Array.isArray(vias[x])) {
          // Recursively unwind
          const data = unwindVias(vias[x], parent).flat();

          unwoundVias[x]?.push(data);
        } else {
          unwoundVias[x]?.push(vias[x]);
        }
        break;
      }
      default: {
        console.warn("Unknown via type during unwind: ", {
          type: typeof vias[x],
          via: vias[x],
        });
      }
    }
  }

  // console.log("UNWINDING VIAS: ", vias);
  // console.log("UNWOUND VIAS: ", unwoundVias);

  // return unwoundVias;

  if (sibbling) {
    return unwoundVias.flat();
  } else {
    return unwoundVias;
  }
}
