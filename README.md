# Localization Management System

## Database Architecture

The system uses a relational database (PostgreSQL via Supabase) with the following structure:

### Core Tables

#### 1. `projects`
- Stores different projects (e.g., "Website", "Mobile App")
- **Fields**:
  - `id`: Unique identifier (UUID)
  - `name`: Project name
  - `description`: Optional project description
  - `created_at`, `updated_at`: Timestamps

#### 2. `languages`
- Manages supported languages
- **Fields**:
  - `code`: ISO 639-1 language code (e.g., 'en', 'es')
  - `name`: Full language name
  - `is_active`: Whether the language is enabled

#### 3. `translation_keys`
- Stores unique keys used in the application
- **Fields**:
  - `id`: Unique identifier (UUID)
  - `key`: The translation key (e.g., "welcome.message")
  - `category`: For organization (e.g., "auth", "navigation")
  - `description`: Optional context for translators
  - `created_at`: Timestamp

#### 4. `translations`
- Stores the actual translated text
- **Fields**:
  - `key_id`: References `translation_keys(id)`
  - `language_code`: References `languages(code)`
  - `value`: The translated text
  - `updated_by`: References `auth.users(id)`
  - `updated_at`: Timestamp

#### 5. `project_translation_keys` (Junction Table)
- Links projects to their translation keys
- **Fields**:
  - `project_id`: References `projects(id)`
  - `key_id`: References `translation_keys(id)`

### Authentication Integration

The system integrates with Supabase Auth through the `auth.users` table:

- `translations.updated_by` → `auth.users(id)`: Tracks which user last modified each translation
- This enables:
  - Audit trails of changes
  - User-specific permissions
  - Activity tracking

### Example Data Flow

1. Create a project: `INSERT INTO projects (name) VALUES ('My App')`
2. Add languages: `INSERT INTO languages (code, name, is_active) VALUES ('en', 'English', true)`
3. Create a translation key: `INSERT INTO translation_keys (key, category) VALUES ('welcome.message', 'auth')`
4. Link key to project: `INSERT INTO project_translation_keys (project_id, key_id) VALUES (1, 1)`
5. Add translations:
   ```sql
   INSERT INTO translations (key_id, language_code, value, updated_by)
   VALUES (1, 'en', 'Welcome to our app!', 'user-uuid-here');
