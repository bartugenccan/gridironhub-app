import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { rosterService } from '@/api/services/roster.service';
import { RosterResponse } from '@/api/types/roster';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RosterStackParamList } from '@/types/navigation/stacks';
import { AppRoutes } from '@/types/navigation/routes';

export const Roster = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<StackNavigationProp<RosterStackParamList>>();
  const [roster, setRoster] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const data = await rosterService.getRoster();
      setRoster(data);
    } catch (error) {
      console.error('Failed to fetch roster:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoaches = roster?.coaches.filter((coach) =>
    coach.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlayers = roster?.players.filter((player) =>
    player.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <>
            {/* Coaches Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coaches ({filteredCoaches?.length || 0})</Text>
              {filteredCoaches && filteredCoaches.length > 0 ? (
                filteredCoaches.map((coach) => (
                  <View key={coach.id} style={styles.memberCard}>
                    <View style={styles.cardContent}>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{coach.fullName}</Text>
                        {coach.primaryPosition && (
                          <Text style={styles.memberPosition}>{coach.primaryPosition}</Text>
                        )}
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No coaches found</Text>
              )}
            </View>

            {/* Players Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Players ({filteredPlayers?.length || 0})</Text>
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
                        {player.position && (
                          <Text style={styles.memberPosition}>{player.position}</Text>
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
    contentContainer: {
      flex: 1,
      marginTop: 24,
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
      backgroundColor: colors.cardBackground,
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
