import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Activity } from '@/store/types';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EventsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today');
  
  const { devices } = useAppStore();
  // TODO: Add activities API and store integration
  const activities: any[] = [];
  
  const getFilteredActivities = () => {
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return activities.filter((activity: Activity) => 
          new Date(activity.timestamp).toDateString() === now.toDateString()
        );
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activities.filter((activity: Activity) => 
          new Date(activity.timestamp) >= weekAgo
        );
      case 'all':
      default:
        return activities;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'unlock':
        return 'lock-open-outline';
      case 'lock':
        return 'lock-closed-outline';
      case 'delivery':
        return 'cube-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'unlock':
        return '#4CAF50';
      case 'lock':
        return '#FF9800';
      case 'delivery':
        return '#2196F3';
      default:
        return colors.tabIconDefault;
    }
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
      <View style={styles.activityIcon}>
        <Ionicons 
          name={getActivityIcon(item.type) as any}
          size={24} 
          color={getActivityColor(item.type)} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityDescription, { color: colors.text }]}>
          {item.description}
        </Text>
        <Text style={[styles.activityTime, { color: colors.tabIconDefault }]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  const filteredActivities = getFilteredActivities();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['today', 'week', 'all'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === filterOption ? colors.tint : colors.card,
              }
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text style={[
              styles.filterText,
              {
                color: filter === filterOption ? 'white' : colors.text,
              }
            ]}>
              {filterOption === 'today' ? 'Today' : 
               filterOption === 'week' ? 'This Week' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activities List */}
      {filteredActivities.length > 0 ? (
        <FlatList
          data={filteredActivities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            No activities found for {filter === 'today' ? 'today' : 
                                    filter === 'week' ? 'this week' : 'the selected period'}
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  activityCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
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
    textAlign: 'center',
  },
});
