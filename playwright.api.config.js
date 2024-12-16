const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  use: {
    baseURL: 'https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
       Authorization: `Basic ${process.env.AUTH_TOKEN}`
    },
  },
  testMatch: '**/api-tests/**/*.spec.js'
});