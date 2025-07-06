# Localization Management API

This is a FastAPI application that provides a complete localization management solution with Supabase integration. The project features a fully automated database setup that initializes all necessary database components with a single command. To get started, you'll need to:

1. Create a free account at [Supabase](https://supabase.com/)
2. Create a new project in the Supabase dashboard
3. Note down your project's URL, Service Role Key, anon/public key, and database password from Project Settings

## Database Initialization

The project includes a comprehensive database setup that creates and configures all required database components:

1. **Database Schema**:
   - `translation_keys` - Stores all translatable text keys and metadata
   - `languages` - Manages supported languages and their active status
   - `translations` - Contains the actual translated text for each key and language

2. **Row Level Security (RLS)**:
   - Pre-configured RLS policies for secure data access
   - Authenticated users can view all translations
   - Only authorized users can create or update translations

3. **Initial Data**:
   - Pre-loaded with common languages (English, Spanish, etc.)
   - Sample translation keys for common UI elements
   - Test users with appropriate permissions

4. **Setup Automation**:
   - Database migrations for schema versioning
   - Seed script for initial data population
   - Environment-based configuration

## Setup

1.  Create and activate a virtual environment (recommended):
    ```bash
    python -m venv venv # or python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Set up Supabase:

Make sure you have youre Supabase keys and db password, run the database migration, and seed the test data & users (./setup.sh does this for you).

```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```
The script will guide you through:
- Installing Supabase CLI (if needed)
- Logging in to Supabase
- Setting up your project
- Applying database migrations
- Seeding test data & users

## Running the server

```bash
uvicorn src.localization_management_api.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

## Development

### Database Migrations

To create and apply new migrations:

1. Create a new migration:
   ```bash
   supabase migration new "your_migration_name"
   ```

2. Apply migrations:
   ```bash
   supabase db push
   ```

### Running Tests

The test suite includes comprehensive tests for the localization management API endpoints. The main test file `tests/test_api/test_localizations.py` contains the following test cases:

1. **Basic Operations**
   - `test_get_translation_keys`: Verifies retrieval of all translation keys
   - `test_update_translation`: Tests updating a single translation
   - `test_bulk_update_translations`: Tests updating multiple translations at once

2. **Error Handling**
   - `test_update_invalid_language`: Validates language code validation
   - `test_update_missing_parameters`: Checks required parameter validation
   - `test_update_nonexistent_key`: Ensures proper handling of non-existent keys
   - `test_bulk_update_empty_request`: Tests empty bulk update requests
   - `test_bulk_update_invalid_key`: Validates bulk updates with invalid keys
   - `test_bulk_update_invalid_language`: Checks bulk updates with invalid languages
   - `test_bulk_update_missing_fields`: Verifies required field validation in bulk updates

Run the entire test suite:

```bash
pytest
```

To run a specific test function, for example, just the translation keys test:

```bash
pytest tests/test_api/test_localizations.py::test_get_translation_keys -v
```

To run tests with detailed output and print all print statements:

```bash
pytest -v -s
```

Common pytest options:
- `-v`: Verbose output (shows test names and status)
- `-s`: Don't capture stdout (print statements will be visible)
- `-x`: Stop after first failure
- `--pdb`: Drop into debugger on failure

## Project Structure

```
localization-management-api/
├── src/
│   └── localization_management_api/
│       ├── __init__.py
│       ├── main.py               # FastAPI application setup and configuration
│       ├── deps.py               # Dependency injection setup
│       ├── core/                 # Core application components
│       │   ├── config.py         # Application configuration and settings
│       │   └── supabase_client.py # Supabase client initialization
│       └── routers/              # API route handlers
│           ├── localizations.py  # Localization management endpoints
│           └── analytics.py      # Analytics endpoints
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migration files
│       └── <migration_files>     # Individual migration files
├── scripts/                      # Utility scripts
│   └── seed_prod_data.py         # Script to seed production data
├── tests/                        # Test files
│   ├── conftest.py              # Pytest configuration and fixtures
│   └── test_api/                # API test files
│       └── test_localizations.py # Tests for localization endpoints
├── .env.example                  # Example environment variables
├── setup.sh                      # Setup script for local development
└── requirements.txt              # Project dependencies
```