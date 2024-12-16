# Employee Dashboard Tests

This project contains API and UI tests for the Employee Dashboard. Some tests might fail due to current bugs in API/UI.

## Requirements
-Node.js LTS  
-NPM (Yarn)

## Setup

1. Clone the repository

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory with the following content:
    ```
    AUTH_TOKEN=<BASIC AUTH token>
    TEST_USERNAME=<username>
    TEST_PASSWORD=<password>
    ```

## Running API Tests

```sh
npx playwright test --config=playwright.api.config.js
```

## Running UI Tests

```sh
npx playwright test --config=playwright.ui.config.js
```


## Running Tests in Debug Mode

On Windows
```sh
set DEBUG=pw:api && npx playwright test --<configName>
```

On Linux
```sh
DEBUG=pw:api npx playwright test --<configName>
```

## Running Single Test

```sh
npx playwright test --config=playwright.api.config.js --grep <keyword>
```


## Purge Test Data

```sh
npm run deleteEmployees
```

