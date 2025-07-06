# Localization Management API

This is a FastAPI application to manage localizations with Supabase integration.

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

3.  Set up Supabase envs, run database migrations, and seed test data & users:
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

### API Documentation

- Helium API docs: `https://github.com/nlhogsten/Helium-Full-Stack/blob/main/localization-management-api/README.md`

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

```bash
pytest
```

## Project Structure

```
localization-management-api/
├── src/
│   └── localization_management_api/
│       ├── __init__.py
│       ├── main.py           # FastAPI application
│       ├── database.py       # Database connection
│       ├── models/           # SQLAlchemy models
│       └── api/              # API endpoints
├── supabase/
│   └── migrations/        # Database migrations
├── tests/                   # Test files
├── .env                    # Environment variables (auto-created)
├── .gitignore
├── pyproject.toml
├── README.md
└── setup.sh               # Setup script
