import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not service_role_key:
    raise ValueError("Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(supabase_url, service_role_key)

async def create_test_user(email: str, password: str, name: str):
    """Create a test user with the given email and password"""
    try:
        user = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": name}
        })
        return user.user
    except Exception as e:
        print(f"Error creating user {email}: {str(e)}")
        return None

async def seed_test_data():
    print("Starting to seed test data...")
    
    # Create test users
    test_users = [
        {"email": "user1@example.com", "password": "user1pass123!", "name": "Test User 1"},
        {"email": "user2@example.com", "password": "user2pass123!", "name": "Test User 2"}
    ]
    
    created_users = []
    for user_data in test_users:
        print(f"Creating user: {user_data['email']}")
        user = await create_test_user(
            email=user_data["email"],
            password=user_data["password"],
            name=user_data["name"]
        )
        if user:
            created_users.append(user)
            print(f"✅ Created user: {user_data['email']}")

    if not created_users:
        print("❌ No users were created, aborting seed")
        return

    print("✅ Created test users")

    # Create languages
    languages = [
        {"code": "en", "name": "English", "is_active": True},
        {"code": "jp", "name": "Japanese", "is_active": True},
        {"code": "es", "name": "Spanish", "is_active": True}
    ]
    
    created_languages = []
    for lang in languages:
        result = supabase.table("languages").insert(lang).execute()
        if result.data:
            created_languages.append(result.data[0])
            print(f"✅ Created language: {lang['name']} ({lang['code']})")

    if not created_languages:
        print("❌ No languages were created, aborting seed")
        return

    # Create translation keys
    translation_keys = [
        {"key": "button.submit", "category": "buttons", "description": "Submit button text"},
        {"key": "button.cancel", "category": "buttons", "description": "Cancel button text"},
        {"key": "welcome.message", "category": "greetings", "description": "Welcome message"},
        {"key": "error.required", "category": "errors", "description": "Required field error"},
        {"key": "success.save", "category": "notifications", "description": "Save success message"}
    ]
    
    created_keys = []
    for key_data in translation_keys:
        result = supabase.table("translation_keys").insert(key_data).execute()
        if result.data:
            created_keys.append(result.data[0])
            print(f"✅ Created key: {key_data['key']}")

    if not created_keys:
        print("❌ No translation keys were created, aborting seed")
        return

    # Create translations
    translations = [
        # English translations
        {"key_id": created_keys[0]["id"], "language_code": "en", "value": "Submit", "updated_by": created_users[0].id},
        {"key_id": created_keys[1]["id"], "language_code": "en", "value": "Cancel", "updated_by": created_users[0].id},
        {"key_id": created_keys[2]["id"], "language_code": "en", "value": "Welcome to Helium", "updated_by": created_users[0].id},
        {"key_id": created_keys[3]["id"], "language_code": "en", "value": "This field is required", "updated_by": created_users[0].id},
        {"key_id": created_keys[4]["id"], "language_code": "en", "value": "Changes saved successfully", "updated_by": created_users[0].id},
        
        # Japanese translations
        {"key_id": created_keys[0]["id"], "language_code": "jp", "value": "送信", "updated_by": created_users[1].id},
        {"key_id": created_keys[1]["id"], "language_code": "jp", "value": "キャンセル", "updated_by": created_users[1].id},
        {"key_id": created_keys[2]["id"], "language_code": "jp", "value": "ヘリウムへようこそ", "updated_by": created_users[1].id},
        {"key_id": created_keys[3]["id"], "language_code": "jp", "value": "この項目は必須です", "updated_by": created_users[1].id},
        {"key_id": created_keys[4]["id"], "language_code": "jp", "value": "変更が保存されました", "updated_by": created_users[1].id},
        
        # Spanish translations
        {"key_id": created_keys[0]["id"], "language_code": "es", "value": "Enviar", "updated_by": created_users[0].id},
        {"key_id": created_keys[1]["id"], "language_code": "es", "value": "Cancelar", "updated_by": created_users[0].id},
        {"key_id": created_keys[2]["id"], "language_code": "es", "value": "Bienvenido a Helium", "updated_by": created_users[0].id},
        {"key_id": created_keys[3]["id"], "language_code": "es", "value": "Este campo es obligatorio", "updated_by": created_users[0].id},
        {"key_id": created_keys[4]["id"], "language_code": "es", "value": "Cambios guardados exitosamente", "updated_by": created_users[0].id}
    ]
    
    created_translations = 0
    for translation in translations:
        try:
            result = supabase.table("translations").insert(translation).execute()
            if result.data:
                created_translations += 1
        except Exception as e:
            print(f"Error creating translation: {str(e)}")

    print(f"✅ Created {created_translations} translations")

    print("\n🎉 Seed completed successfully!")
    print(f"Users: {len(created_users)}")
    print(f"Languages: {len(created_languages)}")
    print(f"Translation keys: {len(created_keys)}")
    print(f"Translations: {created_translations}")

if __name__ == "__main__":
    asyncio.run(seed_test_data())
