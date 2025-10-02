# 🤖 AI Implementation Prompt: Loqey IoT Delivery Platform

## 📋 CRITICAL INSTRUCTIONS

**READ THIS FIRST**: This prompt must be combined with the `loqeyMvpV1.md` file for complete context. DO NOT proceed without reading both files thoroughly.

**IMPLEMENTATION RULES:**
- ✅ **NO HALLUCINATION**: Only implement what is explicitly specified in the documentation
- ✅ **PRODUCTION READY**: All code must be production-grade with proper error handling
- ✅ **EXACT SPECIFICATIONS**: Follow the API endpoints and data structures as documented in case of sth not documented and is essantial to service, add it to enable functionality work in a section
- ✅ **BEST PRACTICES**: Use industry-standard patterns and conventions with good project structuring and clean
- ✅ **ZERO ASSUMPTIONS**: If something isn't clear, ask for clarification instead of guessing

---

## 🎯 PROJECT OVERVIEW

You are a senior software enginner and You are tasked with building a complete IoT lockbox delivery platform with three integrated applications:

1. **Mobile App** (React Native Expo) - Device owners manage lockboxes and access links, get stats of their box
2. **Backend API** (FastAPI) - Core system with MQTT, database, and business logic  
3. **Admin Dashboard** (Next.js) - Web interface for administrators and system monitoring

**Key Requirements:**
- Devices can only UNLOCK (no lock command)
- Automatic device assignment via serial + PIN input
- Access links for delivery personnel
- Real-time updates via WebSocket and MQTT
- Production-grade architecture with proper error handling

---

## 📱 MOBILE APPLICATION REFINEMENT

### Current State Analysis
**EXAMINE THE EXISTING CODEBASE**: `/loqeymobileapp/` contains a React Native Expo app with:
- Basic authentication screens (`signin.tsx`, `signup.tsx`)
- Navigation setup (`_layout.tsx`)
- Screen components in `/screens/` directory
- UI components in `/components/`
- API structure in `/api/`

### Required Enhancements

#### 1. State Management Integration
```typescript
// IMPLEMENT: Enhanced Zustand store with proper TypeScript
// File: store/useAppStore.ts

interface AppState {
  // Authentication
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  
  // Devices
  devices: Device[];
  selectedDevice: Device | null;
  deviceStatus: Record<string, DeviceStatus>;
  
  // Access Links
  accessLinks: AccessLink[];
  
  // UI State
  isLoading: boolean;
  notifications: Notification[];
  
  // Actions (implement all from MVP documentation)
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  fetchDevices: () => Promise<void>;
  assignDevice: (serial: string, pin: string) => Promise<void>;
  createAccessLink: (deviceId: string, options: LinkOptions) => Promise<void>;
  // ... add all other actions as specified in API documentation
}
```

#### 2. API Integration Layer
```typescript
// REFINE: api/client.ts to match exact MVP API endpoints
// Base URL should be configurable via environment variables
// Implement automatic token refresh
// Add proper error handling for all HTTP status codes
// Follow the exact endpoint structure from MVP documentation

// REQUIRED ENDPOINTS TO IMPLEMENT:
// Authentication: /api/auth/*
// Devices: /api/devices/*  
// Access Links: /api/access/*
// Deliveries: /api/deliveries/*
// WebSocket: /ws/devices/{device_id}
```

#### 3. Real-time Features
```typescript
// IMPLEMENT: WebSocket integration for live device updates
// File: hooks/useWebSocket.ts
// - Connect to device-specific WebSocket endpoints
// - Handle connection/disconnection gracefully
// - Update Zustand store with real-time device status
// - Show connection status in UI
```

#### 4. Push Notifications
```typescript
// IMPLEMENT: Expo Notifications setup
// - Configure for both iOS and Android
// - Handle delivery notifications
// - Device status change alerts
// - Access link expiry warnings
// - Proper permission handling
```

#### 5. Enhanced UI Components
- **Device Cards**: Show real-time status (locked/unlocked)
- **Access Link Management**: Create, edit, delete, share links
- **Delivery History**: Timeline view of recent unlocks
- **Settings Screen**: Account management, notifications preferences
- **Real-time Status Indicators**: Live connection and device status

### Mobile App Structure Requirements
```
loqeyCustomerApp/
├── app/                     # Keep existing navigation
├── components/              # Enhance existing components
│   ├── DeviceCard.tsx      # Real-time device status
│   ├── AccessLinkCard.tsx  # Link management
│   ├── StatusIndicator.tsx # Live status display
│   └── NotificationBanner.tsx
├── store/                   # Enhanced Zustand store
│   ├── useAppStore.ts      # Main application state
│   ├── useDeviceStore.ts   # Device-specific state
│   └── useNotificationStore.ts
├── hooks/                   # Custom hooks
│   ├── useWebSocket.ts     # Real-time connection
│   ├── useNotifications.ts # Push notifications
│   └── useDeviceStatus.ts  # Device state management
├── api/                     # Refined API layer
│   ├── client.ts           # Enhanced HTTP client
│   ├── auth.ts             # Authentication endpoints
│   ├── devices.ts          # Device management
│   ├── access.ts           # Access link management
│   └── websocket.ts        # WebSocket connection
└── types/                   # TypeScript definitions
    ├── api.ts              # API response types
    ├── device.ts           # Device-related types
    └── user.ts             # User-related types
```

---

## 🚀 FASTAPI BACKEND IMPLEMENTATION

### Project Structure (Create New FastAPI Production Application)
```
loqey-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app initialization
│   ├── config.py                  # Environment configuration
│   ├── database.py                # Database connection
│   ├── dependencies.py            # Dependency injection
│   ├── exceptions.py              # Custom exception handlers
│   │
│   ├── api/                       # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── devices.py        # Device management
│   │   │   ├── access.py         # Access link management
│   │   │   ├── deliveries.py     # Delivery history
│   │   │   ├── admin.py          # Admin endpoints
│   │   │   └── delivery.py       # Public delivery endpoints
│   │   └── websockets.py         # WebSocket handlers
│   │
│   ├── core/                      # Business logic
│   │   ├── __init__.py
│   │   ├── auth.py               # Authentication logic
│   │   ├── security.py           # Security utilities
│   │   ├── device_manager.py     # Device operations
│   │   ├── access_manager.py     # Access link operations
│   │   └── notification_service.py
│   │
│   ├── models/                    # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py               # User model
│   │   ├── device.py             # Device model
│   │   ├── access_link.py        # Access link model
│   │   ├── delivery_log.py       # Delivery log model
│   │   └── audit_log.py          # Audit log model
│   │
│   ├── schemas/                   # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py               # User schemas
│   │   ├── device.py             # Device schemas
│   │   ├── access_link.py        # Access link schemas
│   │   ├── delivery.py           # Delivery schemas
│   │   └── common.py             # Common schemas
│   │
│   ├── services/                  # External services
│   │   ├── __init__.py
│   │   ├── mqtt_service.py       # MQTT communication
│   │   ├── email_service.py      # Email notifications
│   │   ├── push_service.py       # Push notifications
│   │   └── websocket_service.py  # WebSocket management
│   │
│   ├── tasks/                     # Celery tasks
│   │   ├── __init__.py
│   │   ├── device_tasks.py       # Device-related background tasks
│   │   ├── notification_tasks.py # Notification tasks
│   │   └── cleanup_tasks.py      # Cleanup and maintenance
│   │
│   └── utils/                     # Utilities
│       ├── __init__.py
│       ├── logger.py             # Logging configuration
│       ├── validators.py         # Custom validators
│       └── helpers.py            # Helper functions
│
├── alembic/                       # Database migrations
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
│
├── tests/                         # Comprehensive tests
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_devices.py
│   ├── test_access_links.py
│   └── test_admin.py
│
├── docker/                        # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── scripts/                       # Utility scripts
│   ├── create_admin.py
│   ├── seed_data.py
│   └── health_check.py
│
├── .env.example                   # Environment template
├── requirements.txt               # Dependencies
├── pyproject.toml                # Project configuration
└── README.md                     # Documentation
```

### Implementation Requirements

#### 1. Database Models (SQLAlchemy)
```python
# IMPLEMENT EXACTLY as specified in loqeyMvpV1.md
# File: app/models/device.py

class Device(Base):
    __tablename__ = "devices"
    
    # EXACT FIELDS from MVP documentation
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    serial_number = Column(String(50), unique=True, nullable=False, index=True)
    pin = Column(String(255), nullable=False)  # Hashed PIN
    # ... implement all fields exactly as documented
    
    # RELATIONSHIPS exactly as specified
    assigned_user = relationship("User", back_populates="devices")
    access_links = relationship("AccessLink", back_populates="device")
    delivery_logs = relationship("DeliveryLog", back_populates="device")
```

#### 2. API Endpoints Implementation
```python
# IMPLEMENT ALL ENDPOINTS from MVP documentation
# Follow exact endpoint paths, request/response schemas

# Example: app/api/v1/devices.py
@router.get("/my-devices", response_model=List[DeviceResponse])
async def get_my_devices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implement exact logic as specified
    pass

@router.post("/assign", response_model=DeviceAssignResponse)  
async def assign_device(
    request: DeviceAssignRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Implement serial + PIN verification and assignment
    pass
```

#### 3. MQTT Service Implementation
```python
# File: app/services/mqtt_service.py
# IMPLEMENT based on working mqtt-backend patterns from MVP

class MQTTService:
    def __init__(self):
        # Use exact broker configuration from MVP
        self.broker_host = settings.MQTT_BROKER_HOST
        self.broker_port = settings.MQTT_BROKER_PORT
        
    async def send_unlock_command(self, device_serial: str, source: str):
        # ONLY unlock command (no lock)
        # Follow exact message format from MVP documentation
        pass
        
    async def handle_device_status(self, message: dict):
        # Handle status updates exactly as specified
        pass
```

#### 4. WebSocket Implementation
```python
# File: app/api/websockets.py
# Real-time device status updates

@router.websocket("/ws/devices/{device_id}")
async def device_websocket(websocket: WebSocket, device_id: str):
    # Implement authentication via query params
    # Send real-time device status updates
    # Handle connection lifecycle properly
    pass
```

#### 5. Celery Background Tasks
```python
# File: app/tasks/device_tasks.py
# Background processing for notifications, cleanup

@celery_app.task
def check_expired_access_links():
    # Implement link expiry checking
    pass

@celery_app.task  
def send_device_notification(user_id: str, message: str):
    # Implement push notifications
    pass
```

---

## 🌐 NEXTJS ADMIN DASHBOARD

### Project Structure (Create New Application)
```
loqey-admin-dashboard/
├── src/
│   ├── app/                       # App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── devices/
│   │   │   ├── users/
│   │   │   ├── analytics/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx             # Root layout
│   │   ├── loading.tsx            # Global loading
│   │   └── page.tsx               # Home page
│   │
│   ├── components/                # Reusable components
│   │   ├── ui/                    # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── modal.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── navigation.tsx
│   │   ├── charts/                # Data visualization
│   │   │   ├── delivery-chart.tsx
│   │   │   └── device-status-chart.tsx
│   │   ├── tables/                # Data tables
│   │   │   ├── device-table.tsx
│   │   │   ├── user-table.tsx
│   │   │   └── audit-log-table.tsx
│   │   └── forms/                 # Form components
│   │       ├── device-registration.tsx
│   │       └── user-management.tsx
│   │
│   ├── lib/                       # Utilities and configuration
│   │   ├── api.ts                 # API client
│   │   ├── auth.ts                # Authentication
│   │   ├── websocket.ts           # WebSocket connection
│   │   ├── utils.ts               # Helper functions
│   │   └── types.ts               # TypeScript definitions
│   │
│   ├── store/                     # State management (Zustand)
│   │   ├── auth-store.ts
│   │   ├── device-store.ts
│   │   ├── user-store.ts
│   │   └── dashboard-store.ts
│   │
│   └── hooks/                     # Custom hooks
│       ├── use-websocket.ts       # Real-time connection
│       ├── use-api.ts             # API operations
│       └── use-auth.ts            # Authentication
│
├── public/                        # Static assets
├── .env.local                     # Environment variables
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS
├── package.json
└── README.md
```

### Implementation Requirements

#### 1. Real-time Dashboard
```typescript
// IMPLEMENT: Real-time system monitoring
// File: src/app/(dashboard)/dashboard/page.tsx

export default function DashboardPage() {
  // Real-time WebSocket connection to /ws/admin/system
  // Display live metrics from MVP documentation:
  // - Total devices, active devices, users
  // - Deliveries today, system health
  // - Live device activity feed
  
  return (
    <div className="dashboard-grid">
      <SystemMetrics />
      <DeviceStatusChart />
      <DeliveryActivity />
      <SystemHealth />
    </div>
  );
}
```

#### 2. Device Fleet Management
```typescript
// File: src/app/(dashboard)/devices/page.tsx
// IMPLEMENT exact admin endpoints from MVP

const DevicesPage = () => {
  // GET /api/admin/devices with filtering
  // POST /api/admin/devices/register
  // PUT /api/admin/devices/{id}/regenerate-pin
  // DELETE /api/admin/devices/{id}/unlink
  
  return (
    <DeviceManagementInterface />
  );
};
```

#### 3. User Management Interface
```typescript
// File: src/app/(dashboard)/users/page.tsx
// User administration with search, filtering, actions

const UsersPage = () => {
  // GET /api/admin/users
  // PUT /api/admin/users/{id}/suspend
  // PUT /api/admin/users/{id}/activate
  
  return (
    <UserManagementInterface />
  );
};
```

#### 4. WebSocket Integration
```typescript
// File: src/hooks/use-websocket.ts
// Real-time updates for admin dashboard

export const useAdminWebSocket = () => {
  // Connect to /ws/admin/system
  // Handle device activity, system alerts
  // Update dashboard state in real-time
  // Manage connection lifecycle
};
```

---

## 🔗 INTEGRATION REQUIREMENTS

### Environment Configuration
```bash
# MOBILE APP (.env)
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
EXPO_PUBLIC_WS_BASE_URL=ws://localhost:8000/ws
EXPO_PUBLIC_ENVIRONMENT=development

# BACKEND (.env)
# Use EXACT configuration from loqeyMvpV1.md
DATABASE_URL=postgresql://user:pass@localhost:5432/loqey_db
MQTT_BROKER_HOST=byte-iot.net
MQTT_BROKER_PORT=1883
# ... all other variables from MVP documentation

# ADMIN DASHBOARD (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000/ws
NEXTAUTH_SECRET=your-secret-key
```

### API Integration Points
1. **Mobile ↔ Backend**: All device and access link operations
2. **Admin ↔ Backend**: Fleet management and system monitoring  
3. **Backend ↔ MQTT**: Device communication 
4. **WebSocket**: Real-time updates for both mobile and admin

### Data Flow Requirements
```
Mobile App → FastAPI → MQTT → Device (unlock command)
Device → MQTT → FastAPI → WebSocket → Admin Dashboard (status update)
Delivery Link → FastAPI → MQTT → Device (public unlock)
```

---

## 🧪 TESTING & VALIDATION

### Required Test Coverage
- **API Tests**: All endpoints with authentication scenarios
- **WebSocket Tests**: Connection handling and message flow
- **MQTT Tests**: Device communication simulation
- **Integration Tests**: End-to-end user workflows
- **Mobile Tests**: Component and navigation testing

### Performance Requirements
- **API Response**: < 200ms for most endpoints
- **WebSocket**: Real-time updates within 1 second
- **Mobile App**: Smooth 60fps performance
- **Admin Dashboard**: Fast data loading and filtering

---

## 🚀 DEPLOYMENT CONFIGURATION

### Docker Setup (Backend)
```dockerfile
# Use exact Docker configuration from loqeyMvpV1.md
# Multi-stage build for production optimization
# Include all required services: FastAPI, Celery, Redis, PostgreSQL
```

### Production Environment
- **Backend**: Docker containers with proper health checks
- **Database**: NeonDB PostgreSQL with connection pooling
- **MQTT**: Mosquitto broker with authentication
- **Mobile**: Expo managed workflow for easy deployment
- **Admin**: Vercel deployment with environment variables

---

## ✅ FINAL VALIDATION CHECKLIST

Before marking implementation complete, verify:

1. **Mobile App**:
   - [ ] All screens navigate correctly
   - [ ] Authentication flow works end-to-end
   - [ ] Device assignment via serial + PIN succeeds
   - [ ] Access link creation and sharing works
   - [ ] Real-time device status updates
   - [ ] Push notifications configured

2. **Backend API**:
   - [ ] All endpoints from MVP documentation implemented
   - [ ] Database schema matches exactly
   - [ ] MQTT communication working (unlock only)
   - [ ] WebSocket connections stable
   - [ ] Celery tasks processing correctly
   - [ ] Proper error handling and logging

3. **Admin Dashboard**:
   - [ ] Authentication and authorization working
   - [ ] Device registration and PIN generation
   - [ ] User management operations
   - [ ] Real-time system monitoring
   - [ ] All tables and charts displaying data

4. **Integration**:
   - [ ] Mobile ↔ Backend communication
   - [ ] Admin ↔ Backend communication
   - [ ] Real-time updates across all interfaces
   - [ ] Public delivery links working
   - [ ] End-to-end device unlock flow

---

## 📝 IMPLEMENTATION NOTES

**CRITICAL REMINDERS:**
- Follow the exact API specifications from `loqeyMvpV1.md`
- Implement only UNLOCK functionality for devices
- Use automatic device assignment (serial + PIN input)
- Maintain production-grade code quality
- Include comprehensive error handling
- Document all configuration and setup steps

**SUCCESS CRITERIA:**
The implementation is successful when a complete end-to-end flow works:
1. Admin registers and sets up new devices and generates PIN
2. User inputs serial + PIN to assign device and show on their mobile app
3. User creates time-based access link
4. Delivery person uses link to unlock device - will click on generated link from user and make sure it updates as required when unlocking
5. All status updates appear in real-time on mobile and admin interfaces

---

This prompt, combined with `loqeyMvpV1.md`, provides complete specifications for building the production Loqey IoT delivery platform with zero ambiguity and maximum precision.