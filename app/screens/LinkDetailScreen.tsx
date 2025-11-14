import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AccessLink } from '@/api/links';
import { useAppStore } from '@/store';

export default function LinkDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const linkId = params.id as string;

  const [link, setLink] = useState<AccessLink | null>(null);
  const [loading, setLoading] = useState(true);

  const links = useAppStore((state) => state.accessLinks);

  useEffect(() => {
    loadLinkDetails();
  }, [linkId, links]);

  const loadLinkDetails = () => {
    setLoading(true);
    const foundLink = links.find((l) => l.id === linkId);
    setLink(foundLink || null);
    setLoading(false);
  };

  const handleCopyLink = () => {
    if (link?.link_url) {
      Clipboard.setString(link.link_url);
      Alert.alert('Copied!', 'Link URL copied to clipboard');
    }
  };

  const handleCopyAccessCode = () => {
    if (link?.tracking_number) {
      // For access_code type links, tracking_number field might store the PIN
      // Need to check with backend implementation
      Clipboard.setString(link.tracking_number);
      Alert.alert('Copied!', 'Access code copied to clipboard');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'used':
        return '#6B7280';
      case 'expired':
        return '#EF4444';
      case 'revoked':
        return '#DC2626';
      default:
        return colors.text;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading link details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!link) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Link Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="link-outline" size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Link not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Link Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(link.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(link.status) },
                ]}
              >
                {link.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.typeBadge}>
              <Ionicons
                name={link.link_type === 'tracking_number' ? 'cube-outline' : 'keypad-outline'}
                size={16}
                color={colors.text}
              />
              <Text style={[styles.typeBadgeText, { color: colors.text }]}>
                {link.link_type === 'tracking_number' ? 'Tracking' : 'Access Code'}
              </Text>
            </View>
          </View>
        </View>

        {/* Link Name */}
        {link.name && (
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Link Name</Text>
            <Text style={[styles.valueText, { color: colors.text }]}>{link.name}</Text>
          </View>
        )}

        {/* Link URL */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shareable Link</Text>
          <View style={styles.linkUrlContainer}>
            <Text style={[styles.linkUrlText, { color: colors.tint }]} numberOfLines={2}>
              {link.link_url || 'N/A'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.copyButton, { backgroundColor: colors.tint }]}
            onPress={handleCopyLink}
          >
            <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
            <Text style={styles.copyButtonText}>Copy Link</Text>
          </TouchableOpacity>
        </View>

        {/* Tracking Number (for tracking_number type) */}
        {link.link_type === 'tracking_number' && link.tracking_number && (
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tracking Number</Text>
            <Text style={[styles.valueText, { color: colors.text }]}>
              {link.tracking_number}
            </Text>
          </View>
        )}

        {/* Access Code/PIN (for access_code type) */}
        {link.link_type === 'access_code' && (
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Access Code (PIN)</Text>
            {link.tracking_number ? (
              <>
                <View style={styles.accessCodeContainer}>
                  <Text style={[styles.accessCodeText, { color: colors.text }]}>
                    {link.tracking_number}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCopyAccessCode}
                    style={styles.copyIconButton}
                  >
                    <Ionicons name="copy-outline" size={20} color={colors.tint} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.helperText, { color: colors.tabIconDefault }]}>
                  Share this code with your delivery person
                </Text>
              </>
            ) : (
              <View style={styles.securityNotice}>
                <Ionicons name="lock-closed" size={20} color="#F59E0B" />
                <Text style={[styles.securityText, { color: colors.tabIconDefault }]}>
                  Access code is securely hashed and not retrievable after creation. It was only visible once when the link was first created.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Device Info */}
        {link.device_name && (
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Device</Text>
            <Text style={[styles.valueText, { color: colors.text }]}>
              {link.device_name}
            </Text>
            {link.device_serial && (
              <Text style={[styles.subValueText, { color: colors.tabIconDefault }]}>
                Serial: {link.device_serial}
              </Text>
            )}
          </View>
        )}

        {/* Usage Stats */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Usage Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                Current Uses
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {link.current_uses}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                Max Uses
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {link.max_uses}
              </Text>
            </View>
            {link.total_deliveries !== undefined && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                    Total Deliveries
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {link.total_deliveries}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Timestamps */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
          
          <View style={styles.timelineItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.tabIconDefault} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineLabel, { color: colors.tabIconDefault }]}>
                Created
              </Text>
              <Text style={[styles.timelineValue, { color: colors.text }]}>
                {formatDate(link.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <Ionicons name="time-outline" size={16} color={colors.tabIconDefault} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineLabel, { color: colors.tabIconDefault }]}>
                Expires
              </Text>
              <Text style={[styles.timelineValue, { color: colors.text }]}>
                {formatDate(link.expires_at)}
              </Text>
            </View>
          </View>

          {link.used_at && (
            <View style={styles.timelineItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.tabIconDefault} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, { color: colors.tabIconDefault }]}>
                  Used
                </Text>
                <Text style={[styles.timelineValue, { color: colors.text }]}>
                  {formatDate(link.used_at)}
                </Text>
              </View>
            </View>
          )}

          {link.updated_at && (
            <View style={styles.timelineItem}>
              <Ionicons name="refresh-outline" size={16} color={colors.tabIconDefault} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, { color: colors.tabIconDefault }]}>
                  Last Updated
                </Text>
                <Text style={[styles.timelineValue, { color: colors.text }]}>
                  {formatDate(link.updated_at)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Link Token */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Link Token</Text>
          <Text style={[styles.tokenText, { color: colors.tabIconDefault }]} selectable>
            {link.link_token}
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueText: {
    fontSize: 16,
    lineHeight: 24,
  },
  subValueText: {
    fontSize: 14,
    marginTop: 4,
  },
  linkUrlContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  linkUrlText: {
    fontSize: 14,
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  accessCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  accessCodeText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  copyIconButton: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timelineContent: {
    marginLeft: 12,
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
