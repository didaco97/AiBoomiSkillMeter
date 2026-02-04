"""
Comprehensive Integration Test Script
Tests all modified components to ensure no regressions.
"""
import requests
import os
import sys

BASE_URL = 'http://127.0.0.1:8001/api'
test_results = []

def test(name, condition, details=""):
    """Helper to track test results"""
    status = "✓ PASS" if condition else "✗ FAIL"
    test_results.append((name, status, details))
    print(f"{status}: {name}")
    if details:
        print(f"  Details: {details}")

print("=" * 60)
print("COMPREHENSIVE INTEGRATION TEST")
print("=" * 60)

# Test 1: Backend Health Check
try:
    response = requests.get(f"{BASE_URL}/hello/", timeout=5)
    test("Backend Server Running", response.status_code == 200, response.json().get('message', ''))
except Exception as e:
    test("Backend Server Running", False, str(e))

# Test 2: Auth Endpoints
try:
    login_response = requests.post(f"{BASE_URL}/auth/login/", 
                                   json={'username': 'testuser', 'password': 'password123'},
                                   timeout=5)
    has_token = 'access' in login_response.json()
    test("Authentication System", login_response.status_code == 200 and has_token, 
         f"Token received: {has_token}")
    
    if has_token:
        access_token = login_response.json()['access']
        
        # Test 3: Resume Upload with Authentication
        with open('test_resume.pdf', 'wb') as f:
            f.write(b'%PDF-1.4 test content')
        
        headers = {'Authorization': f'Bearer {access_token}'}
        files = {'resume': open('test_resume.pdf', 'rb')}
        
        upload_response = requests.post(f"{BASE_URL}/upload-resume/",
                                       headers=headers,
                                       files=files,
                                       timeout=10)
        files['resume'].close()
        os.remove('test_resume.pdf')
        
        test("Resume Upload (Authenticated)", 
             upload_response.status_code == 201,
             upload_response.json().get('message', ''))
        
        # Test 4: Profile Retrieval
        profile_response = requests.get(f"{BASE_URL}/auth/user/",
                                       headers=headers,
                                       timeout=5)
        test("User Profile Access", 
             profile_response.status_code == 200,
             f"User: {profile_response.json().get('username', 'N/A')}")
        
except Exception as e:
    test("Authentication Flow", False, str(e))

# Test 5: Mentor Endpoints
try:
    mentors_response = requests.get(f"{BASE_URL}/mentors/", timeout=5)
    test("Mentor List Endpoint", 
         mentors_response.status_code == 200,
         f"Count: {len(mentors_response.json()) if mentors_response.status_code == 200 else 0}")
except Exception as e:
    test("Mentor List Endpoint", False, str(e))

# Test 6: Unauthorized Upload Blocked
try:
    with open('unauth_test.pdf', 'wb') as f:
        f.write(b'%PDF-1.4 unauth')
    
    files = {'resume': open('unauth_test.pdf', 'rb')}
    unauth_response = requests.post(f"{BASE_URL}/upload-resume/",
                                   files=files,
                                   timeout=5)
    files['resume'].close()
    os.remove('unauth_test.pdf')
    
    test("Upload Security (Blocks Unauthenticated)", 
         unauth_response.status_code == 401,
         "Correctly rejected unauthorized request")
except Exception as e:
    test("Upload Security Check", False, str(e))

print("\n" + "=" * 60)
print("TEST SUMMARY")
print("=" * 60)
passed = sum(1 for _, status, _ in test_results if "PASS" in status)
failed = sum(1 for _, status, _ in test_results if "FAIL" in status)

print(f"Passed: {passed}/{len(test_results)}")
print(f"Failed: {failed}/{len(test_results)}")

if failed > 0:
    print("\nFailed Tests:")
    for name, status, details in test_results:
        if "FAIL" in status:
            print(f"  - {name}: {details}")

sys.exit(0 if failed == 0 else 1)
