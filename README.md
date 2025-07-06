# Localization Management System

## Running the Project

To run this project locally the FastAPI backend server and Next.js frontend must be running simultaneously.

### Live Demo

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://helium-full-stack.vercel.app/)
( https://helium-full-stack.vercel.app/ )

**Test Account Credentials:**
```json
[
  {
    "name": "Test User 1",
    "email": "user1@example.com",
    "password": "user1pass123!"
  },
  {
    "name": "Test User 2",
    "email": "user2@example.com",
    "password": "user2pass123!"
  }
]
```

### Backend

1. Navigate to the `localization-management-api` directory
2. Start the API server (refer to the API's README for specific instructions)

### Frontend

1. Open a new terminal and navigate to the `localization-management-frontend` directory
2. Start the development server: (refer to the Frontend's README for specific instructions)

## Database Architecture

The system uses a relational database (PostgreSQL via Supabase) with the following structure:

### Core Tables

The database schema is designed around three main tables that work together to provide a flexible and efficient translation management system:

#### 1. ***`languages`***
- **Purpose**: Centralized language management
- **Advantages**:
  - Single source of truth for supported languages
  - Easy to enable/disable languages without data deletion
  - Prevents typos in language codes through referential integrity
- **Fields**:
  - `code`: ISO 639-1 language code (e.g., 'en', 'es')
  - `name`: Full language name
  - `is_active`: Whether the language is enabled

#### 2. `translation_keys`
- **Purpose**: Stores unique translation keys and metadata
- **Advantages**:
  - Decouples key management from translations
  - Supports categorization for better organization
  - Enforces key uniqueness across the application
  - Includes timestamps for auditing
- **Fields**:
  - `id`: Unique identifier (UUID)
  - `key`: The translation key (e.g., "welcome.message")
  - `category`: For organization (e.g., "auth", "navigation")
  - `description`: Optional context for translators
  - `created_at`: Timestamp

#### 3. `translations`
- **Purpose**: Stores actual translated content
- **Advantages**:
  - Many-to-many relationship between keys and languages
  - Tracks who made the last update
  - Maintains full history of changes through timestamps
  - Efficient lookups with composite unique constraint on (key_id, language_code)
- **Fields**:
  - `key_id`: References `translation_keys(id)`
  - `language_code`: References `languages(code)`
  - `value`: The translated text
  - `updated_by`: References `auth.users(id)`
  - `updated_at`: Timestamp

## API Routes

The application exposes the following API endpoints through FastAPI:

### Localizations
- `GET /localizations`
  - Fetches all translation keys with their translations across all languages
  - Returns a structured object with translation data

- `PATCH /localizations/{key_id}?lang={lang}&value={value}`
  - Updates a specific translation for a given key and language
  - Requires `key_id`, `lang` (language code), and `value` (translation text)

- `PATCH /localizations/bulk-update`
  - Updates multiple translations in a single request
  - Accepts an array of translation update objects with `key_id`, `language_code`, and `value`

### Analytics
- `GET /analytics/translation-completion`
  - Returns translation completion statistics by language
  - Shows percentage of translated strings for each active language
  - Helps track translation progress across the application

All API endpoints are prefixed with `/api` in production and require proper authentication.

## Frontend Architecture

The frontend leverages Zustand for local state management and React Query with axios for APIs & server state management.

### State Management with Zustand

Zustand is used for managing local application state across components:

1. **Search State**
   - Managed in `searchStore.ts`
   - Used by `SearchBar.tsx` for filtering translation keys
   - Provides a centralized way to manage search queries across the application
   - Enables debounced search functionality using lodash to improve performance

2. **Translation State**
   - Managed in `translationStore.ts`
   - Used by `TranslationKeyManager.tsx` and `TranslationKeyRow.tsx`
   - Handles UI updates when translations are modified
   - Maintains client-side state consistency during CRUD operations

3. **Authentication State**
   - Managed in `profileStore.ts`
   - Used by `UserProfile.tsx` and `UserHydrator.tsx`
   - Handles user authentication state and session management
   - Provides a clean way to access user data throughout the application

### Data Fetching with React Query

React Query handles server state management with powerful features:

1. **Data Fetching**
   - `useAllTranslationKeys()` - Fetches all translation keys and their values
   - `useTranslationCompletion()` - Retrieves translation completion statistics
   - Automatic caching and background refetching
   - Request deduplication and caching for optimal performance

2. **Mutation Handling**
   - `useUpdateTranslation()` - Handles translation updates
   - Automatic cache invalidation
   - Updates for instant UI feedback
   - Error handling and retry logic

### Component Integration

- **SearchBar.tsx**: Uses Zustand to manage search state
- **TranslationKeyManager.tsx**: Combines both Zustand and React Query:
  - Uses Zustand for local state management
  - Uses React Query for data fetching and mutations
  - Implements optimistic updates for better UX
- **TranslationKeyRow.tsx**: Pure presentational component that receives props and callbacks
- **TranslationProgress.tsx**: Uses React Query to fetch and display translation completion stats
- **UserProfile.tsx**:
  - Utilizes Zustand's `useAuthStore` for authentication state
  - Handles user sign-out functionality
  - Manages user session state
- **UserHydrator.tsx**:
  - Server-side authentication state hydration
  - Initializes the authentication store with server-rendered user data
  - Ensures consistent authentication state between server and client

This architecture provides a clean separation of concerns, with React Query handling server state and Zustand managing local UI state, resulting in a maintainable and performant application.

## Testing

The application includes comprehensive testing strategies for both frontend and backend components.

### Backend Testing
- **Test Framework**: Pytest
- **Test Location**: `/tests/test_api/`
- **Key Features**:
  - API endpoint testing with FastAPI TestClient
  - Database integration tests with a test database
  - Fixtures for test data and database setup/teardown
  - Test coverage for all major API endpoints

### Frontend Testing
- **Test Framework**: Playwright with TypeScript
- **Test Location**: `/tests/e2e/`
- **Key Features**:
  - End-to-end testing of critical user flows
  - Cross-browser testing support (Chrome, Firefox, Safari)
  - Visual regression testing
  - API mocking for isolated component testing

## Authentication Integration

The system leverages Supabase Auth with Row Level Security (RLS) to ensure data protection:

1. **Authentication Requirements**:
   - All API endpoints require authentication
   - Users must be authenticated to access any translation data
   - User actions are tracked through the `updated_by` field

2. **Row Level Security Policies**:
   - **View Access**:
     - Authenticated users can view all languages, translation keys, and translations
     - Implements principle of least privilege while maintaining collaboration

   - **Modification Permissions**:
     - Authenticated users can create and update translations
     - Prevents unauthorized modifications through strict RLS policies
     - Maintains data integrity with proper foreign key constraints

3. **Security Features**:
   - Automatic timestamp updates for auditing
   - Cascading deletes to maintain referential integrity
   - UUID primary keys to prevent ID enumeration attacks
   - No direct table access - all operations go through RLS policies

### Trade-offs

1. **Performance vs. Security**:
   - RLS adds a small overhead but provides robust security
   - Caching strategies are implemented at the application level to mitigate this

2. **Flexibility**:
   - The current structure supports most common use cases

3. **Simplicity**:
   - Chose a simpler schema over a more complex normalized one
   - Makes the system easier to understand and maintain
   - Reduces the number of joins needed for common queries

## Deployment to Vercel

To deploy this project to Vercel, set up these environment variables in your Vercel project settings:

### Required Environment Variables

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `FRONTEND_URL` | URL where your frontend will be hosted | `https://your-app.vercel.app` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxxxxxxxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (keep secure) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `ENV` | Mark project status | `production` |

### Deployment Steps:
1. Push your code to a GitHub/GitLab repository
2. Import the repository into Vercel
3. Go to your project settings → Environment Variables
4. Add each required variable with its value
5. Deploy your application

**Security Note:** Never commit sensitive keys to version control. Use environment variables for all secrets.