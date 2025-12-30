import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { rosterService } from '@/api/services/roster.service';
import { RosterResponse } from '@/api/types/roster';
import { useTheme } from '@/contexts/ThemeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RosterStackParamList } from '@/types/navigation/stacks';
import { AppRoutes } from '@/types/navigation/routes';
import { supabase } from '@/utils/supabase';

export const Roster = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<StackNavigationProp<RosterStackParamList>>();
  const [roster, setRoster] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoachPosition, setSelectedCoachPosition] = useState<string>('All');
  const [selectedPlayerPosition, setSelectedPlayerPosition] = useState<string>('All');

  // Extract unique positions from roster
  const coachPositions = React.useMemo(() => {
    if (!roster) return ['All'];
    const positions = new Set<string>();
    roster.coaches.forEach(coach => {
      coach.primaryPosition?.forEach(pos => positions.add(pos));
    });
    return ['All', ...Array.from(positions)];
  }, [roster]);

  const playerPositions = React.useMemo(() => {
    if (!roster) return ['All'];
    const positions = new Set<string>();
    roster.players.forEach(player => {
      player.position?.forEach(pos => positions.add(pos));
    });
    return ['All', ...Array.from(positions)];
  }, [roster]);

  // Fetch roster when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRoster();

      return () => {
        setSearchQuery('');
      };
    }, [])
  );

  // Subscribe to realtime changes on team_members table
  useEffect(() => {
    const channel = supabase
      .channel('roster-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'team_members',
        },
        (payload) => {
          console.log('Roster change detected:', payload);
          // Refetch roster when any change occurs
          fetchRoster();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRoster = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      const data = await rosterService.getRoster();
      setRoster(data);
    } catch (error) {
      console.error('Failed to fetch roster:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRoster();
  }, []);

  const filteredCoaches = roster?.coaches.filter((coach) => {
    const matchesSearch = coach.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedCoachPosition === 'All' ||
      coach.primaryPosition?.includes(selectedCoachPosition);
    return matchesSearch && matchesPosition;
  });

  const filteredPlayers = roster?.players.filter((player) => {
    const matchesSearch = player.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPlayerPosition === 'All' ||
      player.position?.includes(selectedPlayerPosition);
    return matchesSearch && matchesPosition;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Team Roster</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={28}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            {/* Coaches Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coaches ({filteredCoaches?.length || 0})</Text>

              {/* Coach Position Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sectionFilterContainer}
                contentContainerStyle={styles.filterContentContainer}
              >
                {coachPositions.map((position) => (
                  <TouchableOpacity
                    key={position}
                    style={[
                      styles.filterChip,
                      selectedCoachPosition === position && styles.filterChipSelected,
                    ]}
                    onPress={() => setSelectedCoachPosition(position)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCoachPosition === position && styles.filterChipTextSelected,
                      ]}
                    >
                      {position}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredCoaches && filteredCoaches.length > 0 ? (
                filteredCoaches.map((coach) => (
                  <TouchableOpacity
                    key={coach.id}
                    style={styles.memberCard}
                    onPress={() =>
                      navigation.navigate(AppRoutes.COACH_DETAIL, { coachId: coach.id })
                    }
                    activeOpacity={0.7}>
                    <View style={styles.cardContent}>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{coach.fullName}</Text>
                        {coach.primaryPosition && coach.primaryPosition.length > 0 && (
                          <Text style={styles.memberPosition}>{coach.primaryPosition.join(', ')}</Text>
                        )}
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No coaches found</Text>
              )}
            </View>

            {/* Players Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Players ({filteredPlayers?.length || 0})</Text>

              {/* Player Position Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sectionFilterContainer}
                contentContainerStyle={styles.filterContentContainer}
              >
                {playerPositions.map((position) => (
                  <TouchableOpacity
                    key={position}
                    style={[
                      styles.filterChip,
                      selectedPlayerPosition === position && styles.filterChipSelected,
                    ]}
                    onPress={() => setSelectedPlayerPosition(position)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedPlayerPosition === position && styles.filterChipTextSelected,
                      ]}
                    >
                      {position}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredPlayers && filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.memberCard}
                    onPress={() =>
                      navigation.navigate(AppRoutes.PLAYER_PROFILE, { playerId: player.id })
                    }
                    activeOpacity={0.7}>
                    <View style={styles.cardContent}>
                      <View style={styles.memberInfo}>
                        <View style={styles.playerInfo}>
                          {player.jerseyNumber && (
                            <Text style={styles.jerseyNumber}>#{player.jerseyNumber}</Text>
                          )}
                          <Text style={styles.memberName}>{player.fullName}</Text>
                        </View>
                        {player.position && player.position.length > 0 && (
                          <Text style={styles.memberPosition}>{player.position.join(', ')}</Text>
                        )}
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No players found</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: typeof import('@/constants/Colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.playerDashboardBackground,
    },
    text: {
      fontSize: 24,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
    },
    headerContainer: {
      alignItems: 'center',
      marginVertical: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    searchIcon: {
      marginRight: 12,
      paddingRight: 12,
      borderRightWidth: 1,
      borderRightColor: colors.borderLight,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 4,
      fontFamily: Typography.fontFamily.semiBold,
    },
    sectionFilterContainer: {
      marginBottom: 12,
      maxHeight: 40,
    },
    filterContentContainer: {
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    filterChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
    },
    filterChipTextSelected: {
      color: '#FFFFFF',
    },
    contentContainer: {
      flex: 1,
      marginTop: 16,
      marginHorizontal: 16,
    },
    loader: {
      marginTop: 40,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: Typography.fontFamily.bold,
      marginBottom: 12,
      color: colors.text,
    },
    memberCard: {
      backgroundColor: colors.playerCardBackground,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    memberInfo: {
      flex: 1,
    },
    playerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    jerseyNumber: {
      fontSize: 18,
      fontFamily: Typography.fontFamily.bold,
      color: colors.accent,
    },
    memberName: {
      fontSize: 16,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
    },
    memberPosition: {
      fontSize: 14,
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
      marginTop: 4,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: Typography.fontFamily.regular,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
    },
  });
