import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { LinkAPI, DeliveryRecord } from '@/api/links';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type TimeFilter = 'today' | 'week' | 'all';

export default function DeliveryHistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('today');
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const LIMIT = 10;

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeFilter, deliveries]);

  const loadDeliveries = async (skip = 0, isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      console.log('📦 Loading deliveries from server...');
      
      // Use the new efficient endpoint that fetches all deliveries in one query
      const response = await LinkAPI.getAllDeliveries(skip, 200); // Fetch up to 200 records
      
      if (response.success && response.data) {
        const { deliveries: newDeliveries, pagination } = response.data;
        
        console.log(`✅ Loaded ${newDeliveries.length} deliveries from server`);
        console.log(`📊 Pagination: skip=${pagination.skip}, total=${pagination.total}, has_more=${pagination.has_more}`);
        
        // Sort by most recent first (server already does this, but just to be sure)
        newDeliveries.sort((a, b) => {
          const dateA = new Date(a.completed_at || a.attempted_at || 0).getTime();
          const dateB = new Date(b.completed_at || b.attempted_at || 0).getTime();
          return dateB - dateA;
        });
        
        if (isLoadMore) {
          // Append to existing deliveries
          setDeliveries(prev => [...prev, ...newDeliveries]);
        } else {
          // Replace deliveries
          setDeliveries(newDeliveries);
        }
        
        setTotalRecords(pagination.total);
        setHasMore(pagination.has_more);
        setCurrentSkip(pagination.skip + newDeliveries.length);
      } else {
        console.error('❌ Failed to load deliveries:', response.error);
        Alert.alert('Error', response.error || 'Failed to load delivery history');
      }
    } catch (error) {
      console.error('❌ Error loading deliveries:', error);
      Alert.alert('Error', 'Failed to load delivery history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentSkip(0);
    loadDeliveries();
  };

  const applyFilter = () => {
    const now = new Date();
    let filtered = [...deliveries];

    console.log(`🔍 Applying filter: ${activeFilter}, Total deliveries: ${deliveries.length}`);

    switch (activeFilter) {
      case 'today':
        // Get start of today in local timezone (00:00:00)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        filtered = deliveries.filter(d => {
          // Use completed_at if available, otherwise attempted_at (matches backend logic)
          const deliveryDateStr = d.completed_at || d.attempted_at;
          if (!deliveryDateStr) return false;
          
          // Parse the date string (which is in UTC from backend)
          const deliveryDate = new Date(deliveryDateStr);
          
          // Check if the delivery date is today or later in local time
          const isToday = deliveryDate >= startOfToday;
          
          return isToday;
        });
        
        console.log(`📅 Today filter: ${filtered.length} records from ${startOfToday.toLocaleString()}`);
        break;
      
      case 'week':
        // Get date 7 days ago from now
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        
        filtered = deliveries.filter(d => {
          const deliveryDateStr = d.completed_at || d.attempted_at;
          if (!deliveryDateStr) return false;
          
          const deliveryDate = new Date(deliveryDateStr);
          const isWithinWeek = deliveryDate >= weekAgo;
          
          return isWithinWeek;
        });
        
        console.log(`📅 Week filter: ${filtered.length} records from ${weekAgo.toISOString()}`);
        break;
      
      case 'all':
      default:
        filtered = deliveries;
        console.log(`📅 All filter: ${filtered.length} records`);
        break;
    }

    setFilteredDeliveries(filtered);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (delivery: DeliveryRecord) => {
    // Navigate to delivery detail screen
    router.push({
      pathname: '/screens/DeliveryDetailScreen' as any,
      params: { deliveryId: delivery.id }
    });
  };

  const renderFilterButton = (filter: TimeFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && { backgroundColor: colors.tint },
        activeFilter !== filter && { backgroundColor: colors.card }
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterText,
          activeFilter === filter && { color: '#FFF', fontWeight: '600' },
          activeFilter !== filter && { color: colors.text }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDeliveryItem = ({ item }: { item: DeliveryRecord }) => (
    <TouchableOpacity
      style={[styles.deliveryCard, { backgroundColor: colors.card }]}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.deliveryHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.device_unlock_successful ? 'checkmark-circle' : 'close-circle'}
            size={28}
            color={item.device_unlock_successful ? '#4CAF50' : '#F44336'}
          />
        </View>
        
        <View style={styles.deliveryContent}>
          <Text style={[styles.deliveryTitle, { color: colors.text }]} numberOfLines={1}>
            {item.device_unlock_successful ? 'Successful Delivery' : 'Failed Attempt'}
          </Text>
          
          {item.device_name && (
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={13} color={colors.tabIconDefault} />
              <Text style={[styles.infoText, { color: colors.tabIconDefault }]} numberOfLines={1}>
                {item.device_name}
              </Text>
            </View>
          )}
          
          {item.delivery_person_name && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={13} color={colors.tabIconDefault} />
              <Text style={[styles.infoText, { color: colors.tabIconDefault }]} numberOfLines={1}>
                {item.delivery_person_name}
              </Text>
            </View>
          )}
          
          {item.courier_company && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={14} color={colors.tabIconDefault} />
              <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
                {item.courier_company}
              </Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={13} color={colors.tabIconDefault} />
            <Text style={[styles.infoText, { color: colors.tabIconDefault }]} numberOfLines={1}>
              {formatDate(item.completed_at || item.attempted_at)}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
      </View>
      
      {item.tracking_number && (
        <View style={[styles.trackingBadge, { backgroundColor: colors.background }]}>
          <Text style={[styles.trackingText, { color: colors.tabIconDefault }]} numberOfLines={1}>
            Tracking: {item.tracking_number}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={colors.tabIconDefault} />
      <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
        No deliveries found
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        {activeFilter === 'today' && 'No deliveries recorded today'}
        {activeFilter === 'week' && 'No deliveries in the past week'}
        {activeFilter === 'all' && 'Create access links and deliveries will appear here'}
      </Text>
      {activeFilter !== 'all' && deliveries.length > 0 && (
        <TouchableOpacity
          style={[styles.filterResetButton, { backgroundColor: colors.tint }]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={styles.filterResetText}>View All Deliveries</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSkeletonItem = () => (
    <View style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonCircle, { backgroundColor: colors.background }]} />
        <View style={styles.skeletonContent}>
          <View style={[styles.skeletonLine, styles.skeletonTitle, { backgroundColor: colors.background }]} />
          <View style={[styles.skeletonLine, styles.skeletonText, { backgroundColor: colors.background }]} />
          <View style={[styles.skeletonLine, styles.skeletonText, { backgroundColor: colors.background }]} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Delivery History
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.tabIconDefault }]}>
              {filteredDeliveries.length} {filteredDeliveries.length === 1 ? 'record' : 'records'}
            </Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {renderFilterButton('today', 'Today')}
          {renderFilterButton('week', 'Last Week')}
          {renderFilterButton('all', 'All Time')}
        </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5].map(i => (
            <React.Fragment key={i}>
              {renderSkeletonItem()}
            </React.Fragment>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredDeliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={filteredDeliveries.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    gap: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    flex: 1,
    paddingHorizontal: 4,
  },
  deliveryCard: {
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 2,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 36,
    alignItems: 'center',
  },
  deliveryContent: {
    flex: 1,
    gap: 5,
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
  trackingBadge: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  trackingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  filterResetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 6,
  },
  filterResetText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  skeletonCard: {
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 2,
    borderRadius: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  skeletonTitle: {
    width: '60%',
    height: 16,
  },
  skeletonText: {
    width: '80%',
  },
});
