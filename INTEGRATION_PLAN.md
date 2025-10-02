# Loqey Mobile - Backend Integration Plan

## Current Status
✅ Mobile app structure transferred from loqeymobileapp to loqeymobile  
✅ Expo SDK 54 setup complete  
✅ All screens, components, hooks copied  
✅ FastAPI backend running at http://127.0.0.1:8000  
✅ Admin dashboard connected to backend  

## Backend API Endpoints Available

### Auth Endpoints (`/api/v1/auth`)
- POST `/register` - Register new user
- POST `/login` - Login (returns access_token)
- GET `/me` - Get current user profile
- POST `/logout` - Logout user

### Device Endpoints (`/api/v1/devices`)
- GET `/` - Get all user devices
- GET `/{device_id}` - Get device details
- POST `/assign` - Assign device with serial + PIN
- POST `/{device_id}/unlock` - Unlock device via MQTT
- PUT `/{device_id}` - Update device settings
- DELETE `/{device_id}/unlink` - Unlink device

### Access Links Endpoints (`/api/v1/links`)
- POST `/` - Create access link
- GET `/` - Get all links (with optional device_id filter)
- GET `/{link_id}` - Get specific link
- DELETE `/{link_id}` - Delete link
- POST `/{link_id}/revoke` - Revoke link

### Delivery Endpoints (`/api/v1/delivery`)
- GET `/{link_token}` - Validate delivery link
- POST `/{link_token}/unlock` - Unlock via delivery link

### WebSocket Endpoints
- WS `/ws/devices/{device_id}` - Real-time device updates
- WS `/ws/user/devices` - User's all devices updates
- WS `/ws/admin/system` - Admin system updates

## Integration Tasks

### 1. API Client Updates ✅
- [x] Auth API - Already correct
- [x] Devices API - Already correct
- [ ] Links API - Needs updating to match `/api/v1/links` endpoints
- [ ] Add Activities API for device history

### 2. Zustand Store Implementation
Create `/store/index.ts` with:
- Auth state (user, token, isAuthenticated)
- Devices state (devices[], selectedDevice)
- Links state (accessLinks[])
- UI state (loading, errors, notifications)
- Actions for all API calls

### 3. Screen Updates (Replace Mock Data)
- [ ] **index.tsx** - Dashboard with real device stats
- [ ] **Add Device Screen** - Serial + PIN input → POST /devices/assign
- [ ] **links.tsx** - Create/manage links → POST /links, GET /links
- [ ] **deliveries.tsx** - Show delivery history from backend
- [ ] **events.tsx** - Device activities from backend
- [ ] **profile.tsx** - Real user data from /auth/me
- [ ] **settings.tsx** - Update user profile

### 4. WebSocket Integration
Update `/hooks/useWebSocket.ts`:
- Connect to `ws://127.0.0.1:8000/ws/devices/{device_id}`
- Handle authentication with JWT token
- Update Zustand store on device status changes
- Auto-reconnect on connection loss

### 5. New Screens to Create
- [ ] Device Assignment Screen (Serial + PIN input)
- [ ] Device Detail Screen (Status, unlock, activities)
- [ ] Create Link Screen (expiration, max uses)
- [ ] Link Detail Screen (QR code, share, revoke)

### 6. Environment Configuration
Update `.env`:
```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
EXPO_PUBLIC_WS_BASE_URL=ws://127.0.0.1:8000
EXPO_PUBLIC_ENVIRONMENT=development
```

## Backend Schema Reference

### User
```typescript
{
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  resident_state: string;
  zip_code: string;
  is_admin?: boolean;
}
```

### Device
```typescript
{
  id: string;
  serial_number: string;
  name: string;
  model: string;
  status: 'available' | 'assigned' | 'active' | 'maintenance' | 'decommissioned';
  lock_status: 'locked' | 'unlocked' | 'unknown';
  battery_level: number;
  is_online: boolean;
  mqtt_topic_prefix: string;
  location_address?: string;
  last_heartbeat?: string;
  firmware_version?: string;
}
```

### AccessLink
```typescript
{
  id: string;
  link_token: string;
  device_id: string;
  user_id: string;
  name?: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  status: 'active' | 'expired' | 'used' | 'revoked';
  created_at: string;
}
```

### DeviceActivity
```typescript
{
  id: string;
  device_id: string;
  user_id?: string;
  activity_type: string;
  description: string;
  timestamp: string;
  activity_metadata?: object;
}
```

## Next Steps
1. Update links API to match backend
2. Implement comprehensive Zustand store
3. Create device assignment flow
4. Update all screens with real API calls
5. Implement WebSocket real-time updates
6. Add error handling and loading states
7. Test end-to-end flow
