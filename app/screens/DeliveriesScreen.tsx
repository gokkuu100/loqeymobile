import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Delivery } from '@/store/types';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DeliveriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { devices } = useAppStore();
  // TODO: Add deliveries API and store integration
  const deliveries: any[] = [];
  
  const upcomingDeliveries = deliveries.filter((delivery: Delivery) => delivery.status === 'pending');
  const pastDeliveries = deliveries.filter((delivery: Delivery) => delivery.status === 'delivered');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDeliveryItem = ({ item }: { item: Delivery }) => (
    <TouchableOpacity style={[styles.deliveryCard, { backgroundColor: colors.card }]}>
      <View style={styles.deliveryHeader}>
        <View style={styles.deliveryInfo}>
          <Text style={[styles.deliveryTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.trackingNumber, { color: colors.tabIconDefault }]}>
            {item.trackingNumber}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: item.status === 'pending' ? '#FFA726' : '#4CAF50' 
          }
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'pending' ? 'Pending' : 'Delivered'}
          </Text>
        </View>
      </View>
      
      <View style={styles.deliveryDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={colors.tabIconDefault} />
          <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
            {item.carrier}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.tabIconDefault} />
          <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
            {item.status === 'pending' ? 'Expected: ' : 'Delivered: '}
            {formatDate(item.estimatedDelivery)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {upcomingDeliveries.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Upcoming Deliveries
          </Text>
          <FlatList
            data={upcomingDeliveries}
            renderItem={renderDeliveryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        </>
      )}
      
      {pastDeliveries.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 30 }]}>
            Past Deliveries
          </Text>
          <FlatList
            data={pastDeliveries}
            renderItem={renderDeliveryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        </>
      )}
      
      {deliveries.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            No deliveries found
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  deliveryCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  deliveryDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
