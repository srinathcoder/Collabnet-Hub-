import requests

try:
    with open('main.py', 'rb') as f:
        # Just to test if it rejects properly
        resp = requests.post('http://localhost:8002/verify', files={'certificate': ('main.py', f, 'text/plain')})
        print(resp.status_code)
        print(resp.text)
except Exception as e:
    print(e)
