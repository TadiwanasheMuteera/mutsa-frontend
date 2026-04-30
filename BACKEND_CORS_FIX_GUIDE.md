# Backend CORS Fix Guide

## Problem
Frontend on `localhost:3000` cannot connect to backend on `172.16.10.71:5000`
- Error: CORS policy blocks request
- Reason: Backend missing `Access-Control-Allow-Origin` headers

## Solution: Add CORS to Flask Backend

---

## Step 1: Install Flask-CORS

```bash
pip install flask-cors
```

Verify installation:
```bash
pip list | grep flask-cors
# Should output: Flask-CORS x.x.x
```

---

## Step 2: Update Your Flask App

Find your main Flask file (usually `app.py`, `main.py`, or similar).

### Option A: Simple CORS (Development)

Add these lines **at the top** after `from flask import Flask`:

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# ✅ Enable CORS for all routes
CORS(app,
     origins=["*"],  # Allow all origins (development only)
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# ... rest of your Flask app code ...
```

### Option B: Specific Origins (Production Safe)

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# ✅ Allow specific frontends
CORS(app,
     origins=[
         "http://localhost:3000",
         "http://localhost:5173",
         "http://127.0.0.1:3000",
         "http://127.0.0.1:5173",
     ],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# ... rest of your Flask app code ...
```

### Option C: API Routes Only (Recommended)

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# ✅ CORS for /api/* routes only
CORS(app,
     resources={
         r"/api/*": {
             "origins": [
                 "http://localhost:3000",
                 "http://localhost:5173",
                 "http://127.0.0.1:3000",
                 "http://127.0.0.1:5173",
             ],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
             "max_age": 3600
         }
     }
)

# ... rest of your Flask app code ...
```

---

## Step 3: Full Example Flask App

Here's what your `app.py` should look like:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# ✅ Enable CORS
CORS(app,
     origins=[
         "http://localhost:3000",
         "http://localhost:5173",
         "http://127.0.0.1:3000",
         "http://127.0.0.1:5173",
     ],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# ============================================================================
# Auth Routes
# ============================================================================

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    
    # Validate input
    if not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'message': 'Email and password required'
        }), 400
    
    # Your authentication logic here
    # Example:
    if data['email'] == 'admin@example.com' and data['password'] == 'password':
        return jsonify({
            'success': True,
            'data': {
                'access_token': 'token_abc123',
                'refresh_token': 'refresh_abc123',
                'user': {
                    'id': 'user_123',
                    'email': data['email'],
                    'full_name': 'Admin User',
                    'role': 'admin',
                    'is_active': True
                }
            },
            'message': 'Login successful'
        }), 200
    
    return jsonify({
        'success': False,
        'message': 'Invalid credentials'
    }), 401


@app.route('/api/auth/me', methods=['GET', 'OPTIONS'])
def get_current_user():
    if request.method == 'OPTIONS':
        return '', 200
    
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({
            'success': False,
            'message': 'No token provided'
        }), 401
    
    # Your token validation logic here
    return jsonify({
        'success': True,
        'data': {
            'id': 'user_123',
            'email': 'admin@example.com',
            'full_name': 'Admin User',
            'role': 'admin',
            'is_active': True
        },
        'message': 'User retrieved'
    }), 200


# ============================================================================
# Cases Routes
# ============================================================================

@app.route('/api/cases', methods=['GET', 'POST', 'OPTIONS'])
def cases():
    if request.method == 'OPTIONS':
        return '', 200
    
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'data': {
                'cases': [],
                'total': 0,
                'page': 1,
                'per_page': 10
            },
            'message': 'Cases retrieved'
        }), 200
    
    if request.method == 'POST':
        data = request.get_json()
        return jsonify({
            'success': True,
            'data': {
                'case': {
                    'id': 'case_123',
                    'case_number': data.get('case_number'),
                    'title': data.get('title'),
                    'fraud_type': data.get('fraud_type'),
                    'status': 'open',
                    'created_at': datetime.now().isoformat()
                }
            },
            'message': 'Case created'
        }), 201


# ============================================================================
# Error Handling
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # ✅ Run on all interfaces so frontend can access
    app.run(
        host='0.0.0.0',        # Listen on all interfaces
        port=5000,             # Port 5000
        debug=True,            # Debug mode (development only)
        use_reloader=True
    )
```

---

## Step 4: Restart Flask Backend

```bash
# Stop current Flask (Ctrl+C)

# Restart with:
python app.py
# or
flask run
```

You should see:
```
 * Running on http://0.0.0.0:5000
 * WARNING: This is a development server. Do not use it in production deployment.
```

---

## Step 5: Verify CORS is Working

### Test with curl:

```bash
# Test preflight (OPTIONS)
curl -X OPTIONS http://172.16.10.71:5000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# You should see:
# < HTTP/1.1 200 OK
# < Access-Control-Allow-Origin: http://localhost:3000
# < Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Test with frontend:

Try logging in from `http://localhost:3000`

You should see:
- ✅ Network tab shows OPTIONS → 200
- ✅ Network tab shows POST → 200
- ✅ No CORS error
- ✅ Login succeeds

---

## Step 6: Try Frontend Login

1. Open frontend: `http://localhost:3000`
2. Try login with credentials
3. Should work! ✅

---

## Troubleshooting

### Still getting CORS error?

1. **Clear browser cache**: Ctrl+Shift+Del
2. **Restart Flask**: Stop and restart Flask backend
3. **Restart frontend**: Stop and restart dev server
4. **Check origins**: Ensure `http://localhost:3000` is in CORS list

### Flask not reloading changes?

Add to Flask app:
```python
app.config['ENV'] = 'development'
app.config['DEBUG'] = True
```

### Getting 404 errors?

Ensure routes are:
- ✅ Starting with `/api/`
- ✅ Using correct HTTP methods (GET, POST, etc)
- ✅ Returning JSON with `jsonify()`

---

## CORS Headers Explained

When you add CORS, Flask sends these headers:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
Access-Control-Allow-Credentials: true
```

This tells browser:
- ✅ Allow requests from `localhost:3000`
- ✅ Allow these HTTP methods
- ✅ Allow these headers
- ✅ Cache preflight for 1 hour
- ✅ Include credentials (cookies, auth)

---

## Production Deployment

For production, **never use `"*"`** for origins.

Instead, whitelist specific domains:

```python
CORS(app,
     origins=[
         "https://yourdomain.com",
         "https://app.yourdomain.com",
     ]
)
```

---

## Summary

| Step | Action |
|------|--------|
| 1 | Install: `pip install flask-cors` |
| 2 | Import: `from flask_cors import CORS` |
| 3 | Enable: `CORS(app, origins=[...])` |
| 4 | Restart: `python app.py` |
| 5 | Test: Try login from frontend |
| ✅ | Done! Should work now |

---

## Next Steps

After CORS is fixed:

1. ✅ Frontend can connect to backend
2. ✅ Login will work
3. ✅ All API calls will work
4. ✅ Upload evidence will work
5. ✅ Full app functionality enabled

---

## Files to Edit

**Main Flask file** (usually `app.py`):
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[...])  # ← Add this
```

That's it! Just add 3 lines and restart.

---

## Need Help?

- Verify Flask is running: `http://172.16.10.71:5000/`
- Check Flask console for errors
- Ensure port 5000 is not blocked
- Firewall might be blocking cross-origin (unlikely on local network)

---

**After this fix:**
- ✅ CORS error gone
- ✅ Login works
- ✅ Full frontend-backend integration works
- ✅ All TypeScript API clients work

🎉 **Ready to go!**


