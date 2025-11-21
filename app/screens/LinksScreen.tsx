import { 
  createTrackingNumberLink, 
  createAccessCodeLink,
  generateShareableURL, 
  getDeviceLinks,
  revokeLink,
  formatTrackingInstructions,
  formatAccessCodeInstructions,
  AccessLink, 
  LinkType 
} from '@/api/links';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LinksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Use selectors to prevent unnecessary re-renders
  // Only subscribe to the specific pieces of state we need
  const selectedDevice = useAppStore((state) => state.selectedDevice);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const links = useAppStore((state) => state.accessLinks);  // Real-time updates via WebSocket
  const loadLinksFromStore = useAppStore((state) => state.loadLinks);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Modal states
  const [formModalVisible, setFormModalVisible] = useState(false);
  
  // Form state
  const [linkType, setLinkType] = useState<LinkType>('tracking_number');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [linkName, setLinkName] = useState('');
  const [duration, setDuration] = useState('24');
  const [maxUses, setMaxUses] = useState('1');

  // Track if we've already handled the params to prevent reopening
  const paramsHandled = useRef(false);

  // Memoize the selectedDeviceId and name to prevent unnecessary reloads
  const selectedDeviceId = useMemo(() => selectedDevice?.id, [selectedDevice?.id]);
  const selectedDeviceName = useMemo(() => selectedDevice?.name, [selectedDevice?.name]);

  useEffect(() => {
    if (isAuthenticated && selectedDeviceId) {
      loadLinks();
    }
  }, [isAuthenticated, selectedDeviceId]);

  // Handle navigation from homepage - only once per param change
  useEffect(() => {
    if (params.createLinkType && selectedDeviceId && !paramsHandled.current) {
      const type = params.createLinkType as LinkType;
      console.log('📝 Opening form for link type:', type);
      setLinkType(type);
      setFormModalVisible(true);
      paramsHandled.current = true;
      
      // Clear the params after handling to prevent re-triggering
      // Use setTimeout to ensure the modal opens first
      setTimeout(() => {
        router.setParams({ createLinkType: undefined });
      }, 100);
    }
  }, [params.createLinkType, selectedDeviceId]);

  // Reset paramsHandled when modal is closed manually
  useEffect(() => {
    if (!formModalVisible) {
      paramsHandled.current = false;
    }
  }, [formModalVisible]);

  const loadLinks = useCallback(async () => {
    if (!selectedDeviceId || !isAuthenticated) return;
    await loadLinksFromStore(selectedDeviceId);
  }, [selectedDeviceId, isAuthenticated, loadLinksFromStore]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLinks();
    setRefreshing(false);
  }, [loadLinks]);

  const resetForm = useCallback(() => {
    setLinkType('tracking_number');
    setTrackingNumber('');
    setAccessCode('');
    setLinkName('');
    setDuration('24');
    setMaxUses('1');
  }, []);

  const handleCreateLink = useCallback(async () => {
    if (!selectedDeviceId || !isAuthenticated) return;

    // Validation
    if (linkType === 'tracking_number' && !trackingNumber.trim()) {
      Alert.alert('Error', 'Please enter a tracking number');
      return;
    }

    if (linkType === 'access_code' && !accessCode.trim()) {
      Alert.alert('Error', 'Please enter an access code');
      return;
    }

    if (linkType === 'access_code' && accessCode.length < 4) {
      Alert.alert('Error', 'Access code must be at least 4 characters');
      return;
    }

    const durationHours = parseInt(duration, 10);
    const maxUsesNum = parseInt(maxUses, 10);

    if (isNaN(durationHours) || durationHours <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    if (isNaN(maxUsesNum) || maxUsesNum <= 0) {
      Alert.alert('Error', 'Please enter a valid number of max uses');
      return;
    }

    setCreating(true);

    try {
      let response;

      if (linkType === 'tracking_number') {
        response = await createTrackingNumberLink(
          selectedDeviceId,
          trackingNumber,
          linkName || `Delivery - ${trackingNumber.substring(0, 8)}`,
          durationHours,
          maxUsesNum
        );
      } else {
        response = await createAccessCodeLink(
          selectedDeviceId,
          accessCode,
          linkName || 'Courier Delivery',
          durationHours,
          maxUsesNum
        );
      }

      if (response.success && response.data) {
        Alert.alert(
          'Success!',
          `Link created successfully!\n\nShare this link with your delivery person.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setFormModalVisible(false);
                resetForm();
                loadLinks();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to create link');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
      console.error('Error creating link:', error);
    } finally {
      setCreating(false);
    }
  }, [selectedDeviceId, isAuthenticated, linkType, trackingNumber, accessCode, linkName, duration, maxUses, loadLinks, resetForm]);

  const handleShareLink = useCallback(async (link: AccessLink) => {
    try {
      // Always generate fresh URL to ensure we use current domain
      const shareableURL = generateShareableURL(link.link_token);
      
      let message;
      if (link.link_type === 'tracking_number') {
        message = `Delivery Instructions:\n\nUse this link to unlock the delivery box:\n${shareableURL}\n\nTracking Number: ${link.tracking_number}\n\nValid until: ${new Date(link.expires_at).toLocaleString()}`;
      } else {
        message = `Delivery Access Link:\n${shareableURL}\n\nYou'll need the access code I provided.\n\nValid until: ${new Date(link.expires_at).toLocaleString()}`;
      }
      
      await Share.share({
        message,
        title: `Delivery Link - ${selectedDeviceName}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share link');
      console.error('Share error:', error);
    }
  }, [selectedDeviceName]);

  const handleCopyLink = useCallback((link: AccessLink) => {
    // Always generate fresh URL to ensure we use current domain
    const url = generateShareableURL(link.link_token);
    Clipboard.setString(url);
    Alert.alert('Copied!', 'Link URL copied to clipboard');
  }, []);

  const handleRevokeLink = useCallback((link: AccessLink) => {
    Alert.alert(
      'Revoke Link',
      'Are you sure you want to revoke this link? It will no longer work.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await revokeLink(link.id);
              if (response.success) {
                Alert.alert('Success', 'Link revoked successfully');
                await loadLinks();
              } else {
                Alert.alert('Error', response.error || 'Failed to revoke link');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred');
              console.error('Error revoking link:', error);
            }
          }
        }
      ]
    );
  }, [loadLinks]);

  const handleViewLinkDetails = useCallback((link: AccessLink) => {
    router.push({
      pathname: '/link-detail',
      params: { id: link.id }
    });
  }, [router]);

  const isLinkActive = (link: AccessLink): boolean => {
    return link.status === 'active' && new Date(link.expires_at) > new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLinkTypeIcon = (type: LinkType) => {
    return type === 'tracking_number' ? 'barcode-outline' : 'key-outline';
  };

  const getLinkTypeBadgeColor = (type: LinkType) => {
    return type === 'tracking_number' ? '#2196F3' : '#9C27B0';
  };

  const renderLinkItem = useCallback(({ item }: { item: AccessLink }) => {
    const active = isLinkActive(item);
    
    return (
      <View style={[styles.linkCard, { backgroundColor: colors.card }]}>
        <View style={styles.linkHeader}>
          <View style={styles.linkInfo}>
            <View style={styles.linkTitleRow}>
              <Ionicons 
                name={getLinkTypeIcon(item.link_type)} 
                size={20} 
                color={getLinkTypeBadgeColor(item.link_type)} 
              />
              <Text style={[styles.linkName, { color: colors.text }]}>
                {item.name || 'Unnamed Link'}
              </Text>
            </View>
            {item.link_type === 'tracking_number' && item.tracking_number && (
              <Text style={[styles.trackingNumber, { color: colors.tabIconDefault }]}>
                📦 {item.tracking_number}
              </Text>
            )}
            <Text style={[styles.linkToken, { color: colors.tabIconDefault }]}>
              Token: {item.link_token.substring(0, 12)}...
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[
              styles.linkTypeBadge,
              { backgroundColor: getLinkTypeBadgeColor(item.link_type) }
            ]}>
              <Text style={styles.badgeText}>
                {item.link_type === 'tracking_number' ? 'Tracking' : 'Code'}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: active ? '#4CAF50' : '#F44336' }
            ]}>
              <Text style={styles.badgeText}>
                {active ? 'Active' : item.status}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.linkDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.tabIconDefault} />
            <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
              Expires: {formatDate(item.expires_at)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="repeat-outline" size={16} color={colors.tabIconDefault} />
            <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
              Uses: {item.current_uses} / {item.max_uses}
            </Text>
          </View>
          {item.used_at && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.tabIconDefault} />
              <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
                Last used: {formatDate(item.used_at)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.linkActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
            onPress={() => handleViewLinkDetails(item)}
          >
            <Ionicons name="information-circle-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
          {active && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={() => handleShareLink(item)}
              >
                <Ionicons name="share-outline" size={18} color="white" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tabIconDefault }]}
                onPress={() => handleCopyLink(item)}
              >
                <Ionicons name="copy-outline" size={18} color="white" />
                <Text style={styles.actionButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => handleRevokeLink(item)}
              >
                <Ionicons name="ban-outline" size={18} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }, [colors, handleShareLink, handleCopyLink, handleRevokeLink, handleViewLinkDetails]);

  // Memoize colors to prevent re-renders
  const cardBackgroundColor = useMemo(() => colors.card, [colors.card]);
  const backgroundColor = useMemo(() => colors.background, [colors.background]);
  const textColor = useMemo(() => colors.text, [colors.text]);
  const tabIconColor = useMemo(() => colors.tabIconDefault, [colors.tabIconDefault]);

  // Memoize modal close handler
  const handleModalClose = useCallback(() => {
    setFormModalVisible(false);
    resetForm();
  }, [resetForm]);

  // Form Modal - Memoized to prevent re-renders
  const FormModal = useMemo(() => (
    <Modal
      visible={formModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.formModalContent, { backgroundColor: cardBackgroundColor }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formHeader}>
              <View style={[
                styles.formIconContainer, 
                { backgroundColor: linkType === 'tracking_number' ? '#2196F3' : '#9C27B0' }
              ]}>
                <Ionicons 
                  name={linkType === 'tracking_number' ? 'barcode-outline' : 'key-outline'} 
                  size={28} 
                  color="white" 
                />
              </View>
              <Text style={[styles.formTitle, { color: textColor }]}>
                {linkType === 'tracking_number' ? 'Tracking Number Link' : 'Access Code Link'}
              </Text>
            </View>

            {linkType === 'tracking_number' ? (
              <>
                <Text style={[styles.formLabel, { color: textColor }]}>
                  Tracking Number *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: backgroundColor,
                    borderColor: tabIconColor + '40',
                    color: textColor
                  }]}
                  value={trackingNumber}
                  onChangeText={setTrackingNumber}
                  placeholder="e.g., 1234567890ABC"
                  placeholderTextColor={tabIconColor}
                  autoCapitalize="characters"
                />
                <Text style={[styles.helperText, { color: tabIconColor }]}>
                  Copy this from your shopping site (Amazon, Alibaba, etc.)
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.formLabel, { color: textColor }]}>
                  Access Code *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: backgroundColor,
                    borderColor: tabIconColor + '40',
                    color: textColor
                  }]}
                  value={accessCode}
                  onChangeText={setAccessCode}
                  placeholder="Create a 4+ character code"
                  placeholderTextColor={tabIconColor}
                  autoCapitalize="none"
                />
                <Text style={[styles.helperText, { color: tabIconColor }]}>
                  Share this code with your delivery person
                </Text>
              </>
            )}

            <Text style={[styles.formLabel, { color: textColor }]}>
              Link Name (Optional)
            </Text>
            <TextInput
              style={[styles.formInput, { 
                backgroundColor: backgroundColor,
                borderColor: tabIconColor + '40',
                color: textColor
              }]}
              value={linkName}
              onChangeText={setLinkName}
              placeholder={linkType === 'tracking_number' ? "e.g., Amazon Order" : "e.g., Courier Package"}
              placeholderTextColor={tabIconColor}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.formLabel, { color: textColor }]}>
                  Valid For (hours)
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: backgroundColor,
                    borderColor: tabIconColor + '40',
                    color: textColor
                  }]}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="24"
                  placeholderTextColor={tabIconColor}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.formLabel, { color: textColor }]}>
                  Max Uses
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: backgroundColor,
                    borderColor: tabIconColor + '40',
                    color: textColor
                  }]}
                  value={maxUses}
                  onChangeText={setMaxUses}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={tabIconColor}
                />
              </View>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: tabIconColor + '30' }]}
                onPress={handleModalClose}
                disabled={creating}
              >
                <Text style={[styles.formButtonText, { color: textColor }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.formButton, { 
                  backgroundColor: linkType === 'tracking_number' ? '#2196F3' : '#9C27B0',
                  opacity: creating ? 0.7 : 1
                }]}
                onPress={handleCreateLink}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.formButtonTextWhite}>
                    Create Link
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  ), [
    formModalVisible,
    handleModalClose,
    cardBackgroundColor,
    backgroundColor,
    textColor,
    tabIconColor,
    linkType,
    trackingNumber,
    accessCode,
    linkName,
    duration,
    maxUses,
    creating,
    handleCreateLink
  ]);

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Ionicons name="person-outline" size={64} color={colors.tabIconDefault} />
        <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
          Please sign in to manage delivery links
        </Text>
      </View>
    );
  }

  if (!selectedDevice) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Ionicons name="cube-outline" size={64} color={colors.tabIconDefault} />
        <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
          No device selected
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
          Select a device to manage delivery links
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {FormModal}
      
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Delivery Links
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.tabIconDefault }]}>
            {selectedDeviceName}
          </Text>
        </View>
      </View>

      {links.length > 0 ? (
        <FlatList
          data={links}
          renderItem={renderLinkItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.tint]}
            />
          }
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      ) : (
        <View style={[styles.centerContent, { flex: 1 }]}>
          <Ionicons name="link-outline" size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            No delivery links found
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
            Tap + to create your first link
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
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
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
  },
  linkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  linkName: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackingNumber: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  linkToken: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  statusContainer: {
    gap: 6,
    alignItems: 'flex-end',
  },
  linkTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  linkActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Form Modal Styles
  formModalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    padding: 24,
    borderRadius: 20,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  formIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 11,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  formButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formButtonTextWhite: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
