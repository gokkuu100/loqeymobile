import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { LinkAPI, DeliveryRecord, AccessLink } from '@/api/links';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DeliveryDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [delivery, setDelivery] = useState<DeliveryRecord | null>(null);
  const [linkInfo, setLinkInfo] = useState<AccessLink | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveryDetails();
  }, []);

  const loadDeliveryDetails = async () => {
    setLoading(true);
    try {
      const deliveryId = params.deliveryId as string;
      console.log('📦 Loading delivery details for:', deliveryId);
      
      // Fetch all links and find the delivery
      const linksResponse = await LinkAPI.getLinks();
      
      if (linksResponse.success && linksResponse.data) {
        console.log(`🔍 Searching through ${linksResponse.data.length} links...`);
        
        for (const link of linksResponse.data) {
          try {
            // Use max limit of 50 (API constraint)
            const deliveryResponse = await LinkAPI.getLinkDeliveries(link.id, 0, 50);
            
            if (deliveryResponse.success && deliveryResponse.data) {
              const foundDelivery = deliveryResponse.data.deliveries.find(
                d => d.id === deliveryId
              );
              
              if (foundDelivery) {
                console.log('✅ Found delivery in link:', link.name || link.id);
                
                // Add device name from response
                const deliveryWithDevice = {
                  ...foundDelivery,
                  device_name: deliveryResponse.data.device_name || foundDelivery.device_name,
                };
                
                setDelivery(deliveryWithDevice);
                setLinkInfo(link);
                break;
              }
              
              // If not found and there are more deliveries, check next pages
              let currentSkip = 50;
              while (deliveryResponse.data.pagination.has_more && currentSkip < 200) {
                const moreResponse = await LinkAPI.getLinkDeliveries(link.id, currentSkip, 50);
                if (moreResponse.success && moreResponse.data) {
                  const foundInMore = moreResponse.data.deliveries.find(
                    d => d.id === deliveryId
                  );
                  
                  if (foundInMore) {
                    console.log('✅ Found delivery in link (page 2+):', link.name || link.id);
                    const deliveryWithDevice = {
                      ...foundInMore,
                      device_name: moreResponse.data.device_name || foundInMore.device_name,
                    };
                    setDelivery(deliveryWithDevice);
                    setLinkInfo(link);
                    return; // Exit early
                  }
                  
                  currentSkip += 50;
                  if (!moreResponse.data.pagination.has_more) break;
                } else {
                  break;
                }
              }
            }
          } catch (linkError) {
            console.error(`⚠️ Error checking link ${link.id}:`, linkError);
            // Continue with other links
          }
        }
        
        if (!delivery) {
          console.warn('⚠️ Delivery not found in any link');
        }
      } else {
        console.error('❌ Failed to load links:', linksResponse.error);
      }
    } catch (error) {
      console.error('❌ Error loading delivery details:', error);
      Alert.alert('Error', 'Failed to load delivery details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>
              Loading delivery details...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!delivery) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              Delivery not found
            </Text>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.tint }]}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Delivery Details
          </Text>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeader}>
            <Ionicons
              name={delivery.device_unlock_successful ? 'checkmark-circle' : 'close-circle'}
              size={48}
              color={delivery.device_unlock_successful ? '#4CAF50' : '#F44336'}
            />
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {delivery.device_unlock_successful ? 'Successful Delivery' : 'Failed Delivery Attempt'}
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.tabIconDefault }]}>
                {formatDate(delivery.completed_at || delivery.attempted_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Device Information */}
        {delivery.device_name && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Device Information
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="cube" size={20} color={colors.tint} />
              <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Device Name:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{delivery.device_name}</Text>
            </View>
            {delivery.device_serial && (
              <View style={styles.infoRow}>
                <Ionicons name="barcode" size={20} color={colors.tint} />
                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Serial:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{delivery.device_serial}</Text>
              </View>
            )}
          </View>
        )}

        {/* Delivery Person Information */}
        {(delivery.delivery_person_name || delivery.courier_company || delivery.delivery_person_phone) && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Delivery Personnel
            </Text>
            {delivery.delivery_person_name && (
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color={colors.tint} />
                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Name:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{delivery.delivery_person_name}</Text>
              </View>
            )}
            {delivery.delivery_person_id && (
              <View style={styles.infoRow}>
                <Ionicons name="card" size={20} color={colors.tint} />
                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>ID:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{delivery.delivery_person_id}</Text>
              </View>
            )}
            {delivery.courier_company && (
              <View style={styles.infoRow}>
                <Ionicons name="business" size={20} color={colors.tint} />
                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Company:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{delivery.courier_company}</Text>
              </View>
            )}
            {delivery.delivery_person_phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={colors.tint} />
                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Phone:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{delivery.delivery_person_phone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tracking Information */}
        {delivery.tracking_number && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tracking Information
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="locate" size={20} color={colors.tint} />
              <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Tracking Number:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{delivery.tracking_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.tint} />
              <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Code Verified:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {delivery.code_verified ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Timeline
          </Text>
          {delivery.attempted_at && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.tint }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, { color: colors.tabIconDefault }]}>
                  Attempted
                </Text>
                <Text style={[styles.timelineValue, { color: colors.text }]}>
                  {formatDate(delivery.attempted_at)}
                </Text>
              </View>
            </View>
          )}
          {delivery.completed_at && (
            <View style={styles.timelineItem}>
              <View style={[
                styles.timelineDot,
                { backgroundColor: delivery.device_unlock_successful ? '#4CAF50' : '#F44336' }
              ]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, { color: colors.tabIconDefault }]}>
                  {delivery.device_unlock_successful ? 'Completed' : 'Failed'}
                </Text>
                <Text style={[styles.timelineValue, { color: colors.text }]}>
                  {formatDate(delivery.completed_at)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        {delivery.delivery_notes && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Delivery Notes
            </Text>
            <Text style={[styles.notesText, { color: colors.text }]}>
              {delivery.delivery_notes}
            </Text>
          </View>
        )}

        {/* Link Information */}
        {linkInfo && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Access Link Information
            </Text>
            {linkInfo.name && (
              <View style={styles.infoRow}>
                <Ionicons name="link" size={20} color={colors.tint} />
                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Link Name:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{linkInfo.name}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="key" size={20} color={colors.tint} />
              <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Link Type:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {linkInfo.link_type === 'tracking_number' ? 'Tracking Number' : 'Access Code'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
