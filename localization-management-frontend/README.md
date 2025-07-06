This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:
(Login credentials are in the project root README.md)

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
If this doesn't work then install dependencies then try again:

```bash
npm install
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can login, edit translations, see the completion percentage, and signout.

## Tests

This project includes end-to-end tests using Playwright to ensure the translation management functionality works as expected.

## Test Prerequisites

Before running the tests, make sure the localization management API server is running. The frontend tests depend on this backend service.

1. Navigate to the `localization-management-api` directory
2. Start the API server (refer to the API's README for specific instructions)
3. Ensure the API is accessible at the expected URL (default: http://localhost:8000)

### Test Suite

The test suite verifies the following user flows:
1. **Authentication**
   - Successful login with valid credentials
   - Proper sign out functionality
2. **Translation Management**
   - Editing a translation cell
   - Saving changes and verifying the update
   - Reverting changes to the original value
3. **Search Functionality**
   - Searching for existing translations
   - Verifying search results are filtered correctly
   - Testing the "no results" state
   - Clearing search and verifying all results are shown

### Running Tests

Run the following commands to execute the tests:

```bash
# Run all tests in headless mode
npm run test

# Run tests with UI (helpful for debugging)
npm run test:ui

# Run tests in specific browsers (headed mode)
npm run test:chrome
npm run test:firefox
npm run test:safari

# Debug tests with Playwright Inspector
npm run test:debug
```

### Test Reports

After running the tests, you can view the HTML report by running:

```bash
npx playwright show-report
```

### Test Configuration

Test configuration can be found in `playwright.config.ts`, where you can modify:
- Browser configurations
- Timeout settings
- Viewport sizes
- Base URL for the application

## Project Structure

```
localization-management-frontend/
├── app/                            # Next.js app directory
│   ├── components/                 # Reusable UI components
│   │   ├── providers/              # Context and theme providers
│   │   └── translation-components/ # Translation-specific components
│   ├── login/                      # Authentication pages
│   └── (other app routes)          # Application pages
├── lib/                            # Application libraries and utilities
│   ├── react-query/                # React Query configuration and hooks
│   │   ├── queryClient.ts          # Query client configuration
│   │   ├── queryKeys.ts            # Query key constants
│   │   ├── translationsHooks.ts    # Custom hooks for translations
│   │   ├── analyticsHooks.ts       # Custom hooks for analytics
│   │   └── profileHooks.ts         # Custom hooks for user profile
│   └── zustand-stores/             # State management stores
│       ├── translationStore.ts     # Store for translation state
│       ├── profileStore.ts         # Store for user profile state
│       └── searchStore.ts          # Store for search functionality
├── tests/                          # Test files
├── middleware.ts                   # Next.js middleware for route protection
└── package.json                    # Project dependencies and scripts
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy a Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
