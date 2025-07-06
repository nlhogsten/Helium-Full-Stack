import pytest
import os
from dotenv import load_dotenv
from supabase import create_client
from fastapi.testclient import TestClient

# Load environment variables
load_dotenv()

@pytest.fixture(scope="session")
def supabase_client():
    """Create a Supabase client with service role key for testing."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file for testing"
        )
    
    client = create_client(url, key)
    return client

@pytest.fixture
def client(supabase_client):
    """Create a FastAPI test client with overridden dependencies."""
    from src.localization_management_api.main import app
    from src.localization_management_api.deps import get_supabase

    # Override the get_supabase dependency
    def get_supabase_override():
        return supabase_client

    app.dependency_overrides[get_supabase] = get_supabase_override

    with TestClient(app) as test_client:
        yield test_client

    # Clean up after the test
    app.dependency_overrides.clear()