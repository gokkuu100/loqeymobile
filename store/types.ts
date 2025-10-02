export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'locked' | 'unlocked';
  battery: number;
  lastActivity: Date;
}

export interface Delivery {
  id: string;
  trackingNumber: string;
  title: string;
  estimatedDelivery: Date;
  carrier: string;
  status: 'pending' | 'delivered';
}

export interface Activity {
  id: string;
  type: 'unlock' | 'lock' | 'delivery';
  description: string;
  timestamp: Date;
  deviceId: string;
}

export interface AppState {
  user: User;
  devices: Device[];
  currentDevice: Device | null;
  deliveries: Delivery[];
  activities: Activity[];
  isLoading: boolean;
}
