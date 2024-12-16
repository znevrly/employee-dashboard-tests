const { test, expect } = require('@playwright/test');
require('dotenv').config();


async function login(page, username, password) {
    await page.goto('Prod/Account/Login');
    await page.fill('#Username', username);
    await page.fill('#Password', password);
    await page.click('button.btn.btn-primary');
}

test.describe('UI Dashboard tests. Minimal sett of UI tests. Includes flows, functionality is covered in API tests', () => {
    const username = process.env.TEST_USERNAME || 'TestUser490';
    const password = process.env.TEST_PASSWORD;

    test('log in successfully with valid credentials', async ({ page }) => {
        await login(page, username, password);
        const logoutLink = page.locator('a[href="/Prod/Account/LogOut"]');
        await expect(logoutLink).toBeVisible();
        await expect(logoutLink).toHaveAttribute('href', '/Prod/Account/LogOut');
    });

    test('cant log in with invalid credentials', async ({ page }) => {
        await login(page, username, 'invalid-password');
        const errorMessage = page.locator('div.text-danger.validation-summary-errors');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('The specified username or password is incorrect.');
    });

    test('add employee and verify if calculated values such Salary, Gross Pay, Benifits Costs, Net Pay are corrently shown on UI', async ({ page }) => {
        await login(page, username, password);
        const addButton = page.locator('#add');
        await page.waitForTimeout(2000);
        await expect(addButton).toBeVisible();
        await addButton.click();

        const employeeModal = page.locator('#employeeModal');
        await expect(employeeModal).toBeVisible();

        // create unique last name to identify record in employee list
        const uniqueLastName = `Employee-${Date.now()}`;
        await page.fill('#firstName', 'New');
        await page.fill('#lastName', uniqueLastName);
        await page.fill('#dependants', '2');
        const addEmployeeButton = page.locator('#addEmployee');
        await expect(addEmployeeButton).toBeVisible();
        await addEmployeeButton.click();
        await expect(employeeModal).not.toBeVisible();


        const employeeRow = page.locator('#employeesTable tbody tr', {
            hasText: uniqueLastName
        });
        await expect(employeeRow).toBeVisible();
        const numericValues = [
            { columnIndex: 4, expectedValue: '2' },
            { columnIndex: 5, expectedValue: '52000.00' },
            { columnIndex: 6, expectedValue: '2000.00' },
            { columnIndex: 7, expectedValue: '76.92' },
            { columnIndex: 8, expectedValue: '1923.08' }
        ];
        for (const { columnIndex, expectedValue } of numericValues) {
            const cell = employeeRow.locator(`td:nth-child(${columnIndex})`);
            await expect(cell).toHaveText(expectedValue);
        }
    });

    test('update an existing employee', async ({ page }) => {
        await login(page, username, password);
        const editButton = page.locator('table#employeesTable .fa-edit').first();
        await expect(editButton).toBeVisible();
        await editButton.click();

        const employeeModal = page.locator('#employeeModal.show');
        await expect(employeeModal).toBeVisible();
        await page.fill('#firstName', 'New - edited');
        await page.fill('#lastName', 'Employee - edited');
        await page.fill('#dependants', '3');

        const updateEmployeeButton = page.locator('#updateEmployee');
        await expect(updateEmployeeButton).toBeVisible();
        await updateEmployeeButton.click();
        await expect(employeeModal).not.toBeVisible();
    });

    test('delete an existing employee', async ({ page }) => {
        await login(page, username, password);
        const deleteButton = page.locator('table#employeesTable .fa-times').first();
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();

        const deleteModal = page.locator('#deleteModal.show');
        await expect(deleteModal).toBeVisible();
        const deleteEmployeeButton = page.locator('#deleteEmployee');
        await expect(deleteEmployeeButton).toBeVisible();
        await deleteEmployeeButton.click();

        await expect(deleteModal).not.toBeVisible();
    });
});
