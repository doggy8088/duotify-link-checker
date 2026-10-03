import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js"],
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "https://example.com/page?x=1" } },
    coverage: {
      provider: "v8",
      include: [
        "src/core/**",
        "src/content/resources.js",
        "src/content/special.js",
        "src/content/highlight.js",
        "src/content/transport.js",
      ],
      reporter: ["text", "html", "json-summary"],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
