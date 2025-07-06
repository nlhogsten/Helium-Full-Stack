# Localization Management System

## Running the Project

To run this project locally the FastAPI backend server and Next.js frontend must be running simultaneously.

### Backend

1. Navigate to the `localization-management-api` directory
2. Start the API server (refer to the API's README for specific instructions)

### Frontend

1. Open a new terminal and navigate to the `localization-management-frontend` directory
2. Start the development server: (refer to the Frontend's README for specific instructions)

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

### Authentication Integration

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
   - Additional features like versioning would require schema extensions

3. **Simplicity**:
   - Chose a simpler schema over a more complex normalized one
   - Makes the system easier to understand and maintain
   - Reduces the number of joins needed for common queries

This architecture provides a solid foundation for a secure, multi-tenant localization system that can scale with your needs while maintaining data integrity and security.
