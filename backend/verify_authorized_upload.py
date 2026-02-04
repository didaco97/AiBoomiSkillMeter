import requests
import os

# Configuration
BASE_URL = 'http://127.0.0.1:8001/api'
LOGIN_URL = f"{BASE_URL}/auth/login/"
UPLOAD_URL = f"{BASE_URL}/upload-resume/"

# Test Credentials (Ensure this user exists and has a profile)
USERNAME = "testuser"
PASSWORD = "password123" 

# 1. Login to get token
print(f"Logging in as {USERNAME}...")
login_payload = {'username': USERNAME, 'password': PASSWORD}
try:
    login_response = requests.post(LOGIN_URL, json=login_payload)
    if login_response.status_code != 200:
        print(f"Login Failed: {login_response.text}")
        exit(1)
    
    tokens = login_response.json()
    access_token = tokens.get('access')
    print("Login Successful. Token received.")

except Exception as e:
    print(f"Login Error: {e}")
    exit(1)

# 2. Upload Resume with Token
print("Uploading resume...")
with open('auth_test_resume.pdf', 'wb') as f:
    f.write(b'%PDF-1.4 dummy auth content')

headers = {'Authorization': f'Bearer {access_token}'}
files = {'resume': open('auth_test_resume.pdf', 'rb')}

try:
    response = requests.post(UPLOAD_URL, headers=headers, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 201:
        print("SUCCESS: Resume linked to user profile!")
    else:
        print("FAILURE: Upload failed.")

except Exception as e:
    print(f"Upload Error: {e}")

finally:
    files['resume'].close()
    if os.path.exists('auth_test_resume.pdf'):
        os.remove('auth_test_resume.pdf')
