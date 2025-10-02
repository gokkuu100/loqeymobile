/**
 * Tests for WebSocket hook
 */
import { renderHook, waitFor } from '@testing-library/react-native';
import { useWebSocket, useDeviceWebSocket } from '../hooks/useWebSocket';

// Mock the websocket client
jest.mock('../api/websocket', () => ({
  websocketClient: {
    connectToDevice: jest.fn().mockResolvedValue(undefined),
    connectToUserDevices: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    send: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    getState: jest.fn().mockReturnValue(1), // OPEN
    isConnected: jest.fn().mockReturnValue(true),
  },
  WS_STATES: {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  },
}));

describe('useWebSocket', () => {
  it('should connect automatically when autoConnect is true', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ deviceId: 'TEST001', autoConnect: true })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should not connect automatically when autoConnect is false', () => {
    const { result } = renderHook(() =>
      useWebSocket({ deviceId: 'TEST001', autoConnect: false })
    );

    expect(result.current.isConnected).toBe(false);
  });

  it('should allow manual connection', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ deviceId: 'TEST001', autoConnect: false })
    );

    await result.current.connect();

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should allow disconnection', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ deviceId: 'TEST001', autoConnect: true })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    result.current.disconnect();

    expect(result.current.isConnected).toBe(false);
  });
});

describe('useDeviceWebSocket', () => {
  it('should track device status', async () => {
    const { result } = renderHook(() =>
      useDeviceWebSocket('TEST001', { autoConnect: true })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Initially null
    expect(result.current.deviceStatus).toBeNull();
    expect(result.current.batteryLevel).toBeNull();
    expect(result.current.lockStatus).toBeNull();
  });
});
