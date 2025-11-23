import { StyleSheet, Text, View, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { rosterService } from '@/api/services/roster.service';
import { RosterResponse } from '@/api/types/roster';

export const TeamScreen = () => {
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
      console.log('Roster data:', data);
      console.log('Coaches:', data.coaches);
      console.log('Players:', data.players);
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
        <Text style={styles.text}>
          <MaterialCommunityIcons name="football-helmet" size={24} color="green" />
          Team Roster
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={28}
          color={DarkColors.borderLight}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="green" style={styles.loader} />
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
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
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
                  <View key={player.id} style={styles.memberCard}>
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
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </View>
                  </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.semiBold,
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
    backgroundColor: '#ffffff',
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
    borderRightColor: DarkColors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
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
    color: '#333',
  },
  memberCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    color: 'green',
  },
  memberName: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semiBold,
    color: '#000',
  },
  memberPosition: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
