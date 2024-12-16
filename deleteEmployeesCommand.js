const { request } = require('@playwright/test');
require('dotenv').config();

async function deleteAllemployees(apiBaseUrl, authToken) {
  const apiContext = await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authToken}`,
    },
  });

  const ENDPOINT = '/Prod/api/employees';
  const response = await apiContext.get(ENDPOINT);
  const employees = await response.json();
  console.log(`Found employees: ${employees.length}`);

  for (const employee of employees) {
    console.log(`Deleting employee with ID: ${employee.id}`);
    const deleteResponse = await apiContext.delete(`${ENDPOINT}/${employee.id}`);
    if (!deleteResponse.ok()) {
      console.error(`Failed to delete employee ${employee.id}: ${deleteResponse.status()} ${deleteResponse.statusText()}`);
    } else {
      console.log(`Deleted employee ${employee.id}`);
    }
  }
  await apiContext.dispose();
}

(async () => {
  const apiBaseUrl = process.env.API_BASE_URL || 'https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com';
  const authToken = process.env.AUTH_TOKEN;

  try {
    await deleteAllemployees(apiBaseUrl, authToken);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();