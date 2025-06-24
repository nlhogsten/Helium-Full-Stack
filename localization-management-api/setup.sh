#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Supabase setup...${NC}"

# Check if running in a virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "${YELLOW}⚠️  Please activate your virtual environment first and run this script again.${NC}"
    echo -e "  python -m venv venv"
    echo -e "  source venv/bin/activate  # On Windows: .\\venv\\Scripts\\activate"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js and npm (needed for Supabase CLI)
if ! command_exists node || ! command_exists npm; then
    echo -e "${YELLOW}❌ Node.js and npm are required for Supabase CLI.${NC}"
    echo -e "Please install them and try again: https://nodejs.org/"
    exit 1
fi

# Install Supabase CLI if not installed
if ! command_exists supabase; then
    echo -e "${GREEN}⬇️  Installing Supabase CLI...${NC}"
    npm install -g supabase
fi

# Check if user is logged in to Supabase
echo -e "${GREEN}🔑 Checking Supabase login status...${NC}"
if ! supabase status > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  You need to log in to Supabase. A browser window will open for authentication.${NC}"
    supabase login
else
    echo -e "${GREEN}✅ Already logged in to Supabase${NC}"
fi

# Get Supabase URL and project reference
echo -e "\n${GREEN}🔗 Setting up Supabase project...${NC}"
read -p "Enter your full Supabase URL (e.g., https://abc123.supabase.co): " SUPABASE_URL

# Extract project reference from URL (compatible with macOS grep)
PROJECT_REF=$(echo $SUPABASE_URL | grep -o 'https://[^.]*' | cut -d'/' -f3)
if [ -z "$PROJECT_REF" ]; then
    echo -e "${YELLOW}❌ Invalid Supabase URL format. Please use format: https://<project-ref>.supabase.co${NC}"
    exit 1
fi

# Get anon key from user
read -p "Enter your Supabase anon key (from Project Settings > API): " ANON_KEY
if [ -z "$ANON_KEY" ]; then
    echo -e "${YELLOW}❌ Anon key is required. Please get it from Project Settings > API in your Supabase dashboard.${NC}"
    exit 1
fi

read -p "Enter your Supabase service role key (from Project Settings > API): " SERVICE_ROLE_KEY
if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}❌ Service role key is required. Please get it from Project Settings > API in your Supabase dashboard.${NC}"
    exit 1
fi

# Get database password
read -s -p "Enter your database password (from Project Settings > Database): " DB_PASSWORD
echo ""  # New line after password input
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}❌ Database password is required for migrations. Please get it from Project Settings > Database.${NC}"
    exit 1
fi

# Create .env file
echo -e "\n${GREEN}📝 Creating .env file...${NC}"
cat > .env <<EOL
# Supabase
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
DATABASE_PASSWORD=${DB_PASSWORD}

# App
DEBUG=True
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
EOL

# Create frontend .env.local file
FRONTEND_ENV_FILE="../localization-management-frontend/.env.local"
echo -e "\n${GREEN}🌐 Creating frontend .env.local file...${NC}"
cat > "$FRONTEND_ENV_FILE" <<EOL
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY

# Environment
NEXT_PUBLIC_DEBUG=true
EOL

# Set appropriate permissions
chmod 600 "$FRONTEND_ENV_FILE"
echo -e "${GREEN}✅ Created frontend .env.local file at $FRONTEND_ENV_FILE${NC}"

# Verify the file was created
if [ -f "$FRONTEND_ENV_FILE" ]; then
    echo -e "${GREEN}✅ Frontend environment variables set up successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to create frontend .env.local file${NC}"
fi

# Link to Supabase project
echo -e "${GREEN}🔗 Linking to Supabase project...${NC}"
supabase link --project-ref "$PROJECT_REF"

# Apply database migrations
echo -e "\n${GREEN}🔄 Applying database migrations...${NC}"
if SUPABASE_DB_PASSWORD="$DB_PASSWORD" supabase db push; then
    echo -e "${GREEN}✅ Database migrations applied successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to apply migrations. Please check the error messages above.${NC}"
    echo -e "${YELLOW}You can try running 'SUPABASE_DB_PASSWORD=your_password supabase db push' manually.${NC}"
fi

echo -e "\n${GREEN}🌱 Seeding test data...${NC}"
if python -m scripts.seed_test_data; then
    echo -e "${GREEN}✅ Test data seeded successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to seed test data. Make sure you have the required dependencies installed.${NC}"
    echo -e "${YELLOW}You can try running it manually with: python -m scripts.seed_test_data${NC}"
fi

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\nNext steps:"
echo -e "1. Start the development server with:\n"
echo -e "   uvicorn src.localization_management_api.main:app --reload\n"
echo -e "The API will be available at ${GREEN}http://localhost:8000${NC}"
echo -e "API documentation: ${GREEN}http://localhost:8000/docs${NC}"
