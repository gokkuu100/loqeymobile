import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback } from 'react';
import { LinkAPI, AccessLink, DeliveryRecord } from '@/api/links';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DeliveriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  
  const accessLinks = useAppStore((state) => state.accessLinks);
  const loadLinks = useAppStore((state) => state.loadLinks);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLink, setSelectedLink] = useState<AccessLink | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [linkDetails, setLinkDetails] = useState<{
    link_name?: string;
    link_type: string;
    tracking_number?: string;
    status: string;
    expires_at: string;
    max_uses: number;
    current_uses: number;
    device_name?: string;
  } | null>(null);

  const LIMIT = 10; // Load 10 records at a time

  // Load links when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        console.log('🔄 Deliveries screen focused - reloading links');
        loadLinks();
      }
    }, [isAuthenticated, loadLinks])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLinks();
    setRefreshing(false);
  };

  // Filter used/expired links (delivery history)
  const historyLinks = accessLinks.filter(link => 
    link.status === 'used' || link.status === 'expired' || link.status === 'revoked'
  );

  const handleViewLinkDetails = async (link: AccessLink) => {
    console.log('📱 View details clicked for link:', link.id);
    
    setSelectedLink(link);
    setDeliveries([]);
    setCurrentSkip(0);
    setHasMore(false);
    setTotalDeliveries(0);
    setLinkDetails(null);
    setLoadingDeliveries(true);
    
    // Set modal visible BEFORE API call so loading state shows
    setDetailsModalVisible(true);
    
    try {
      console.log('🌐 Fetching deliveries from API...');
      const response = await LinkAPI.getLinkDeliveries(link.id, 0, LIMIT);
      console.log('📦 API Response received:', {
        success: response.success,
        hasData: !!response.data,
        deviceName: response.data?.device_name,
        deliveriesCount: response.data?.deliveries?.length,
      });
      
      if (response.success && response.data) {
        console.log('✅ Setting deliveries and keeping modal open');
        
        setDeliveries(response.data.deliveries);
        setHasMore(response.data.pagination.has_more);
        setTotalDeliveries(response.data.pagination.total);
        setCurrentSkip(LIMIT);
        setLinkDetails({
          link_name: response.data.link_name,
          link_type: response.data.link_type,
          tracking_number: response.data.tracking_number,
          status: response.data.status,
          expires_at: response.data.expires_at,
          max_uses: response.data.max_uses,
          current_uses: response.data.current_uses,
          device_name: response.data.device_name,
        });
        
        console.log('✅ Modal should remain open with data');
        // Modal stays open - don't close it
      } else {
        console.error('❌ API error:', response.error);
        Alert.alert('Error', response.error || 'Failed to load delivery details');
        setDetailsModalVisible(false);
      }
    } catch (error) {
      console.error('❌ Exception loading deliveries:', error);
      Alert.alert('Error', 'Failed to load delivery details');
      setDetailsModalVisible(false);
    } finally {
      setLoadingDeliveries(false);
      console.log('🏁 Loading finished');
    }
  };

  const handleLoadMore = async () => {
    if (!selectedLink || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const response = await LinkAPI.getLinkDeliveries(selectedLink.id, currentSkip, LIMIT);
      if (response.success && response.data) {
        setDeliveries(prev => [...prev, ...response.data!.deliveries]);
        setHasMore(response.data.pagination.has_more);
        setCurrentSkip(prev => prev + LIMIT);
      } else {
        Alert.alert('Error', response.error || 'Failed to load more deliveries');
      }
    } catch (error) {
      console.error('Error loading more deliveries:', error);
      Alert.alert('Error', 'Failed to load more deliveries');
    } finally {
      setLoadingMore(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'used': return '#4CAF50';
      case 'expired': return '#F44336';
      case 'revoked': return '#9E9E9E';
      default: return '#FFA726';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'used': return 'checkmark-circle';
      case 'expired': return 'time';
      case 'revoked': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderLinkItem = ({ item }: { item: AccessLink }) => (
    <TouchableOpacity 
      style={[styles.linkCard, { backgroundColor: colors.card }]}
      onPress={() => handleViewLinkDetails(item)}
    >
      <View style={styles.linkHeader}>
        <View style={styles.linkInfo}>
          <Text style={[styles.linkName, { color: colors.text }]}>
            {item.name || `${item.link_type === 'tracking_number' ? 'Tracking' : 'Access Code'} Link`}
          </Text>
          <Text style={[styles.deviceName, { color: colors.tabIconDefault }]}>
            Device: {item.device_name || 'Unknown'}
          </Text>
          {item.tracking_number && (
            <Text style={[styles.trackingNumber, { color: colors.tabIconDefault }]}>
              Tracking: {item.tracking_number}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={16} color="#FFF" />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.linkDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color={colors.tabIconDefault} />
          <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
            Deliveries: {item.total_deliveries || 0}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.tabIconDefault} />
          <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
            {item.used_at ? `Used: ${formatDate(item.used_at)}` : `Expires: ${formatDate(item.expires_at)}`}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="key-outline" size={16} color={colors.tabIconDefault} />
          <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
            Uses: {item.current_uses}/{item.max_uses}
          </Text>
        </View>
      </View>
      
      <View style={styles.linkFooter}>
        <Text style={[styles.viewDetailsText, { color: colors.tint }]}>
          View Details →
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDeliveryItem = ({ item }: { item: DeliveryRecord }) => (
    <View style={[styles.deliveryItem, { backgroundColor: colors.background, borderColor: colors.tabIconDefault + '30' }]}>
      <View style={styles.deliveryRow}>
        <Ionicons 
          name={item.device_unlock_successful ? 'checkmark-circle' : 'close-circle'} 
          size={24} 
          color={item.device_unlock_successful ? '#4CAF50' : '#F44336'} 
        />
        <View style={styles.deliveryInfo}>
          <Text style={[styles.deliveryTitle, { color: colors.text }]}>
            {item.device_unlock_successful ? 'Successful Delivery' : 'Failed Attempt'}
          </Text>
          {item.delivery_person_name && (
            <Text style={[styles.deliveryDetail, { color: colors.tabIconDefault }]}>
              By: {item.delivery_person_name}
            </Text>
          )}
          {item.courier_company && (
            <Text style={[styles.deliveryDetail, { color: colors.tabIconDefault }]}>
              Company: {item.courier_company}
            </Text>
          )}
          {item.delivery_person_phone && (
            <Text style={[styles.deliveryDetail, { color: colors.tabIconDefault }]}>
              Phone: {item.delivery_person_phone}
            </Text>
          )}
          {item.completed_at && (
            <Text style={[styles.deliveryDetail, { color: colors.tabIconDefault }]}>
              Time: {formatDate(item.completed_at)}
            </Text>
          )}
          {item.delivery_notes && (
            <Text style={[styles.deliveryNotes, { color: colors.tabIconDefault }]}>
              Notes: {item.delivery_notes}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const DetailsModal = () => (
    <Modal
      visible={detailsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Delivery History
            </Text>
            <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {linkDetails && (
            <View style={[styles.linkSummary, { backgroundColor: colors.background }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                {linkDetails.link_name || 'Access Link'}
              </Text>
              {linkDetails.device_name && (
                <Text style={[styles.summaryDetail, { color: colors.tabIconDefault }]}>
                  Device: {linkDetails.device_name}
                </Text>
              )}
              <Text style={[styles.summaryDetail, { color: colors.tabIconDefault }]}>
                Type: {linkDetails.link_type === 'tracking_number' ? 'Tracking Number' : 'Access Code'}
              </Text>
              {linkDetails.tracking_number && (
                <Text style={[styles.summaryDetail, { color: colors.tabIconDefault }]}>
                  Tracking: {linkDetails.tracking_number}
                </Text>
              )}
              <Text style={[styles.summaryDetail, { color: colors.tabIconDefault }]}>
                Status: {linkDetails.status.toUpperCase()}
              </Text>
              <Text style={[styles.summaryDetail, { color: colors.tabIconDefault }]}>
                Uses: {linkDetails.current_uses}/{linkDetails.max_uses}
              </Text>
              <Text style={[styles.summaryDetail, { color: colors.tabIconDefault }]}>
                Total Deliveries: {totalDeliveries}
              </Text>
            </View>
          )}

          <ScrollView style={styles.modalScrollView}>
            {loadingDeliveries ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>
                  Loading deliveries...
                </Text>
              </View>
            ) : deliveries.length > 0 ? (
              <>
                <FlatList
                  data={deliveries}
                  renderItem={renderDeliveryItem}
                  keyExtractor={(item, index) => item.id || index.toString()}
                  scrollEnabled={false}
                />
                
                {hasMore && (
                  <TouchableOpacity 
                    style={[styles.loadMoreButton, { backgroundColor: colors.tint }]}
                    onPress={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.loadMoreText}>
                          Load More ({deliveries.length} of {totalDeliveries})
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#FFF" />
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {!hasMore && deliveries.length > 0 && (
                  <Text style={[styles.endMessage, { color: colors.tabIconDefault }]}>
                    All {totalDeliveries} {totalDeliveries === 1 ? 'record' : 'records'} loaded
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color={colors.tabIconDefault} />
                <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
                  No delivery records found
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Header title="Deliveries" showBack={true} />
      
      <View style={styles.container}>
        <DetailsModal />
        
        <Text style={[styles.subheader, { color: colors.tabIconDefault }]}>
          View completed and expired access links
        </Text>
      
      {historyLinks.length > 0 ? (
        <FlatList
          data={historyLinks}
          renderItem={renderLinkItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
        >
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              No delivery history yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
              Completed deliveries will appear here
            </Text>
          </View>
        </ScrollView>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  linkCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  linkInfo: {
    flex: 1,
    marginRight: 12,
  },
  linkName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 14,
    marginBottom: 2,
  },
  trackingNumber: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  linkDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },
  linkFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  linkSummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalScrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  deliveryItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  deliveryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  deliveryDetail: {
    fontSize: 13,
    marginBottom: 4,
  },
  deliveryNotes: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 16,
    gap: 8,
  },
  loadMoreText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  endMessage: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});
