const { test, expect } = require('@playwright/test');
const jp = require('jsonpath');
const { v4: uuidv4 } = require('uuid');

const ENDPOINT = '/Prod/api/employees';

test.describe('API Employee Tests', () => {


    test('200 http status for employee list', async ({ request }) => {
        const response = await request.get(ENDPOINT);
        expect(response.status()).toBe(200);
    });

    test('each employee has salary 52K', async ({ request }) => {
        const response = await request.get(ENDPOINT);
        const salaries = jp.query(response.json(), '$..salary');
        const allSallariesExpected = salaries.every(salary => salary === 52000);
        expect(allSallariesExpected).toBeTruthy();
    });

    test('benefitCosts is calculated as ($1000 + dependents * $500)/26', async ({ request }) => {
        const response = await request.get(ENDPOINT);
        const data = await response.json();
        for (const item of data) {
            const expectedBenefitsCost = (1000 + item.dependants * 500) / 26;
            expect(item.benefitsCost).toBeCloseTo(expectedBenefitsCost, 2);
        }
    });

    test('net pay is calculated as gross - benefitsCost', async ({ request }) => {
        const response = await request.get(ENDPOINT);
        const data = await response.json();
        for (const item of data) {
            const expectedNet = item.gross - item.benefitsCost;
            expect(item.net).toBeCloseTo(expectedNet, 2);
        }
    });


    test('create new employee with 0 dependants', async ({ request }) => {
        const newEmployee = {
            firstName: `New ${uuidv4()}`,
            lastName: `Employee ${uuidv4()}`,
            dependants: 0,
        };

        await createAndVerifyEmployee(request, newEmployee);
    });

    test('create new employee with 1+ dependants', async ({ request }) => {
        const newEmployee = {
            firstName: `New ${uuidv4()}`,
            lastName: `Employee ${uuidv4()}`,
            dependants: 2,
        };

        await createAndVerifyEmployee(request, newEmployee);
    });

    test('update empoloyee by populating new data (increasing firstName, lastName, dependants)', async ({ request }) => {
        const unique = uuidv4();
        const newEmployee = {
            firstName: `New`,
            lastName: `Employee ${unique}`,
            dependants: 0,
        };

        const originalEmployee = await createAndVerifyEmployee(request, newEmployee);

        const updatedEmployeeData = {
            id: originalEmployee.id,
            firstName: `Updated New`,
            lastName: `Updated Employee`,
            dependants: 2,
        };

        const updateRes = await request.put(ENDPOINT, {
            data: updatedEmployeeData,
        });

        expect(updateRes.status()).toBe(200);

        const getRes = await request.get(`${ENDPOINT}/${originalEmployee.id}`);
        expect(getRes.status()).toBe(200);
        const actualEmployee = await getRes.json();

        expect(actualEmployee.firstName).toBe(updatedEmployeeData.firstName);
        expect(actualEmployee.lastName).toBe(updatedEmployeeData.lastName);
        expect(actualEmployee.dependants).toBe(updatedEmployeeData.dependants);
    });


    test('remove employee', async ({ request }) => {
        const unique = uuidv4();
        const newEmployee = {
            firstName: `New`,
            lastName: `Employee ${unique}`,
            dependants: 0,
        };

        const originalEmployee = await createAndVerifyEmployee(request, newEmployee);
        const deleteRes = await request.delete(`${ENDPOINT}/${originalEmployee.id}`);
        expect(deleteRes.status()).toBe(200);
    });


    test('get non existing employee - valid uuid employee', async ({ request }) => {
        const res = await request.get(`${ENDPOINT}/${uuidv4()}`);
        expect(res.status()).toBe(404);
    });

    test('get non existing employee - invalid uuid employee', async ({ request }) => {
        const res = await request.get(`${ENDPOINT}/invalidUiid`);
        expect(res.status()).toBe(404);
    });

    test('remove non existing employee', async ({ request }) => {
        const res = await request.delete(`${ENDPOINT}/${uuidv4()}`);
        expect(res.status()).toBe(404);
    });


    async function createAndVerifyEmployee(request, newEmployee) {
        const createdRes = await request.post(ENDPOINT, {
            data: newEmployee,
        });
        expect(createdRes.status()).toBe(200);

        const created = await createdRes.json();
        const employeeRes = await request.get(`${ENDPOINT}/${created.id}`);
        expect(employeeRes.status()).toBe(200);

        const employee = await employeeRes.json();
        expect(employee.firstName).toBe(newEmployee.firstName);
        expect(employee.lastName).toBe(newEmployee.lastName);
        expect(employee.dependants).toBe(newEmployee.dependants);
        return employee;
    }

});
