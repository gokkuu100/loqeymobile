import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { useAppStore } from '@/store';
import { NotificationAPI, NotificationHistory } from '@/api/notifications';
import { useFocusEffect } from '@react-navigation/native';

export default function NotificationListScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState(false);

    const LIMIT = 20;

    // Load notifications
    const loadNotifications = async (skipCount: number = 0, append: boolean = false) => {
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const response = await NotificationAPI.getHistory(skipCount, LIMIT);
            const { notifications: newNotifications, total: totalCount } = response.data;

            if (append) {
                setNotifications(prev => [...prev, ...newNotifications]);
            } else {
                setNotifications(newNotifications);
            }

            setTotal(totalCount);
            setSkip(skipCount);
            setHasMore(skipCount + newNotifications.length < totalCount);
        } catch (error: any) {
            console.error('Failed to load notifications:', error);
            Alert.alert('Error', 'Failed to load notifications');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadNotifications(0, false);
    }, []);

    // Reload when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadNotifications(0, false);
            // Mark all as read when screen is opened
            handleMarkAllAsRead(true); // Silent mode
        }, [])
    );

    // Handle refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        loadNotifications(0, false);
    };

    // Handle load more
    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore && notifications.length > 0) {
            loadNotifications(skip + LIMIT, true);
        }
    };

    // Mark all as read (silent = no alert)
    const handleMarkAllAsRead = async (silent: boolean = false) => {
        try {
            await NotificationAPI.markAsRead();
            
            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );

            // Update unread count in store
            const store = useAppStore.getState();
            store.setUnreadNotificationCount(0);

            if (!silent) {
                Alert.alert('Success', 'All notifications marked as read');
            }
        } catch (error: any) {
            if (!silent) {
                console.error('Failed to mark as read:', error);
                Alert.alert('Error', 'Failed to mark notifications as read');
            }
        }
    };

    // Mark selected as read
    const handleMarkSelectedAsRead = async () => {
        if (selectedIds.size === 0) return;

        try {
            await NotificationAPI.markAsRead(Array.from(selectedIds));
            
            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    selectedIds.has(n.id)
                        ? { ...n, is_read: true, read_at: new Date().toISOString() }
                        : n
                )
            );

            // Update unread count
            const unreadCount = notifications.filter(n => !n.is_read && !selectedIds.has(n.id)).length;
            const store = useAppStore.getState();
            store.setUnreadNotificationCount(unreadCount);

            setSelectedIds(new Set());
            setSelectionMode(false);
            Alert.alert('Success', 'Notifications marked as read');
        } catch (error: any) {
            console.error('Failed to mark as read:', error);
            Alert.alert('Error', 'Failed to mark notifications as read');
        }
    };

    // Delete selected notifications
    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;

        Alert.alert(
            'Delete Notifications',
            `Are you sure you want to delete ${selectedIds.size} notification(s)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await NotificationAPI.deleteNotifications(Array.from(selectedIds));
                            
                            // Remove from local state
                            setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
                            setTotal(prev => prev - selectedIds.size);

                            // Update unread count
                            const deletedUnreadCount = notifications.filter(
                                n => selectedIds.has(n.id) && !n.is_read
                            ).length;
                            const store = useAppStore.getState();
                            store.setUnreadNotificationCount(
                                Math.max(0, store.unreadNotificationCount - deletedUnreadCount)
                            );

                            setSelectedIds(new Set());
                            setSelectionMode(false);
                            Alert.alert('Success', 'Notifications deleted');
                        } catch (error: any) {
                            console.error('Failed to delete notifications:', error);
                            Alert.alert('Error', 'Failed to delete notifications');
                        }
                    },
                },
            ]
        );
    };

    // Delete all notifications
    const handleDeleteAll = async () => {
        Alert.alert(
            'Delete All Notifications',
            'Are you sure you want to delete all notifications? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await NotificationAPI.deleteNotifications();
                            
                            setNotifications([]);
                            setTotal(0);

                            // Reset unread count
                            const store = useAppStore.getState();
                            store.setUnreadNotificationCount(0);

                            Alert.alert('Success', 'All notifications deleted');
                        } catch (error: any) {
                            console.error('Failed to delete all notifications:', error);
                            Alert.alert('Error', 'Failed to delete notifications');
                        }
                    },
                },
            ]
        );
    };

    // Toggle selection
    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Select all
    const handleSelectAll = () => {
        if (selectedIds.size === notifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(notifications.map(n => n.id)));
        }
    };

    // Get notification icon
    const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'delivery_unlock':
                return 'lock-open-outline';
            case 'low_battery':
                return 'battery-dead-outline';
            case 'failed_unlock':
                return 'warning-outline';
            case 'link_used':
                return 'link-outline';
            case 'device_status':
                return 'hardware-chip-outline';
            default:
                return 'notifications-outline';
        }
    };

    // Get notification color
    const getNotificationColor = (type: string): string => {
        switch (type) {
            case 'delivery_unlock':
                return '#4CAF50';
            case 'low_battery':
                return '#F44336';
            case 'failed_unlock':
                return '#FF9800';
            case 'link_used':
                return colors.tint;
            case 'device_status':
                return '#2196F3';
            default:
                return colors.tabIconDefault;
        }
    };

    // Format time ago
    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Render notification item
    const renderNotification = ({ item }: { item: NotificationHistory }) => {
        const isSelected = selectedIds.has(item.id);
        const iconName = getNotificationIcon(item.notification_type);
        const iconColor = getNotificationColor(item.notification_type);

        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    { backgroundColor: colors.card },
                    !item.is_read && styles.unreadItem,
                    isSelected && { backgroundColor: colors.tint + '20' },
                ]}
                onPress={() => {
                    if (selectionMode) {
                        toggleSelection(item.id);
                    }
                }}
                onLongPress={() => {
                    setSelectionMode(true);
                    toggleSelection(item.id);
                }}
            >
                {selectionMode && (
                    <View style={styles.checkbox}>
                        <Ionicons
                            name={isSelected ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={isSelected ? colors.tint : colors.tabIconDefault}
                        />
                    </View>
                )}

                <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                    <Ionicons name={iconName} size={24} color={iconColor} />
                </View>

                <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                        <Text
                            style={[
                                styles.notificationTitle,
                                { color: colors.text },
                                !item.is_read && styles.unreadText,
                            ]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
                    </View>

                    <Text
                        style={[styles.notificationBody, { color: colors.tabIconDefault }]}
                        numberOfLines={2}
                    >
                        {item.body}
                    </Text>

                    <Text style={[styles.notificationTime, { color: colors.tabIconDefault }]}>
                        {formatTimeAgo(item.sent_at)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Render empty state
    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color={colors.tabIconDefault} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
                <Text style={[styles.emptySubtitle, { color: colors.tabIconDefault }]}>
                    You're all caught up! Notifications will appear here.
                </Text>
            </View>
        );
    };

    // Render footer
    const renderFooter = () => {
        if (!isLoadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.tint} />
                <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>Loading more...</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <Header
                title="Notifications"
                showBack={true}
                rightContent={
                    !selectionMode && notifications.length > 0 ? (
                        <TouchableOpacity onPress={() => setSelectionMode(true)}>
                            <Text style={[styles.headerButton, { color: colors.tint }]}>Select</Text>
                        </TouchableOpacity>
                    ) : null
                }
            />

            {/* Selection Mode Actions */}
            {selectionMode && (
                <View style={[styles.selectionBar, { backgroundColor: colors.card }]}>
                    <TouchableOpacity style={styles.selectionAction} onPress={handleSelectAll}>
                        <Text style={[styles.selectionText, { color: colors.tint }]}>
                            {selectedIds.size === notifications.length ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={[styles.selectionCount, { color: colors.text }]}>
                        {selectedIds.size} selected
                    </Text>

                    <View style={styles.selectionActions}>
                        {selectedIds.size > 0 && (
                            <>
                                <TouchableOpacity
                                    style={styles.selectionAction}
                                    onPress={handleMarkSelectedAsRead}
                                >
                                    <Ionicons name="checkmark-done-outline" size={20} color={colors.tint} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.selectionAction}
                                    onPress={handleDeleteSelected}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.selectionAction}
                            onPress={() => {
                                setSelectionMode(false);
                                setSelectedIds(new Set());
                            }}
                        >
                            <Text style={[styles.selectionText, { color: colors.tabIconDefault }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Action Buttons */}
            {!selectionMode && notifications.length > 0 && (
                <View style={[styles.actionBar, { backgroundColor: colors.card }]}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleMarkAllAsRead(false)}>
                        <Ionicons name="checkmark-done-outline" size={18} color={colors.tint} />
                        <Text style={[styles.actionButtonText, { color: colors.tint }]}>Mark All Read</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAll}>
                        <Ionicons name="trash-outline" size={18} color="#F44336" />
                        <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete All</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Notifications List */}
            {isLoading && notifications.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.tint} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading notifications...</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 20 },
                        notifications.length === 0 && styles.listContentEmpty,
                    ]}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.tint}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    selectionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    selectionAction: {
        padding: 4,
    },
    selectionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    selectionCount: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    listContentEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    unreadItem: {
        borderLeftWidth: 3,
        borderLeftColor: '#4CAF50',
    },
    checkbox: {
        marginRight: 12,
        justifyContent: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    unreadText: {
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    notificationBody: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        marginTop: 8,
    },
});

