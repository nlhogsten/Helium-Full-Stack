#!/usr/bin/env bash

set -euo pipefail

# ───────────────────────── Colors ─────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Supabase setup...${NC}"

# ───────────── Check Python Virtual Environment ─────────────
if [ -z "${VIRTUAL_ENV:-}" ]; then
  echo -e "${YELLOW}⚠️  Please activate your virtual environment first and run this script again.${NC}"
  echo -e "  python -m venv venv"
  echo -e "  source venv/bin/activate  # On Windows: .\\venv\\Scripts\\activate"
  exit 1
fi

# ───────────── Check Dependencies ─────────────
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

if ! command_exists node || ! command_exists npm; then
  echo -e "${YELLOW}❌ Node.js and npm are required for Supabase CLI.${NC}"
  echo -e "Please install them from: https://nodejs.org/"
  exit 1
fi

if ! command_exists supabase; then
  echo -e "${GREEN}⬇️  Installing Supabase CLI...${NC}"
  npm install -g supabase
fi

# ───────────── Supabase Login Check ─────────────
echo -e "${GREEN}🔑 Checking Supabase login status...${NC}"
if ! supabase status > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  You need to log in to Supabase. A browser window will open.${NC}"
  supabase login
else
  echo -e "${GREEN}✅ Already logged in to Supabase${NC}"
fi

# ───────────── Get Credentials ─────────────
echo -e "\n${GREEN}🔗 Setting up Supabase project...${NC}"
read -p "Enter your full Supabase URL (e.g., https://abc123.supabase.co): " SUPABASE_URL

PROJECT_REF=$(echo "$SUPABASE_URL" | grep -o 'https://[^.]*' | cut -d'/' -f3)
if [ -z "$PROJECT_REF" ]; then
  echo -e "${YELLOW}❌ Invalid Supabase URL. Use format: https://<project-ref>.supabase.co${NC}"
  exit 1
fi

read -p "Enter your Supabase anon key: " ANON_KEY
[ -z "$ANON_KEY" ] && { echo -e "${YELLOW}❌ Anon key is required.${NC}"; exit 1; }

read -p "Enter your Supabase service role key: " SERVICE_ROLE_KEY
[ -z "$SERVICE_ROLE_KEY" ] && { echo -e "${YELLOW}❌ Service role key is required.${NC}"; exit 1; }

echo -e "\n${YELLOW}🔐 Database password is required to connect and run migrations.${NC}"
read -s -p "Enter your database password: " DB_PASSWORD
echo ""

# ───────────── Create Backend .env ─────────────
echo -e "\n${GREEN}📝 Creating .env file...${NC}"
cat > .env <<EOL
# Supabase
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
DATABASE_PASSWORD=$DB_PASSWORD

# App
DEBUG=True
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
FRONTEND_URL=http://localhost:3000
EOL

# ───────────── Create Frontend .env.local ─────────────
FRONTEND_ENV_FILE="../localization-management-frontend/.env.local"
echo -e "\n${GREEN}🌐 Creating frontend .env.local file...${NC}"
cat > "$FRONTEND_ENV_FILE" <<EOL
# Supabase
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$ANON_KEY

# Environment
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
EOL

chmod 600 "$FRONTEND_ENV_FILE"
echo -e "${GREEN}✅ Created frontend .env.local file at $FRONTEND_ENV_FILE${NC}"

# ───────────── Export DB credentials for CLI ─────────────
export SUPABASE_DB_PASSWORD="$DB_PASSWORD"

# ───────────── Link Supabase Project ─────────────
echo -e "${GREEN}🔗 Linking to Supabase project...${NC}"
supabase link \
  --project-ref "$PROJECT_REF" \
  --password "$DB_PASSWORD"

echo -e "${GREEN}✅ Successfully linked to Supabase project!${NC}"

# ───────────── Apply Migrations ─────────────
echo -e "\n${GREEN}🔄 Applying database migrations...${NC}"
supabase db push \
  --password "$DB_PASSWORD"
echo -e "${GREEN}✅ Database migrations applied successfully!${NC}"

# ───────────── Seed Prod & Test Data ─────────────
echo -e "\n${GREEN}🌱 Seeding data...${NC}"
if python -m scripts.seed_prod_data; then
    echo -e "${GREEN}✅ Data seeded successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to seed test data. Try manually: python -m scripts.seed_prod_data${NC}"
fi

# ───────────── Done ─────────────
echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\nNext steps:"
echo -e "1. Start the development server with:\n"
echo -e "   uvicorn src.localization_management_api.main:app --reload\n"
echo -e "API available at: ${GREEN}http://localhost:8000${NC}"
echo -e "Docs: ${GREEN}https://github.com/nlhogsten/Helium-Full-Stack/blob/main/README.md${NC}"