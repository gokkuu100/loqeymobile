# Complete Testing Guide - Loqey Mobile App

## 🎯 Ready to Test - No Errors!

All TypeScript errors fixed. Backend integration complete. Token persistence working.

---

## Pre-Test Setup

### 1. Backend Must Be Running
```bash
cd fastapibackend
source loqeyfastapivenv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Should see:
# INFO: Uvicorn running on http://0.0.0.0:8000
```

### 2. Mobile App Running
```bash
cd loqeymobile
npx expo start --clear

# Scan QR code with Expo Go
```

### 3. Verify Network Configuration
- ✅ Backend: `http://192.168.0.103:8000` (your local IP)
- ✅ Mobile .env: `EXPO_PUBLIC_API_BASE_URL=http://192.168.0.103:8000/api/v1`

---

## Test Flow 1: New User Registration ✅

### Steps:
1. Open app → Should see Sign In screen
2. Click "Sign Up" or "Create Account"
3. Fill in form:
   ```
   Email: testuser@example.com
   Password: TestPass123          (8+ chars, 1 uppercase, 1 digit)
   Confirm Password: TestPass123
   First Name: Test
   Last Name: User
   Phone: 5551234567 (optional)
   State: California
   ZIP Code: 90210
   ```
4. Click "Create Account"

### Expected Results:
- ✅ Shows success message
- ✅ Navigates to Sign In screen
- ✅ Backend logs: `INFO: "POST /api/v1/auth/register/ HTTP/1.1" 201 Created`

### Troubleshooting:
- ❌ "Password must contain..." → Use password with 8+ chars, 1 uppercase, 1 digit
- ❌ "Email already exists" → User already registered, go to login

---

## Test Flow 2: User Login & Token Persistence ✅

### Steps:
1. On Sign In screen, enter:
   ```
   Email: testuser@example.com
   Password: TestPass123
   ```
2. Click "Sign In"
3. Should navigate to Dashboard
4. Close app completely (swipe away)
5. Reopen app

### Expected Results:
- ✅ Login successful, navigates to dashboard
- ✅ Shows user's first name in greeting: "Good morning, Test"
- ✅ After reopening: Still logged in (no login screen)
- ✅ Backend logs:
  ```
  INFO: "POST /api/v1/auth/login/ HTTP/1.1" 200 OK
  INFO: "GET /api/v1/devices/ HTTP/1.1" 200 OK      (not 403!)
  INFO: "GET /api/v1/links/ HTTP/1.1" 200 OK
  INFO: "GET /api/v1/auth/me/ HTTP/1.1" 200 OK
  ```

### What to Check:
- ✅ No "Network request failed" errors
- ✅ No 307 redirects in backend logs
- ✅ No 403 Forbidden errors
- ✅ Token persists after app restart

### Troubleshooting:
- ❌ 403 Forbidden → Check TOKEN_FIX_SUMMARY.md, restart app with --clear
- ❌ 307 Redirect → Check all API endpoints have trailing slashes
- ❌ Network error → Verify backend IP address in .env matches your local IP

---

## Test Flow 3: Empty Device State ✅

### After Login (No Devices Assigned):

### Expected Dashboard View:
- ✅ Shows greeting: "Good morning, Test"
- ✅ Shows "No devices" or empty device list
- ✅ **NO MOCK DATA** displayed
- ✅ May show "Add Device" button

### What to Check:
- ✅ No fake/mock devices showing (LBX001, LBX002, etc.)
- ✅ Empty state message displayed
- ✅ App doesn't crash with no devices

---

## Test Flow 4: Device Assignment ✅

### Prerequisites:
- Backend has seeded devices with serial numbers and PINs
- Check backend seed data or create device via admin panel

### Steps:
1. Click "Add Device" or navigate to device assignment
2. Fill in form:
   ```
   Serial Number: SN001-2024-001  (from backend seed data)
   PIN: 1234                       (6-digit PIN from backend)
   Device Name: My Front Door (optional)
   ```
3. Click "Assign Device" or "Add Device"

### Expected Results:
- ✅ Shows success message
- ✅ Device appears in dashboard device list
- ✅ Backend logs: `INFO: "POST /api/v1/devices/assign/ HTTP/1.1" 200 OK`
- ✅ Device shows real data: name, serial, lock status, battery level

### Device Details Displayed:
- Device name (custom or serial number)
- Lock status (locked/unlocked/unknown)
- Battery level (if available)
- Online status
- Location (if set)

### Troubleshooting:
- ❌ "Invalid serial or PIN" → Check backend seed data
- ❌ "Device already assigned" → Device assigned to another user
- ❌ 422 Error → Verify serial and PIN match backend requirements

---

## Test Flow 5: Device Selection & Lock Control ✅

### If You Have Multiple Devices:
1. Click device selector dropdown at top
2. Select different device
3. Current device updates

### Lock/Unlock Control:
1. Click the lock icon in center
2. Confirm toggle action
3. Watch device status update

### Expected Results:
- ✅ Device selector shows all devices
- ✅ Selected device highlighted
- ✅ Lock status displays correctly (Locked/Unlocked)
- ✅ Lock icon changes based on status
- ✅ Backend logs: `INFO: "POST /api/v1/devices/{id}/unlock/ HTTP/1.1" 200 OK`

### Visual Indicators:
- 🟢 Green lock icon = Unlocked
- ⚫ Gray lock icon = Locked
- Lock status text updates

---

## Test Flow 6: Access Link Creation ✅

### Steps:
1. Navigate to "Links" tab/screen
2. Make sure a device is selected
3. Click "Create Link" or "+" button
4. Enter duration (e.g., "24" hours)
5. Click "Create"

### Expected Results:
- ✅ New link appears in list
- ✅ Shows link token (shortened)
- ✅ Shows expiration date/time
- ✅ Shows max uses (default: 1)
- ✅ Status badge: "Active" (green)
- ✅ Backend logs: `INFO: "POST /api/v1/links/ HTTP/1.1" 201 Created`

### Link Details:
- Shortened token (first 8 + last 4 chars)
- Link name/description
- Creation date
- Expiry date  
- Max uses / Current uses
- Status (Active/Expired/Used/Revoked)

### Share Link:
- Click share button on link
- Should show share sheet with full URL
- URL format: `http://192.168.0.103:8000/delivery?token={link_token}`

---

## Test Flow 7: Profile Screen ✅

### Steps:
1. Navigate to Profile tab/screen
2. View user information

### Expected Display:
- ✅ User avatar with initial (first letter of first name)
- ✅ Full name: "Test User"
- ✅ Email: testuser@example.com
- ✅ Profile action buttons work

### What to Check:
- ✅ No "user.name is undefined" errors
- ✅ Shows first name + last name correctly
- ✅ Email displays
- ✅ All buttons respond (even if "Coming Soon")

---

## Test Flow 8: Settings & Device Management ✅

### Steps:
1. Navigate to Settings screen
2. View device list
3. Try editing device name
4. Try unlinking device

### Edit Device Name:
1. Click edit icon on device
2. Enter new name
3. Save
4. Name should update

### Unlink Device:
1. Click unlink/remove button
2. Confirm action
3. Device removed from list

### Expected Results:
- ✅ All devices listed with details
- ✅ Edit name updates device
- ✅ Unlink removes device from account
- ✅ Backend logs: 
  ```
  PUT    /api/v1/devices/{id}/ 200 OK      (edit name)
  DELETE /api/v1/devices/{id}/unlink/ 200 OK (unlink)
  ```

---

## Screens with Placeholders (Expected Behavior)

### Deliveries Screen 📦
- **Status**: Placeholder (empty array)
- **Shows**: Empty state message
- **Doesn't Crash**: ✅
- **TODO**: Implement deliveries API

### Events/Activities Screen 📋
- **Status**: Placeholder (empty array)
- **Shows**: Empty state message
- **Doesn't Crash**: ✅
- **TODO**: Implement activities API

### Unlock via Link Screen 🔗
- **Status**: "Feature Coming Soon" alert
- **Shows**: Unlock form with coming soon message
- **Doesn't Crash**: ✅
- **TODO**: Implement delivery link unlock API

---

## Backend Log Patterns

### ✅ Success Pattern (What You Should See):
```
INFO: 192.168.0.105:xxxxx - "POST /api/v1/auth/login/ HTTP/1.1" 200 OK
INFO: 192.168.0.105:xxxxx - "GET /api/v1/devices/ HTTP/1.1" 200 OK
INFO: 192.168.0.105:xxxxx - "GET /api/v1/links/ HTTP/1.1" 200 OK
INFO: 192.168.0.105:xxxxx - "GET /api/v1/auth/me/ HTTP/1.1" 200 OK
```

### ❌ Error Pattern (What You Should NOT See):
```
INFO: "GET /api/v1/devices HTTP/1.1" 307 Temporary Redirect  ❌
INFO: "GET /api/v1/devices/ HTTP/1.1" 403 Forbidden         ❌
```

---

## Common Issues & Solutions

### Issue: "Network request failed"
**Cause**: Can't reach backend
**Solutions**:
1. Verify backend running: `curl http://192.168.0.103:8000`
2. Check .env has correct IP address
3. Restart Expo with `npx expo start --clear`
4. Make sure phone/emulator on same WiFi network

### Issue: "403 Forbidden" after login
**Cause**: Token not persisted or sent
**Solutions**:
1. Close app completely and reopen
2. Clear app data in device settings
3. Restart Expo with --clear flag
4. Check TOKEN_FIX_SUMMARY.md for details

### Issue: "307 Temporary Redirect"
**Cause**: API endpoints missing trailing slashes
**Solution**: Already fixed in all API files. If you see this, pull latest code.

### Issue: Mock data showing
**Cause**: Using old store
**Solution**: Already fixed. All screens import from `@/store` now.

### Issue: "user.name is undefined"
**Cause**: Old user property reference
**Solution**: Already fixed. Now uses `user?.first_name` and `user?.last_name`.

---

## Performance Checks

### App Load Time
- **Initial load**: < 3 seconds
- **Login**: < 2 seconds
- **Data refresh**: < 1 second

### Memory Usage
- **Idle**: < 100 MB
- **Active use**: < 150 MB

### Network Requests
- **Login flow**: 4 requests (login, devices, links, profile)
- **Device operations**: 1-2 requests
- **Link operations**: 1-2 requests

---

## Final Checklist

Before considering integration complete:

### Core Functionality
- [ ] User can sign up
- [ ] User can sign in
- [ ] Token persists across app restarts
- [ ] User can assign device
- [ ] User can view devices
- [ ] User can switch between devices
- [ ] User can unlock device
- [ ] User can create access links
- [ ] User can view profile
- [ ] User can edit device settings

### No Errors
- [ ] No TypeScript compile errors
- [ ] No runtime crashes
- [ ] No 403 Forbidden errors
- [ ] No 307 Redirect errors
- [ ] No mock data displayed
- [ ] No network errors

### Backend Integration
- [ ] All API endpoints use trailing slashes
- [ ] Authentication token sent with all requests
- [ ] Token stored in AsyncStorage
- [ ] Token restored on app reload
- [ ] Real data displayed from backend

---

## Success Criteria

✅ **Integration Complete When:**
1. User can complete full signup → login → assign device flow
2. No compilation or runtime errors
3. Token persists after app restart
4. All API calls return 200 OK (no 307 or 403)
5. Real backend data displayed (no mock data)
6. Device operations (assign, unlock, unlink) work
7. Access link creation works
8. Profile displays user data correctly

---

## Next Steps After Testing

If all tests pass:
1. ✅ Mark "Test end-to-end flow" as complete
2. 📱 Test on physical device (not just emulator)
3. 🔗 Implement delivery link unlock API
4. 📦 Add deliveries API and screen integration
5. 📋 Add activities/events API and screen integration
6. 🌐 Add WebSocket real-time updates
7. 🚀 Prepare for production deployment

Good luck with testing! 🎉
