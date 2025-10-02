import { Activity, Delivery, Device, User } from './types';

export const mockUser: User = {
  id: 'user_001',
  name: 'Prince',
  email: 'prince@email.com',
};

export const mockDevices: Device[] = [
  {
    id: 'device_001',
    name: 'Home Lockbox',
    location: '123 Main St, Apt 4B',
    status: 'unlocked',
    battery: 87,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'device_002',
    name: 'Office Lockbox',
    location: '456 Business Ave, Suite 200',
    status: 'locked',
    battery: 65,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'device_003',
    name: 'Vacation Home',
    location: '789 Lake View Dr',
    status: 'locked',
    battery: 92,
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
];

export const mockDeliveries: Delivery[] = [
  {
    id: 'del_001',
    trackingNumber: 'TRK123456789',
    title: 'Amazon Package - Electronics',
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    carrier: 'UPS',
    status: 'pending',
  },
  {
    id: 'del_002',
    trackingNumber: 'TRK987654321',
    title: 'Best Buy Order - Phone Case',
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    carrier: 'FedEx',
    status: 'pending',
  },
  {
    id: 'del_003',
    trackingNumber: 'TRK456789123',
    title: 'Target Package - Home Decor',
    estimatedDelivery: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (delivered)
    carrier: 'USPS',
    status: 'delivered',
  },
];

export const mockActivities: Activity[] = [
  {
    id: 'act_001',
    type: 'unlock',
    description: 'Lockbox unlocked by Prince',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    deviceId: 'device_001',
  },
  {
    id: 'act_002',
    type: 'delivery',
    description: 'Package delivered from Amazon',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    deviceId: 'device_001',
  },
  {
    id: 'act_003',
    type: 'lock',
    description: 'Lockbox automatically locked',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    deviceId: 'device_001',
  },
  {
    id: 'act_004',
    type: 'unlock',
    description: 'Lockbox unlocked by Jennifer',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    deviceId: 'device_002',
  },
];
