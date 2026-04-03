import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  return {
    mode,
    test: {
      include: ["src/**/*.test.ts"],
      coverage: {
        provider: "v8",
        include: ["src/**/*.ts"],
        exclude: ["src/**/*.test.ts"],
      },
    },
  };
});
