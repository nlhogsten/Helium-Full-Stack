import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    def __init__(self):
        # Required environment variables
        self.SUPABASE_URL = self._get_required_env("SUPABASE_URL")
        self.SUPABASE_ANON_KEY = self._get_required_env("SUPABASE_ANON_KEY")
        self.SUPABASE_SERVICE_ROLE_KEY = self._get_required_env("SUPABASE_SERVICE_ROLE_KEY")
        self.FRONTEND_URL = self._get_required_env("FRONTEND_URL")

    def _get_required_env(self, var_name: str) -> str:
        """Get a required environment variable or raise an error if not found."""
        value = os.getenv(var_name)
        if value is None:
            raise ValueError(f"Required environment variable {var_name} is not set")
        return value

    def _get_optional_env(self, var_name: str, default: str = "") -> str:
        """Get an optional environment variable with a default value."""
        return os.getenv(var_name, default)

# Create a singleton instance
settings = Settings()
