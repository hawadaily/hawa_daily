import urllib.request
url = 'http://localhost:3001/api/jobs'
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read().decode()
        print('STATUS', r.status)
        print(data[:2000])
except Exception as e:
    print('ERROR', repr(e))
