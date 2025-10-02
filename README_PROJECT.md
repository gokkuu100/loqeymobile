# Loqey Customer App

A production-quality React Native Expo application for managing IoT delivery boxes. Built with TypeScript, React Navigation, and Zustand for state management.

## 🏗️ Architecture

### Navigation Structure
- **Drawer Navigation**: Primary navigation with hamburger menu
  - Main (hidden): Contains the tab navigator
  - Settings: App preferences and box configuration
  - Help & Support: FAQ, contact options, and troubleshooting
  - About: Company info, team, and legal pages

- **Bottom Tab Navigation**: Core app features
  - Home: Box status, pending deliveries, recent activities
  - Deliveries: Ongoing and past deliveries with tracking
  - Control: Lock/unlock controls, scheduling, access links
  - Alerts: Notifications with filtering and grouping
  - Profile: User info, box details, and navigation to drawer

### State Management
- **Zustand Store**: Global state management with persistent storage
- **Mock Data**: Comprehensive test data for all features
- **Type Safety**: Full TypeScript definitions for all data structures

### UI Components
- **Reusable Components**: Card, Button, StatusBadge, Switch
- **Theme System**: Light/dark mode support with consistent colors
- **Design System**: Typography, spacing, colors, and shadows

## 📱 Features

### Home Screen
- **Box Status Card**: Large visual indicator (locked/unlocked)
- **Quick Controls**: One-tap lock/unlock functionality
- **Pending Deliveries**: List of incoming packages
- **Recent Activities**: Timeline of box interactions
- **Refresh Support**: Pull-to-refresh for data updates

### Deliveries Screen
- **Dual Tabs**: Ongoing vs Past deliveries
- **Progress Tracking**: Visual progress indicators for delivery status
- **Detailed Info**: Carrier, tracking numbers, package details
- **Status Badges**: Color-coded delivery statuses

### Control Screen
- **Lock/Unlock**: Direct box control with visual feedback
- **Scheduling**: Date/time picker for automated actions
- **Access Links**: Generate temporary access URLs
- **Link Management**: Share, delete, and track link usage

### Alerts Screen
- **Smart Filtering**: Filter by type (box, delivery, security, system)
- **Grouped Display**: Alerts organized by date
- **Read Status**: Visual indicators for unread alerts
- **Priority Levels**: High, medium, low priority alerts

### Profile Screen
- **User Information**: Name, email, phone with avatar
- **Box Details**: Box ID, location, battery status
- **Statistics**: Delivery counts and uptime metrics
- **Navigation Hub**: Access to drawer menu items

### Settings Screen
- **Theme Selection**: Light, dark, or system theme
- **Notifications**: Granular notification preferences
- **Box Preferences**: Auto-lock timer, PIN requirements
- **Data Management**: Export data, clear history

### Help & Support Screen
- **FAQ Section**: Expandable frequently asked questions
- **Contact Options**: Email, phone, live chat, manual
- **Quick Actions**: Box reset, connection test
- **System Info**: App version, firmware, sync status

### About Screen
- **Company Info**: Mission, contact details, team
- **Social Links**: Twitter, LinkedIn, GitHub, website
- **Legal Pages**: Privacy policy, terms, licenses
- **App Details**: Version, build number, release date

## 🛠️ Technical Stack

### Core Technologies
- **React Native**: 0.79.6
- **Expo**: ~53.0.22
- **TypeScript**: ~5.8.3
- **React Navigation**: 7.x with Drawer and Bottom Tabs

### State Management
- **Zustand**: Lightweight state management
- **Mock Data**: Comprehensive test data structure

### UI & Styling
- **Expo Vector Icons**: Ionicons icon set
- **Custom Theme System**: Colors, typography, spacing
- **Responsive Design**: Adaptive layouts for all screen sizes

### Navigation
- **React Navigation 7**: Latest navigation library
- **Gesture Handler**: Smooth drawer interactions
- **Deep Linking**: Support for external navigation

## 🎨 Design System

### Colors
```typescript
Primary: #28a745 (Green)
Secondary: #6c757d (Gray)
Accent: #20c997 (Teal)
Error: #dc3545 (Red)
Warning: #ffc107 (Yellow)
Success: #28a745 (Green)
```

### Typography
- **Headings**: H1-H4 with consistent sizing
- **Body Text**: 16px with 24px line height
- **Captions**: 14px for secondary information
- **Small Text**: 12px for labels and metadata

### Spacing
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px (Base unit)
- **LG**: 24px
- **XL**: 32px
- **XXL**: 48px

## 📂 Project Structure

```
app/
├── _layout.tsx                 # Root navigation setup
├── navigation/
│   └── TabNavigator.tsx       # Bottom tab configuration
├── screens/
│   ├── HomeScreen.tsx         # Main dashboard
│   ├── DeliveriesScreen.tsx   # Delivery tracking
│   ├── ControlScreen.tsx      # Box controls
│   ├── AlertsScreen.tsx       # Notifications
│   ├── ProfileScreen.tsx      # User profile
│   ├── SettingsScreen.tsx     # App settings
│   ├── HelpScreen.tsx         # Support & FAQ
│   └── AboutScreen.tsx        # Company info

components/
├── ui/
│   ├── Card.tsx               # Container component
│   ├── Button.tsx             # Interactive buttons
│   ├── StatusBadge.tsx        # Status indicators
│   └── Switch.tsx             # Toggle controls

constants/
└── Theme.ts                   # Design system constants

store/
├── types.ts                   # TypeScript definitions
├── mockData.ts               # Test data
└── useAppStore.ts            # Zustand store

hooks/
├── useColorScheme.ts         # Theme detection
└── useThemeColor.ts          # Theme utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation
```bash
# Navigate to project directory
cd loqeyCustomerApp

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

### Development Commands
```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Reset project (if needed)
npm run reset-project
```

## 🔧 Configuration

### Environment Setup
The app uses mock data by default. To connect to real APIs:

1. Update `store/useAppStore.ts` to replace mock functions
2. Add API endpoints to environment variables
3. Configure MQTT client for real-time updates
4. Update authentication flow

### Theme Customization
Edit `constants/Theme.ts` to customize:
- Color palette
- Typography scales
- Spacing values
- Shadow definitions

## 📱 Platform Support

- **iOS**: Full support with native look and feel
- **Android**: Material Design integration
- **Web**: Progressive Web App capabilities
- **Responsive**: Adapts to tablets and different screen sizes

## 🔒 Security Features

- **Input Validation**: All user inputs sanitized
- **Access Control**: Time-limited access links
- **Secure Storage**: Sensitive data encryption
- **PIN Protection**: Optional PIN-based access

## 🧪 Testing

The app includes comprehensive mock data for testing:
- Multiple delivery statuses
- Various alert types and priorities
- Different box states and activities
- Realistic timestamps and user interactions

## 🚀 Deployment

### Production Build
```bash
# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Environment Variables
Configure the following for production:
- API endpoints
- MQTT broker settings
- Push notification keys
- Analytics tracking

## 📄 License

Copyright © 2024 Loqey Technologies. All rights reserved.

## 🤝 Contributing

This is a production application. For development guidelines and contribution processes, please contact the development team.

---

Built with ❤️ for secure package deliveries
