import requests
import os

# Create dummy PDF
with open('dummy_resume.pdf', 'wb') as f:
    f.write(b'%PDF-1.4 dummy content')

url = 'http://127.0.0.1:8001/api/upload-resume/'
files = {'resume': open('dummy_resume.pdf', 'rb')}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 201:
        print("SUCCESS: Resume uploaded successfully!")
    else:
        print("FAILURE: Upload failed.")
except Exception as e:
    print(f"ERROR: {e}")
finally:
    files['resume'].close()
    if os.path.exists('dummy_resume.pdf'):
        os.remove('dummy_resume.pdf')
