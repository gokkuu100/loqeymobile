# 📦 Loqey - IoT-Based Smart Delivery Lockbox Platform

A secure IoT-powered system for **smart lockbox package del

### 🔗 Access Link Management
- [ ] **Generate secure delivery links**:
  - Custom expiration settings (1 hour, 24h, 1 week, custom)
  - One-time use (automatic after delivery)
  - QR code generation for easy sharing
  - No password required - time-based security only
- [ ] **Link management**:
  - View active links and their status
  - Revoke access links anytime
  - Track link usage and delivery attempts
  - Share via multiple channels (email, SMS, copy link)real-time monitoring, device management, and secure access control.

---

## 🏗️ Tech Stack
- [ ] **Frontend**
  - React Native Expo → Mobile app for device owners (iOS + Android)
  - React/Next.js → Web admin dashboard and delivery access pages
- [ ] **Backend**
  - FastAPI (REST + WebSocket APIs)
  - PostgreSQL (Primary database with Drizzle ORM)
  - MQTT Mosquitto Broker (IoT communication with lockboxes)
  - Celery + Redis (Background jobs, access link management, notifications)
- [ ] **Real-time Communication**  
  - WebSockets/SSE for live updates
  - MQTT Subscribe-Publish model for device communication
- [ ] **Monitoring & Security**
  - Prometheus + Grafana → System metrics and monitoring
  - JWT Auth → Secure API authentication
  - HTTPS everywhere with SSL certificates
  - Role-Based Access Control (RBAC)
  - End-to-end encryption for device commands

---

## 👥 System Users & Responsibilities

### 🏠 **Device Owners (End Users)**
- Purchase lockboxes and manage their smart delivery system
- Generate temporary access links for deliveries
- Monitor device status and delivery activities
- Manage device settings and notifications

### 🔧 **System Administrators**
- Manage the entire platform infrastructure
- Register and configure new lockbox devices
- Assign devices to customers with serial numbers + PINs
- Monitor system health and handle support requests
- Process device unlinking requests

### 🚚 **Delivery Personnel**
- Access temporary unlock links provided by customers
- Complete deliveries using secure web interface
- No account registration required (anonymous access)

---

## 🔐 Device Onboarding & Authentication Flow

### Admin Device Registration Process
1. [ ] **Admin registers new device** in system with:
   - Unique serial number
   - Generated secret PIN (6-8 digits)
   - Device configuration (MQTT credentials, firmware version)
   - Assignment status (available/assigned)

2. [ ] **Customer purchases lockbox** from retailer
3. [ ] **Admin assigns device to customer** via support request:
   - Customer provides proof of purchase
   - Admin sends serial number + PIN to customer's email
   - Device status changed to "assigned"

### Customer Device Addition Process
1. [ ] **Customer opens mobile app** → "Add Device" section
2. [ ] **Input credentials**:
   - Serial number (from device packaging)
   - Secret PIN (received via email from support)
3. [ ] **Automatic system verification** (loading state):
   - Verify serial number exists in system
   - Validate PIN matches admin-generated PIN
   - Check device is available for assignment
4. [ ] **Instant device activation**:
   - Device automatically linked to customer account
   - MQTT credentials configured for real-time communication
   - Device status updated to "active"
   - Customer profile updated with device data
5. [ ] **Ready to use**:
   - Real-time device monitoring established
   - Lock/unlock controls activated
   - Customer can immediately use device

### Device Unlinking Process
1. [ ] **Customer requests unlinking** via app or email
2. [ ] **Admin receives unlinking request** with:
   - Customer verification details
   - Device serial number
   - Reason for unlinking
3. [ ] **Admin processes request**:
   - Verify customer ownership
   - Deactivate device from customer account
   - Reset device to "available" status
   - Clear MQTT configurations
4. [ ] **Customer confirmation** of successful unlinking


---

## 📱 Mobile App (Device Owners)

### 🏠 Dashboard
- [ ] **Real-time device overview**:
  - Device status indicators (online/offline, locked/unlocked)
  - Battery level monitoring with low-battery alerts
  - GPS location display for each device
  - Quick lock/unlock controls
- [ ] **Multi-device support**:
  - Device selection dropdown/tabs
  - Simultaneous monitoring of multiple lockboxes
- [ ] **Active deliveries section**:
  - Pending delivery access links
  - Delivery completion notifications
  - Real-time delivery status updates

### � Access Link Management
- [ ] **Generate secure delivery links**:
  - Custom expiration settings (1 hour, 24h, 1 week, custom)
  - One-time use or multiple use options
  - Password protection (optional)
  - QR code generation for easy sharing
- [ ] **Link management**:
  - View active links and their status
  - Revoke access links anytime
  - Track link usage and delivery attempts
  - Share via multiple channels (email, SMS, copy link)

### 📦 Complete Delivery Flow
1. [ ] **Customer places order** on shopping website
2. [ ] **Generate access link** in mobile app:
   - Select target device/lockbox
   - Set expiration time and access rules
   - Generate secure link with unique token
3. [ ] **Share delivery details**:
   - Paste access link in shopping site order form
   - Include delivery instructions if needed
4. [ ] **Order fulfillment**:
   - Courier receives order with access link
   - Link contains all necessary delivery information
5. [ ] **Delivery completion**:
   - Real-time notification when delivery is completed
   - Automatic activity log update
   - Link becomes invalid after use

### 🚪 Guest Access Monitoring
- [ ] **Track delivery attempts**:
  - Real-time notifications for link access
  - Failed delivery attempt alerts
  - Successful delivery confirmations
- [ ] **Delivery verification**:
  - Delivery person details captured
  - Timestamp and location logging

### 👤 Account & Device Management
- [ ] **Profile settings**:
  - Personal information (name, email, phone)
  - Account security settings
  - Subscription and billing information
- [ ] **Device management**:
  - Add new devices (serial number + PIN flow)
  - View device details and status
  - Configure device settings (name, location)
  - Request device unlinking
- [ ] **Notification preferences**:
  - Email notification settings
  - Push notification controls
  - Delivery alert customization
  - Timezone configuration

### � Activity & Analytics
- [ ] **Comprehensive activity log**:
  - All lock/unlock events with timestamps
  - Delivery completion records
  - Failed access attempts
  - System maintenance activities
- [ ] **Smart insights**:
  - Delivery pattern analysis
  - Device usage statistics
  - Battery life predictions
  - Security event summaries

---

## 🌐 Admin Web Dashboard

### 📊 System Overview
- [ ] **Real-time platform metrics**:
  - Total active devices and users
  - System health indicators
  - Device connectivity status
  - Performance analytics
- [ ] **Operational dashboard**:
  - Device fleet status overview
  - Alert and notification center
  - Support ticket management
  - User account management

### 👥 User & Account Management
- [ ] **Customer account administration**:
  - User registration and verification
  - Account status management (active/suspended)
  - Customer support ticket tracking
  - Billing and subscription management
- [ ] **Access control**:
  - Admin role assignments
  - Permission management (RBAC)
  - Activity audit trails
  - Security policy enforcement

### 📦 Device Fleet Management
- [ ] **Device lifecycle management**:
  - Register new IoT devices with serial numbers
  - Generate and assign PINs to devices
  - **Generate new PIN functionality** (disables previous PIN)
  - Device assignment to customers
  - Device decommissioning process
- [ ] **Device monitoring**:
  - Real-time connectivity status
  - Battery and hardware health monitoring
  - Firmware version tracking
  - Remote diagnostics and troubleshooting
- [ ] **Device operations**:
  - Remote firmware updates
  - Configuration management
  - Factory reset capabilities
  - PIN regeneration (user must contact admin for new PIN)
  - Maintenance scheduling

### 🔧 System Configuration
- [ ] **Platform settings**:
  - MQTT broker configuration
  - Security policy management
  - API rate limiting and throttling
  - Integration settings (third-party services)
- [ ] **Support operations**:
  - Device unlinking request processing
  - Customer support ticketing system
  - Escalation workflows
  - Knowledge base management

### 📈 Analytics & Reporting
- [ ] **Business intelligence**:
  - Usage analytics and trends
  - Customer behavior insights
  - Device performance metrics
  - Revenue and subscription tracking
- [ ] **Compliance and auditing**:
  - Complete audit trail logging
  - Security incident reporting
  - Compliance report generation
  - Data retention management

---

## 🚚 Delivery Personnel Experience

### 🔗 Secure Link Access Flow
1. [ ] **Receive delivery assignment**:
   - Secure access link from customer
   - Order details and delivery address
   - Customer contact information
2. [ ] **Access delivery interface**:
   - Click link to open secure web page
   - No account registration required
   - Mobile-optimized interface
3. [ ] **Identity verification**:
   - Input delivery person details:
     - Full name
     - Employee/Driver ID
     - Courier company name
     - Contact number
4. [ ] **Device unlock process**:
   - Review delivery details
   - Click "Unlock Device" button
   - System communicates with MQTT device
   - Lockbox automatically unlocks
   - 30-second window to place package
   - Device automatically locks after timeout
5. [ ] **Completion workflow**:
   - Delivery confirmation notification
   - Link becomes invalid (one-time use)
   - Customer receives instant notification
   - Delivery record added to system logs

### 🔒 Security Measures
- [ ] **Access validation**:
  - Time-based link expiration
  - IP address logging

- [ ] **Audit trail**:
  - Complete delivery attempt logging
  - Failed access attempt tracking
  - Security incident reporting
  - Data integrity verification  

---

## 🔒 Security & Compliance Framework

### 🛡️ Authentication & Authorization
- [ ] **Multi-factor authentication** for admin accounts
- [ ] **JWT-based API security** with token refresh mechanisms
- [ ] **Role-based access control (RBAC)**:
  - Device owners: Device control and delivery management
  - Admins: Full system access and management
  - Support staff: Limited customer assistance capabilities
- [ ] **Session management** with automatic timeout and security monitoring

### 🔐 Data Protection
- [ ] **End-to-end encryption** for all IoT device communications
- [ ] **TLS 1.3** for all API communications
- [ ] **Data encryption at rest** for sensitive information (PINs, personal data)
- [ ] **PII protection** with data anonymization where possible
- [ ] **GDPR compliance** with data deletion and export capabilities

### 🚨 Security Monitoring
- [ ] **Real-time intrusion detection** for unauthorized access attempts
- [ ] **Comprehensive audit logging** for all system activities
- [ ] **Automated security alerts** for suspicious activities
- [ ] **Rate limiting and DDoS protection** for all public APIs
- [ ] **Regular security assessments** and penetration testing

### 🔄 Business Continuity
- [ ] **Automated backup systems** with point-in-time recovery
- [ ] **High availability architecture** with redundancy
- [ ] **Disaster recovery procedures** with RTO/RPO targets
- [ ] **System health monitoring** with proactive alerting

---

## 📡 IoT Device Communication Protocol

### 🌐 MQTT Architecture
- [ ] **Secure MQTT broker** with TLS encryption and client certificates
- [ ] **Topic-based messaging** for device commands and status updates
- [ ] **Quality of Service (QoS)** levels for message delivery guarantees
- [ ] **Last Will and Testament (LWT)** for device connectivity monitoring

### 📤 Device Communication Flows
- [ ] **Device status updates**:
  - Battery level reporting (every 6 hours)
  - Connectivity heartbeats (every 5 minutes)
  - Lock status changes (real-time)
  - Error and maintenance alerts
- [ ] **Command execution**:
  - Remote lock/unlock commands
  - Configuration updates
  - Firmware update notifications
  - Factory reset commands

### 🔧 Device Management
- [ ] **Over-the-air (OTA) updates** for firmware and security patches
- [ ] **Remote diagnostics** and troubleshooting capabilities
- [ ] **Device configuration management** with versioning
- [ ] **Predictive maintenance** based on device telemetry

---

## 🚀 System Integration & APIs

### 🔌 External Integrations
- [ ] **Courier service APIs** for delivery tracking and updates - Future
- [ ] **E-commerce platform integrations** for order management - Future
- [ ] **Payment gateway integration** for subscription billing 
- [ ] **SMS and email service providers** for notifications
- [ ] **Mapping and geolocation services** for device tracking 

### 📊 Analytics & Reporting
- [ ] **Business intelligence dashboard** with key performance indicators
- [ ] **Usage analytics** for customer behavior insights

### 🔄 Event-Driven Architecture
- [ ] **Kafka event streaming** for real-time data processing
- [ ] **Event sourcing** for complete audit trails
- [ ] **Microservice communication** via events and messages
- [ ] **Webhook notifications** for external system integration

---

## 🚧 Error Handling & Support

### ⚠️ Error Management
- [ ] **Comprehensive error logging** with categorization and severity
- [ ] **Automated error recovery** for common device and system issues
- [ ] **Graceful degradation** when services are temporarily unavailable
- [ ] **User-friendly error messages** with actionable resolution steps

### 🎧 Customer Support System
- [ ] **Integrated helpdesk** with ticket management
- [ ] **Knowledge base** with self-service resources

### 📱 Mobile App Support Features
- [ ] **FAQ and help documentation** integrated in app
- [ ] **Support ticket creation** directly from device issues

---

## 🔍 Monitoring & Observability - Admin

### 📈 System Metrics
- [ ] **Application performance monitoring (APM)** with Prometheus + Grafana
- [ ] **Infrastructure monitoring** for servers, databases, and network
- [ ] **IoT device fleet monitoring** with connectivity and health metrics
- [ ] **Business metrics tracking** for user engagement and platform usage

### 🚨 Alerting & Notifications
- [ ] **Real-time alerting** for system failures and performance issues
- [ ] **Smart notification routing** based on severity and on-call schedules
- [ ] **Escalation procedures** for critical system events
- [ ] **Status page** for external communication during incidents

### 📊 Logging & Tracing
- [ ] **Centralized logging** with structured log formats
- [ ] **Distributed tracing** for request flow analysis
- [ ] **Log aggregation and search** capabilities
- [ ] **Retention policies** for compliance and storage optimization

---

## 🗄️ Production Database Schema

### 📋 Database Design Principles
- **ACID compliance** with PostgreSQL for data integrity
- **Proper normalization** to avoid data redundancy
- **Foreign key constraints** for referential integrity
- **Indexing strategy** for optimal query performance
- **Audit trail** for all critical operations
- **Soft deletes** for data recovery and compliance

### 🏗️ Core Tables

#### 👤 Users Management
```sql
-- Core user accounts table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- User status enum
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated', 'pending_verification');

-- Admin user roles and permissions
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role admin_role NOT NULL DEFAULT 'support',
    permissions TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'support');

-- User sessions for JWT management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(512) NOT NULL UNIQUE,
    refresh_token VARCHAR(512) NOT NULL UNIQUE,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE NULL
);
```

#### 📦 Device Management
```sql
-- IoT lockbox devices registry
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    secret_pin VARCHAR(10) NOT NULL, -- Admin-generated PIN
    model VARCHAR(100) NOT NULL,
    firmware_version VARCHAR(20),
    manufacturer VARCHAR(100) DEFAULT 'Loqey',
    status device_status DEFAULT 'available',
    mqtt_client_id VARCHAR(100) UNIQUE,
    mqtt_username VARCHAR(100),
    mqtt_password_hash VARCHAR(255),
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_address TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TYPE device_status AS ENUM ('available', 'assigned', 'active', 'maintenance', 'decommissioned');

-- Device ownership and assignment
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    device_name VARCHAR(100), -- User-defined name
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES admin_users(id),
    unlinked_at TIMESTAMP WITH TIME ZONE NULL,
    unlinked_by UUID REFERENCES admin_users(id),
    unlinking_reason TEXT,
    UNIQUE(user_id, device_id)
);

-- Device configuration and settings
CREATE TABLE device_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    configuration_key VARCHAR(100) NOT NULL,
    configuration_value TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by UUID REFERENCES admin_users(id),
    UNIQUE(device_id, configuration_key)
);
```

#### 🔗 Access Links & Delivery Management
```sql
-- Temporary access links for deliveries
CREATE TABLE access_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    link_token VARCHAR(255) UNIQUE NOT NULL,
    link_url TEXT NOT NULL,
    name VARCHAR(100), -- User-defined link name
    description TEXT,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    password_protected BOOLEAN DEFAULT FALSE,
    access_password_hash VARCHAR(255),
    status link_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE NULL,
    revoked_by UUID REFERENCES users(id)
);

CREATE TYPE link_status AS ENUM ('active', 'expired', 'revoked', 'used');

-- Delivery attempts and completions
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_link_id UUID NOT NULL REFERENCES access_links(id) ON DELETE CASCADE,
    delivery_person_name VARCHAR(100) NOT NULL,
    delivery_person_id VARCHAR(100) NOT NULL,
    courier_company VARCHAR(100) NOT NULL,
    delivery_person_phone VARCHAR(20),
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    status delivery_status DEFAULT 'attempted',
    ip_address INET,
    user_agent TEXT,
    geolocation_lat DECIMAL(10, 8),
    geolocation_lng DECIMAL(11, 8),
    delivery_notes TEXT,
    failure_reason TEXT,
    device_unlock_successful BOOLEAN DEFAULT FALSE
);

CREATE TYPE delivery_status AS ENUM ('attempted', 'completed', 'failed', 'cancelled');
```

#### 🔐 Security & Audit
```sql
-- Comprehensive audit log for all system activities
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    admin_user_id UUID REFERENCES admin_users(id),
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'device', 'delivery', etc.
    entity_id UUID,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'access', etc.
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    additional_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events and incidents
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type security_event_type NOT NULL,
    severity security_severity DEFAULT 'low',
    user_id UUID REFERENCES users(id),
    device_id UUID REFERENCES devices(id),
    ip_address INET,
    user_agent TEXT,
    event_data JSONB NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE NULL,
    resolved_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE security_event_type AS ENUM (
    'failed_login', 'suspicious_activity', 'unauthorized_access',
    'device_tampering', 'multiple_failed_attempts', 'ip_blocked'
);

CREATE TYPE security_severity AS ENUM ('low', 'medium', 'high', 'critical');
```

#### 🔔 Notifications & Communication
```sql
-- Notification templates and management
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type notification_type NOT NULL,
    subject VARCHAR(200),
    content_text TEXT NOT NULL,
    content_html TEXT,
    variables TEXT[] DEFAULT '{}', -- Available template variables
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push', 'webhook');

-- User notification preferences
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_notifications BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    device_status_updates BOOLEAN DEFAULT TRUE,
    marketing_communications BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification queue and delivery tracking
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id),
    type notification_type NOT NULL,
    recipient VARCHAR(255) NOT NULL, -- email/phone/device_token
    subject VARCHAR(200),
    content TEXT NOT NULL,
    status notification_status DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE NULL,
    delivered_at TIMESTAMP WITH TIME ZONE NULL,
    failed_at TIMESTAMP WITH TIME ZONE NULL,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    metadata JSONB
);

CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'cancelled');
```

#### 🎫 Support & Ticketing
```sql
-- Customer support ticket system
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable ticket ID
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    category support_category NOT NULL,
    priority support_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE NULL,
    closed_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TYPE support_category AS ENUM (
    'device_issue', 'account_problem', 'delivery_issue', 'feature_request',
    'billing_inquiry', 'technical_support', 'unlinking_request', 'other'
);

CREATE TYPE support_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');

-- Support ticket messages and communication
CREATE TABLE support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES users(id),
    sender_admin_id UUID REFERENCES admin_users(id),
    message_type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    attachments TEXT[], -- URLs to uploaded files
    is_internal BOOLEAN DEFAULT FALSE, -- Internal admin notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE message_type AS ENUM ('text', 'file', 'system', 'note');
```

#### 📊 Analytics & Reporting
```sql
-- Device usage and performance metrics
CREATE TABLE device_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Platform usage analytics
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business intelligence aggregations
CREATE TABLE bi_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_devices INTEGER DEFAULT 0,
    active_devices INTEGER DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    support_tickets_created INTEGER DEFAULT 0,
    support_tickets_resolved INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);
```

### 🔗 Database Relationships & Constraints

#### Primary Relationships
- **Users ↔ Devices**: Many-to-many through `user_devices` (users can own multiple devices)
- **Users ↔ Access Links**: One-to-many (users create multiple access links)
- **Access Links ↔ Deliveries**: One-to-many (each link can have multiple delivery attempts)
- **Users ↔ Support Tickets**: One-to-many (users can create multiple tickets)
- **Devices ↔ Device Metrics**: One-to-many (devices generate multiple metrics)

#### Performance Indexes
```sql
-- Performance-critical indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status) WHERE status = 'active';
CREATE INDEX idx_devices_serial_number ON devices(serial_number);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX idx_access_links_token ON access_links(link_token);
CREATE INDEX idx_access_links_expires ON access_links(expires_at);
CREATE INDEX idx_access_links_user_device ON access_links(user_id, device_id);
CREATE INDEX idx_deliveries_access_link ON deliveries(access_link_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
```

#### Data Integrity Constraints
```sql
-- Business logic constraints
ALTER TABLE access_links ADD CONSTRAINT chk_max_uses_positive 
    CHECK (max_uses > 0);

ALTER TABLE access_links ADD CONSTRAINT chk_current_uses_valid 
    CHECK (current_uses >= 0 AND current_uses <= max_uses);

ALTER TABLE devices ADD CONSTRAINT chk_battery_range 
    CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100));

ALTER TABLE user_devices ADD CONSTRAINT chk_dates_valid 
    CHECK (unlinked_at IS NULL OR unlinked_at >= assigned_at);

-- Ensure one active device assignment per user-device pair
CREATE UNIQUE INDEX idx_user_devices_active 
    ON user_devices(user_id, device_id) 
    WHERE unlinked_at IS NULL;
```

### 🔄 Database Functions & Triggers

#### Automatic Timestamp Updates
```sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_links_updated_at BEFORE UPDATE ON access_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Audit Trail Automation
```sql
-- Function for automatic audit logging
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        entity_type, entity_id, action, old_values, new_values
    ) VALUES (
        TG_TABLE_NAME::text,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_devices AFTER INSERT OR UPDATE OR DELETE ON devices
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_user_devices AFTER INSERT OR UPDATE OR DELETE ON user_devices
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
```

---

## ✅ Implementation Checklist

### 🚀 Phase 1: Foundation (MVP)
- [ ] **Backend MQTT Communication**:
  - FastAPI backend with MQTT Mosquitto broker integration
  - Subscribe-publish model for device communication
  - Real-time lock/unlock functionality
  - Continuous device state monitoring and ping
  - Device status updates (battery, connectivity, lock state)
- [ ] **Core Features**:
  - User authentication and account management
  - Device registration with serial number + PIN verification
  - Access link generation with time-based expiry
  - Celery background tasks for link management
  - Basic mobile app with real-time device control
  - Admin dashboard for device and user management
- [ ] **Database & Infrastructure**:
  - Core PostgreSQL schema implementation
  - Redis for Celery task queue
  - Real-time WebSocket connections for mobile app
  - Basic security and audit logging

### 🔧 Phase 2: Enhanced Features
- [ ] Real-time notifications and MQTT integration
- [ ] Advanced security features and audit logging
- [ ] Support ticket system and customer service tools
- [ ] Analytics dashboard and business intelligence
- [ ] Advanced device management and diagnostics

### 📈 Phase 3: Scale & Optimize
- [ ] Performance optimization and caching
- [ ] Advanced analytics and predictive maintenance
- [ ] Third-party integrations and API ecosystem
- [ ] Mobile app advanced features and offline support
- [ ] Enterprise features and white-label solutions

---
