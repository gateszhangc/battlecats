const { defineConfig } = require("@playwright/test");

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: externalBaseURL || "http://127.0.0.1:4174",
    trace: "on-first-retry"
  },
  webServer: externalBaseURL
    ? undefined
    : {
        command: "PORT=4174 node server.js",
        url: "http://127.0.0.1:4174",
        reuseExistingServer: false,
        timeout: 120_000
      }
});
