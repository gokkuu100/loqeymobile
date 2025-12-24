# Development Build Guide

## Why Development Build?

Since we're using `@react-native-firebase/messaging`, which requires native code, **Expo Go won't work**. You need to create a **development build** that includes the native Firebase modules.

## Quick Start

### Option 1: Local Development Build (Recommended for Testing)

#### For Android:

```bash
# 1. Generate native code
npx expo prebuild --clean

# 2. Build and run on Android
npx expo run:android

# This will:
# - Build the native Android app with Firebase
# - Install it on your connected device/emulator
# - Start the Expo dev server
```

#### For iOS (macOS only):

```bash
# 1. Generate native code
npx expo prebuild --clean

# 2. Build and run on iOS
npx expo run:ios

# This will:
# - Build the native iOS app with Firebase
# - Install it on your connected device/simulator
# - Start the Expo dev server
```

### Option 2: EAS Build (Cloud Build)

If you prefer cloud builds:

```bash
# 1. Install EAS CLI (if not already installed)
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS (first time only)
eas build:configure

# 4. Build development build for Android
eas build --profile development --platform android

# 5. Build development build for iOS
eas build --profile development --platform ios

# 6. Install the build on your device
# Follow the QR code/link provided after build completes
```

## Running After Build

Once you have the development build installed:

```bash
# Start the Expo dev server
npx expo start --dev-client

# Or use the regular start command
npm start
```

Then:
- **Scan the QR code** with your development build app (not Expo Go)
- Or press `a` for Android / `i` for iOS to open in emulator/simulator

## Differences from Expo Go

✅ **Works with native modules** (Firebase, etc.)  
✅ **Faster development** (native code pre-built)  
✅ **Closer to production** (same build process)  
❌ **Requires build step** (can't just scan QR code immediately)  
❌ **Larger app size** (includes native code)

## Troubleshooting

### "Network request failed" Error

This is likely because:
1. **Backend not running** - Make sure your FastAPI backend is running
2. **Wrong IP address** - Check your `.env` or `app.json` for `EXPO_PUBLIC_API_BASE_URL`
3. **Firewall blocking** - Ensure port 8000 is accessible

### Firebase Not Working

- Make sure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are in the root of `loqeymobile/`
- Run `npx expo prebuild --clean` after adding Firebase config files
- Rebuild the app: `npx expo run:android` or `npx expo run:ios`

### Can't Connect to Backend

Check your API base URL:
```bash
# In loqeymobile/.env or app.json
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8000/api/v1

# Find your IP:
# Linux/Mac: ifconfig or ip addr
# Windows: ipconfig
```

## Current Status

- ✅ Firebase integration added
- ✅ Development build configured
- ✅ NotificationService handles missing Firebase gracefully
- ⚠️ **You must use development build** (Expo Go won't work)

## Next Steps

1. **Build the development build**: `npx expo run:android` or `npx expo run:ios`
2. **Test the app** - All features should work except push notifications (until Firebase is fully configured)
3. **Configure Firebase** - Add service account key to backend and test push notifications

