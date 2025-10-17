# Network Configuration for Loqey Mobile App

## Problem Solved: Network Request Failed & 422 Unprocessable Entity

### Issue 1: Network Request Failed
**Cause**: Mobile devices/emulators cannot connect to `localhost` - they need the computer's local IP address.

**Solution**: 
1. Updated `.env` file to use local IP address instead of localhost
2. Started FastAPI backend with `--host 0.0.0.0` to listen on all network interfaces

### Issue 2: 422 Unprocessable Entity on Registration
**Cause**: Backend password validation requirements didn't match frontend validation.

**Backend Requirements** (from `app/schemas/user.py`):
- Password: minimum 8 characters
- Must contain at least 1 digit
- Must contain at least 1 uppercase letter
- All user fields required (first_name, last_name, resident_state, zip_code)

**Solution**: Updated signup screen validation to match backend requirements.

---

## Configuration

### Mobile App (.env)
```env
# Use your local IP address instead of localhost
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.103:8000/api/v1
EXPO_PUBLIC_WS_BASE_URL=ws://192.168.0.103:8000/ws
EXPO_PUBLIC_ENVIRONMENT=development
```

### Backend (.env)
```env
# CORS Configuration - Added local IP and Expo origins
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8081","http://localhost:19000","http://192.168.0.103:8000","http://192.168.0.103:8081","http://192.168.0.103:19000","exp://192.168.0.103:8081"]
ALLOWED_HOSTS=["localhost","127.0.0.1","192.168.0.103","api.loqey.com"]
```

---

## How to Start Backend for Mobile Access

### Option 1: Using Virtual Environment (Recommended)
```bash
cd fastapibackend
source loqeyfastapivenv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Direct Command
```bash
cd fastapibackend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Important**: The `--host 0.0.0.0` flag makes the server accessible from other devices on the network.

---

## Testing Signup Flow

### Valid Signup Data
```json
{
  "email": "test@example.com",
  "password": "Password123",  // 8+ chars, 1 uppercase, 1 digit
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "5551234567",  // Optional
  "resident_state": "California",
  "zip_code": "90210"
}
```

### Password Requirements
✅ Minimum 8 characters
✅ At least 1 uppercase letter (A-Z)
✅ At least 1 digit (0-9)

### Common Password Validation Errors
- ❌ "password123" - No uppercase letter
- ❌ "PASSWORD123" - No lowercase letter (if backend adds this)
- ❌ "Password" - Less than 8 characters, no digit
- ✅ "Password1" - Valid!
- ✅ "MyPass123" - Valid!

---

## Troubleshooting

### Cannot connect to backend
1. Check your local IP address:
   ```bash
   hostname -I | awk '{print $1}'
   ```

2. Update `.env` file in `loqeymobile/` with your IP:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8000/api/v1
   ```

3. Restart Expo development server:
   ```bash
   # Stop current server (Ctrl+C)
   npx expo start --clear
   ```

### 422 Unprocessable Entity
- Check password meets requirements (8+ chars, 1 uppercase, 1 digit)
- Verify all required fields are filled
- Check backend logs for specific validation errors

### CORS Errors
1. Verify CORS origins in backend `.env` include your IP
2. Restart FastAPI backend after updating `.env`
3. Check backend logs for CORS-related errors

### Check Backend is Running
```bash
# From another terminal
curl http://192.168.0.103:8000/api/v1/auth/register
# Should return: {"detail":"Method Not Allowed"} - this is expected for GET
```

---

## Network Architecture

```
Mobile Device/Emulator (192.168.0.105)
         ↓ HTTP Request
         ↓
    WiFi Router
         ↓
Development Computer (192.168.0.103)
         ↓
   FastAPI Backend (0.0.0.0:8000)
         ↓
   PostgreSQL (Neon Cloud)
   MQTT Broker (byte-iot.net)
   Redis (localhost:6379)
```

---

## Testing Checklist

- [x] Backend running with `--host 0.0.0.0`
- [x] `.env` updated with correct IP address
- [x] CORS configured for local IP
- [x] Password validation matches backend requirements
- [ ] Test signup with valid password (e.g., "Password123")
- [ ] Test signin after successful signup
- [ ] Test device assignment
- [ ] Test access link creation

---

## Security Notes

⚠️ **Development Only**: Using IP addresses and `0.0.0.0` is for development only.

For production:
- Use HTTPS with proper domain names
- Implement rate limiting
- Use environment-specific configurations
- Enable proper CORS restrictions
- Use secure WebSocket (WSS) connections
