import { createLinkWithDuration, generateShareableURL, getDeviceLinks } from '@/api';
import { AccessLink } from '@/api/links';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
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
  
  const { selectedDevice, isAuthenticated, isLoading } = useAppStore();
  const [links, setLinks] = useState<AccessLink[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [duration, setDuration] = useState('24');

  useEffect(() => {
    if (isAuthenticated && selectedDevice) {
      loadLinks();
    }
  }, [isAuthenticated, selectedDevice]);

  const loadLinks = async () => {
    if (!selectedDevice || !isAuthenticated) return;

    try {
      const response = await getDeviceLinks(selectedDevice.id);
      if (response.success && response.data) {
        setLinks(response.data);
      } else {
        console.error('Failed to load links:', response.error);
      }
    } catch (error) {
      console.error('Error loading links:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLinks();
    setRefreshing(false);
  };

  const handleCreateLink = async () => {
    if (!selectedDevice || !isAuthenticated) return;

    setCreating(true);
    try {
      const durationHours = parseInt(duration) || 24;
      const response = await createLinkWithDuration(
        selectedDevice.id,
        `Link created ${new Date().toLocaleDateString()}`,
        durationHours
      );
      
      if (response.success && response.data) {
        Alert.alert('Success', 'Access link created successfully!');
        setModalVisible(false);
        await loadLinks(); // Refresh the list
      } else {
        Alert.alert('Error', response.error || 'Failed to create link');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the link');
      console.error('Error creating link:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleShareLink = async (link: AccessLink) => {
    try {
      const shareableURL = generateShareableURL(link.link_token);
      const message = `Access Link for ${selectedDevice?.name || 'Device'}:\n\n${shareableURL}\n\nValid until: ${new Date(link.expires_at).toLocaleString()}\nMax uses: ${link.max_uses}`;
      
      await Share.share({
        message,
        title: 'Device Access Link',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share link');
      console.error('Share error:', error);
    }
  };

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

  const renderLinkItem = ({ item }: { item: AccessLink }) => {
    const active = isLinkActive(item);
    
    return (
      <View style={[styles.linkCard, { backgroundColor: colors.card }]}>
        <View style={styles.linkHeader}>
          <View style={styles.linkInfo}>
            <Text style={[styles.linkCode, { color: colors.text }]}>
              {item.link_token.substring(0, 8)}...{item.link_token.substring(item.link_token.length - 4)}
            </Text>
            <Text style={[styles.linkPassword, { color: colors.tabIconDefault }]}>
              {item.name || 'Unnamed Link'}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: active ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>
              {active ? 'Active' : 'Expired'}
            </Text>
          </View>
        </View>
        
        <View style={styles.linkDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.tabIconDefault} />
            <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
              Valid until: {formatDate(item.expires_at)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.tabIconDefault} />
            <Text style={[styles.detailText, { color: colors.tabIconDefault }]}>
              Created: {formatDate(item.created_at)}
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

        {active && (
          <View style={styles.linkActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.tint }]}
              onPress={() => handleShareLink(item)}
            >
              <Ionicons name="share-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const CreateLinkModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Create Access Link
          </Text>
          
          <Text style={[styles.modalLabel, { color: colors.text }]}>
            Duration (hours):
          </Text>
          
          <TextInput
            style={[
              styles.modalInput,
              { 
                backgroundColor: colors.background,
                borderColor: colors.tabIconDefault + '40',
                color: colors.text
              }
            ]}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="24"
            placeholderTextColor={colors.tabIconDefault}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.tabIconDefault }]}
              onPress={() => setModalVisible(false)}
              disabled={creating}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={handleCreateLink}
              disabled={creating}
            >
              <Text style={styles.modalButtonText}>
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Ionicons name="person-outline" size={64} color={colors.tabIconDefault} />
        <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
          Please sign in to manage access links
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
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CreateLinkModal />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Access Links for {selectedDevice.name || 'Device'}
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={() => setModalVisible(true)}
          disabled={isLoading}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
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
        />
      ) : (
        <View style={[styles.centerContent, { flex: 1 }]}>
          <Ionicons name="link-outline" size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            No access links found
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
            Create a link to share device access
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
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
  linkCode: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  linkPassword: {
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
    fontSize: 14,
  },
  linkActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 300,
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
