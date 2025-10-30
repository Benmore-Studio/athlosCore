import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchVideos } from '@/services/videoService';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '@/components/ui/EmptyState';

type SortOption = 'newest' | 'oldest' | 'mostViewed' | 'mostLiked';
type FilterOption = 'all' | 'goals' | 'assists' | 'defense';

export default function VideosScreen() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchVideos();
      setVideos(data);
      setLoading(false);
    })();
  }, []);

  // Filter and sort videos based on search, filter, and sort options
  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.teamA?.toLowerCase().includes(query) ||
          video.teamB?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      result = result.filter((video) => {
        const playTypes = video.tags?.map((tag: any) => tag.playType.toLowerCase()) || [];
        const markerTypes = video.timelineMarkers?.map((m: any) => m.type.toLowerCase()) || [];
        const allTypes = [...playTypes, ...markerTypes];

        switch (filterBy) {
          case 'goals':
            return allTypes.some((type) => type.includes('goal') || type.includes('score'));
          case 'assists':
            return allTypes.some((type) => type.includes('assist') || type.includes('pass'));
          case 'defense':
            return allTypes.some((type) => type.includes('save') || type.includes('block') || type.includes('foul'));
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'mostViewed':
          return (b.views || 0) - (a.views || 0);
        case 'mostLiked':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [videos, searchQuery, sortBy, filterBy]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderVideoCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/video/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Ionicons name="play-circle-outline" size={22} color={Colors.primary} />
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'mostViewed': return 'Most Viewed';
      case 'mostLiked': return 'Most Liked';
    }
  };

  const getFilterLabel = () => {
    switch (filterBy) {
      case 'all': return 'All Videos';
      case 'goals': return 'Goals & Scores';
      case 'assists': return 'Assists';
      case 'defense': return 'Defense';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.header}>🎬 Match Highlights</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => router.push('/video/upload')}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search videos, teams..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter and Sort Controls */}
      <View style={styles.controlsRow}>
        {/* Filter Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Ionicons name="filter" size={18} color={Colors.primary} />
            <Text style={styles.dropdownText}>{getFilterLabel()}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showFilterMenu && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[styles.menuItem, filterBy === 'all' && styles.menuItemActive]}
                onPress={() => { setFilterBy('all'); setShowFilterMenu(false); }}
              >
                <Text style={[styles.menuText, filterBy === 'all' && styles.menuTextActive]}>
                  All Videos
                </Text>
                {filterBy === 'all' && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, filterBy === 'goals' && styles.menuItemActive]}
                onPress={() => { setFilterBy('goals'); setShowFilterMenu(false); }}
              >
                <Text style={[styles.menuText, filterBy === 'goals' && styles.menuTextActive]}>
                  Goals & Scores
                </Text>
                {filterBy === 'goals' && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, filterBy === 'assists' && styles.menuItemActive]}
                onPress={() => { setFilterBy('assists'); setShowFilterMenu(false); }}
              >
                <Text style={[styles.menuText, filterBy === 'assists' && styles.menuTextActive]}>
                  Assists
                </Text>
                {filterBy === 'assists' && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, filterBy === 'defense' && styles.menuItemActive]}
                onPress={() => { setFilterBy('defense'); setShowFilterMenu(false); }}
              >
                <Text style={[styles.menuText, filterBy === 'defense' && styles.menuTextActive]}>
                  Defense
                </Text>
                {filterBy === 'defense' && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sort Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Ionicons name="swap-vertical" size={18} color={Colors.primary} />
            <Text style={styles.dropdownText}>{getSortLabel()}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showSortMenu && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[styles.menuItem, sortBy === 'newest' && styles.menuItemActive]}
                onPress={() => { setSortBy('newest'); setShowSortMenu(false); }}
              >
                <Text style={[styles.menuText, sortBy === 'newest' && styles.menuTextActive]}>
                  Newest First
                </Text>
                {sortBy === 'newest' && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, sortBy === 'oldest' && styles.menuItemActive]}
                onPress={() => { setSortBy('oldest'); setShowSortMenu(false); }}
              >
                <Text style={[styles.menuText, sortBy === 'oldest' && styles.menuTextActive]}>
                  Oldest First
                </Text>
                {sortBy === 'oldest' && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, sortBy === 'mostViewed' && styles.menuItemActive]}
                onPress={() => { setSortBy('mostViewed'); setShowSortMenu(false); }}
              >
                <Text style={[styles.menuText, sortBy === 'mostViewed' && styles.menuTextActive]}>
                  Most Viewed
                </Text>
                {sortBy === 'mostViewed' && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, sortBy === 'mostLiked' && styles.menuItemActive]}
                onPress={() => { setSortBy('mostLiked'); setShowSortMenu(false); }}
              >
                <Text style={[styles.menuText, sortBy === 'mostLiked' && styles.menuTextActive]}>
                  Most Liked
                </Text>
                {sortBy === 'mostLiked' && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Results Count */}
      {searchQuery.trim() && (
        <Text style={styles.resultsText}>
          {filteredAndSortedVideos.length} result{filteredAndSortedVideos.length !== 1 ? 's' : ''} found
        </Text>
      )}

      {/* Video List */}
      {videos.length === 0 ? (
        <EmptyState
          icon="video.fill"
          title="No Videos Yet"
          description="Upload your first game film to get started with AI-powered analysis and insights"
          actionLabel="Upload Video"
          onAction={() => router.push('/video/upload')}
        />
      ) : filteredAndSortedVideos.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Results Found"
          description="Try adjusting your search or filters"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setFilterBy('all');
          }}
        />
      ) : (
        <FlatList
          data={filteredAndSortedVideos}
          keyExtractor={(item) => item.id}
          renderItem={renderVideoCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: 20,
  },
  header: {
    fontSize: Typography.headline,
    fontWeight: '700',
    color: Colors.text
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.body,
    color: Colors.text,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  // Filter and Sort Controls
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dropdownContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  dropdownText: {
    flex: 1,
    fontSize: Typography.callout,
    color: Colors.text,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemActive: {
    backgroundColor: Colors.surface,
  },
  menuText: {
    fontSize: Typography.callout,
    color: Colors.text,
  },
  menuTextActive: {
    fontWeight: '600',
    color: Colors.primary,
  },
  // Results
  resultsText: {
    fontSize: Typography.subhead,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  // Video Cards
  card: {
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnailContainer: { position: 'relative' },
  thumbnail: { width: '100%', height: 200 },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: { color: '#fff', fontSize: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm },
  title: { flex: 1, marginLeft: 8, color: Colors.text, fontWeight: '500', fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
