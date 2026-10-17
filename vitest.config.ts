import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias: { "@": path.join(dirname, "src") } },
        test: {
          name: "reports",
          environment: "node",
          include: [
            "src/features/inventory/**/*.test.ts",
            "src/features/inventory/**/*.test.tsx",
            "src/features/reports/**/*.test.ts",
            "src/features/products/**/*.test.ts",
            "src/features/orders/**/*.test.ts",
            "src/features/orders/**/*.test.tsx",
            "src/features/shipping-labels/**/*.test.ts",
            "src/features/settings/**/*.test.ts",
            "src/features/settings/**/*.test.tsx",
          ],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
