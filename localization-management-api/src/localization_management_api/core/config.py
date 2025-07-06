import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        # Required keys
        self.SUPABASE_URL              = self._get_required_env("SUPABASE_URL")
        self.SUPABASE_ANON_KEY         = self._get_required_env("SUPABASE_ANON_KEY")
        self.SUPABASE_SERVICE_ROLE_KEY = self._get_required_env("SUPABASE_SERVICE_ROLE_KEY")
        self.FRONTEND_URL              = self._get_required_env("FRONTEND_URL")
        self.ENV                       = self._get_optional_env("ENV", default="development")

    def _get_required_env(self, var_name: str) -> str:
        val = os.getenv(var_name)
        if val is None:
            raise ValueError(f"Required environment variable {var_name} is not set")
        return val

    def _get_optional_env(self, var_name: str, default: str = "") -> str:
        return os.getenv(var_name, default)

    @property
    def is_production(self) -> bool:
        return self.ENV.lower() == "production"

    @property
    def root_path(self) -> str:
        # FastAPI root_path for production only
        return "/api" if self.is_production else ""

settings = Settings()
