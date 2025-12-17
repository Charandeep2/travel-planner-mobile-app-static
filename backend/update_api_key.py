import os

def update_api_key():
    # Get the new API key from user input
    new_key = input("Enter your new Gemini API key: ").strip()
    
    if not new_key:
        print("Error: No API key provided")
        return
    
    if len(new_key) < 20:
        print("Error: API key seems too short to be valid")
        return
    
    # Read the current .env file
    env_file_path = ".env"
    
    try:
        with open(env_file_path, "r") as f:
            lines = f.readlines()
        
        # Update the GEMINI_API_KEY line
        updated_lines = []
        key_updated = False
        
        for line in lines:
            if line.startswith("GEMINI_API_KEY="):
                updated_lines.append(f"GEMINI_API_KEY={new_key}\n")
                key_updated = True
            else:
                updated_lines.append(line)
        
        # If the key wasn't found, add it
        if not key_updated:
            updated_lines.append(f"GEMINI_API_KEY={new_key}\n")
        
        # Write back to the file
        with open(env_file_path, "w") as f:
            f.writelines(updated_lines)
        
        print("✅ API key updated successfully!")
        print("🔄 Restart the backend server to use the new key")
        
    except FileNotFoundError:
        print(f"Error: {env_file_path} file not found")
    except Exception as e:
        print(f"Error updating API key: {e}")

if __name__ == "__main__":
    update_api_key()