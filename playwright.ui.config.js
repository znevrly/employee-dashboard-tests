const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  use: {
    baseURL: 'https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com',
  },
  testMatch: '**/ui-tests/**/*.spec.js'
});