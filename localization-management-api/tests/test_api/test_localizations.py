import pytest
from fastapi import status
import uuid

def test_get_translation_keys(client, supabase_client):
    """Test getting all translation keys with their translations."""
    response = client.get("/localizations/")
    assert response.status_code == status.HTTP_200_OK

def test_update_translation(client, supabase_client):
    """Test updating a translation."""
    # Get an existing translation to update
    translations = supabase_client.table("translations")\
        .select("*")\
        .limit(1)\
        .execute()
    
    if not translations.data:
        pytest.skip("No translations found in the test database")
    
    translation = translations.data[0]
    key_id = translation['key_id']
    lang = translation['language_code']
    original_value = translation['value']
    new_value = f"Updated {original_value} - {uuid.uuid4().hex[:8]}"
    
    try:
        # Update the translation
        response = client.patch(
            f"/localizations/{key_id}",
            params={"lang": lang, "value": new_value}
        )
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify the update by updating back to original value
        restore_response = client.patch(
            f"/localizations/{key_id}",
            params={"lang": lang, "value": original_value}
        )
        assert restore_response.status_code == status.HTTP_200_OK
        
    except Exception as e:
        # Ensure we restore the original value even if test fails
        client.patch(
            f"/localizations/{key_id}",
            params={"lang": lang, "value": original_value}
        )
        raise

def test_update_nonexistent_key(client):
    """Test updating a translation for a non-existent key."""
    response = client.patch(
        f"/localizations/{uuid.uuid4()}",
        params={"lang": "en", "value": "test"}
    )
    assert response.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_500_INTERNAL_SERVER_ERROR)

def test_update_invalid_language(client, supabase_client):
    """Test updating a translation with an invalid language."""
    # Get an existing translation
    translations = supabase_client.table("translations")\
        .select("*")\
        .limit(1)\
        .execute()
    
    if not translations.data:
        pytest.skip("No translations found in the test database")
    
    translation = translations.data[0]
    key_id = translation['key_id']
    
    response = client.patch(
        f"/localizations/{key_id}",
        params={"lang": "xx", "value": "test"}
    )
    assert response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR)

def test_update_missing_parameters(client, supabase_client):
    """Test updating a translation with missing parameters."""
        # Get an existing translation
    translations = supabase_client.table("translations")\
        .select("*")\
        .limit(1)\
        .execute()
    
    if not translations.data:
        pytest.skip("No translations found in the test database")
    
    translation = translations.data[0]
    key_id = translation['key_id']
    
    # Missing lang
    response = client.patch(
        f"/localizations/{key_id}",
        params={"value": "test"}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    # Missing value
    response = client.patch(
        f"/localizations/{key_id}",
        params={"lang": "en"}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_bulk_update_translations(client, supabase_client):
    """Test bulk updating multiple translations."""
    # Get existing translations to update
    translations = supabase_client.table("translations")\
        .select("*")\
        .limit(2)\
        .execute()
    
    if len(translations.data) < 2:
        pytest.skip("Not enough translations found in the test database")
    
    # Prepare updates with original values for restoration
    updates = []
    original_values = []
    
    for translation in translations.data[:2]:
        update = {
            "key_id": str(translation['key_id']), 
            "language_code": translation['language_code'],
            "value": f"Updated {translation['value']} - {uuid.uuid4().hex[:8]}"
        }
        updates.append(update)
        original_values.append({
            "key_id": str(translation['key_id']),
            "language_code": translation['language_code'],
            "value": translation['value']
        })
    
    try:
        # Perform the bulk update
        response = client.patch(
            "/localizations/bulk-update",
            json=updates,
            headers={"Content-Type": "application/json"}
        )
        
        # Print response for debugging if test fails
        if response.status_code != status.HTTP_200_OK:
            print(f"Bulk update failed with status {response.status_code}")
            print(f"Response: {response.text}")
            print(f"Request body: {updates}")
            
        assert response.status_code == status.HTTP_200_OK
        
    finally:
        # Restore original values
        restore_response = client.patch(
            "/localizations/bulk-update",
            json=original_values,
            headers={"Content-Type": "application/json"}
        )
        assert restore_response.status_code == status.HTTP_200_OK

def test_bulk_update_invalid_key(client, supabase_client):
    """Test bulk update with an invalid key."""
    # Get an existing translation to get a valid language code
    translations = supabase_client.table("translations")\
        .select("*")\
        .limit(1)\
        .execute()
    
    if not translations.data:
        pytest.skip("No translations found in the test database")
    
    # Prepare update with invalid key
    invalid_updates = [{
        "key_id": str(uuid.uuid4()),  # Random non-existent key
        "language_code": translations.data[0]['language_code'],
        "value": "test value"
    }]
    
    response = client.patch(
        "/localizations/bulk-update",
        json=invalid_updates,
        headers={"Content-Type": "application/json"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_bulk_update_invalid_language(client, supabase_client):
    """Test bulk update with an invalid language."""
    # Get an existing translation to get a valid key_id
    translations = supabase_client.table("translations")\
        .select("*")\
        .limit(1)\
        .execute()
    
    if not translations.data:
        pytest.skip("No translations found in the test database")
    
    # Prepare update with invalid language
    invalid_updates = [{
        "key_id": str(translations.data[0]['key_id']),
        "language_code": "xx",  # Invalid language code
        "value": "test value"
    }]
    
    response = client.patch(
        "/localizations/bulk-update",
        json=invalid_updates,
        headers={"Content-Type": "application/json"}
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_bulk_update_missing_fields(client):
    """Test bulk update with missing required fields."""
    # Test missing key_id
    response = client.patch(
        "/api/localizations/bulk-update",
        json=[{
            "language_code": "en",
            "value": "test"
        }],
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND)
    
    # Test missing language_code
    response = client.patch(
        "/api/localizations/bulk-update",
        json=[{
            "key_id": str(uuid.uuid4()),
            "value": "test"
        }],
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND)
    
    # Test missing value
    response = client.patch(
        "/api/localizations/bulk-update",
        json=[{
            "key_id": str(uuid.uuid4()),
            "language_code": "en"
        }],
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND)

def test_bulk_update_empty_request(client):
    """Test bulk update with an empty request body."""
    response = client.patch(
        "/localizations/bulk-update",
        json=[],
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST