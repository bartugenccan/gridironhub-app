import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoachDashboardStackParamList } from '@/types/navigation/stacks';
import { AppRoutes } from '@/types/navigation/routes';
import { scale, verticalScale } from 'react-native-size-matters';
import { usePendingPrRequests, useUpdatePrRequestStatus } from '@/hooks/useStats';
import { Linking, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { rosterService } from '@/api';

type CoachDashboardNavigationProp = StackNavigationProp<CoachDashboardStackParamList>;

export const CoachDashboard = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<CoachDashboardNavigationProp>();
  const { data: pendingRequests } = usePendingPrRequests();
  const { mutate: updateRequestStatus } = useUpdatePrRequestStatus();
  const [playerCount, setPlayerCount] = React.useState<{ current: number; max: number }>({
    current: 0,
    max: 50,
  });

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const roster = await rosterService.getRoster();
        setPlayerCount({ current: roster.players.length, max: 50 });
      } catch (error) {
        console.error('Error fetching roster:', error);
      }
    };
    fetchRoster();
  }, []);

  const QuickActionButton = ({
    icon,
    label,
    onPress,
  }: {
    icon: any;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.quickActionBtn} onPress={onPress}>
      <View style={styles.quickActionIconContainer}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const PlayerToWatchRow = ({
    name,
    detail,
    status,
  }: {
    name: string;
    detail: string;
    status: 'up' | 'flag';
  }) => (
    <View style={styles.playerRow}>
      <View style={styles.playerInfo}>
        <View style={styles.avatarPlaceholder}>
          {/* Placeholder for avatar */}
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.playerName}>{name}</Text>
          <Text style={styles.playerDetail}>{detail}</Text>
        </View>
      </View>
      <Ionicons
        name={status === 'up' ? 'trending-up' : 'flag'}
        size={20}
        color={status === 'up' ? '#10B981' : '#F59E0B'}
      />
    </View>
  );

  console.log('Pr requests: ', pendingRequests);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.teamHeader}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/sakarya-logo.png')}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.teamName}>{user?.teamName || 'Varsity Lions'}</Text>
          </View>
        </View>

        {/* Pending PR Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending PR Requests</Text>
            <View style={styles.cardContainer}>
              {pendingRequests.map((request) => (
                <View key={request.id}>
                  <View style={styles.prRequestRow}>
                    <View style={styles.playerInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                          {(request.playerName || 'U').charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.playerName}>
                          {request.playerName || 'Unknown Player'}
                        </Text>
                        <Text style={styles.playerDetail}>
                          {request.liftName} - {request.value}
                        </Text>
                        <TouchableOpacity onPress={() => Linking.openURL(request.videoUrl)}>
                          <Text style={{ color: '#4F46E5', fontSize: scale(12), marginTop: 2 }}>
                            Watch Video
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: scale(12) }}>
                      <TouchableOpacity
                        onPress={() =>
                          updateRequestStatus(
                            { id: request.id, data: { status: 'rejected' } },
                            { onSuccess: () => Alert.alert('Rejected', 'PR Request rejected') }
                          )
                        }>
                        <Ionicons name="close-circle" size={scale(32)} color="#EF4444" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          updateRequestStatus(
                            { id: request.id, data: { status: 'approved' } },
                            { onSuccess: () => Alert.alert('Approved', 'PR Request approved') }
                          )
                        }>
                        <Ionicons name="checkmark-circle" size={scale(32)} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.divider} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Active Players Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Active Players</Text>
          <Text style={styles.cardValue}>
            {playerCount.current}/{playerCount.max}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <QuickActionButton icon="person-add" label="Add Player" />
          <QuickActionButton
            icon="barbell"
            label="Add Workout"
            onPress={() => navigation.navigate(AppRoutes.ADD_WORKOUT)}
          />
          <QuickActionButton
            icon="calendar"
            label="Schedule"
            onPress={() => navigation.navigate(AppRoutes.SCHEDULE)}
          />
        </View>

        {/* Players to Watch */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players to Watch</Text>
          <View style={styles.cardContainer}>
            <PlayerToWatchRow name="J. Smith" detail="New Bench PR: 225 lbs" status="up" />
            <View style={styles.divider} />
            <PlayerToWatchRow name="M. Davis" detail="Flagged (Missed Practice)" status="flag" />
            <View style={styles.divider} />
            <PlayerToWatchRow name="R. Chen" detail="Top Squat: 405 lbs" status="up" />

            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Players</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Team Strength Progression */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Strength Progression</Text>
          <Text style={styles.sectionSubtitle}>Average Bench Press, Last 30 Days</Text>
          <View style={styles.cardContainer}>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="stats-chart" size={64} color={colors.text} />
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate(AppRoutes.COACH_ANALYTICS)}>
              <Text style={styles.viewAllText}>View Detailed Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    scrollContent: {
      padding: scale(16),
      paddingBottom: verticalScale(40),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(24),
    },
    teamHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8),
    },
    teamName: {
      fontSize: scale(20),
      fontWeight: 'bold',
      color: colors.text,
    },
    logoContainer: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    teamLogo: {
      width: scale(36),
      height: scale(36),
    },
    statsRow: {
      flexDirection: 'row',
      gap: scale(12),
      marginBottom: verticalScale(16),
    },
    statCard: {
      flex: 1,
      backgroundColor: '#fff',
      padding: scale(16),
      borderRadius: scale(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    statLabel: {
      fontSize: scale(12),
      color: '#6B7280',
      marginBottom: verticalScale(4),
    },

    card: {
      backgroundColor: colors.playerCardBackground,
      padding: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      borderRadius: scale(12),
      marginBottom: verticalScale(24),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    cardLabel: {
      fontSize: scale(14),
      color: colors.text,
      marginBottom: verticalScale(4),
    },
    cardValue: {
      fontSize: scale(24),
      fontWeight: 'bold',
      color: colors.text,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginBottom: verticalScale(32),
    },
    quickActionBtn: {
      flex: 1,
      alignItems: 'center',
      width: '22%',
    },
    quickActionIconContainer: {
      width: scale(56),
      height: scale(56),
      backgroundColor: colors.backgroundLight,
      borderRadius: scale(16),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    quickActionLabel: {
      fontSize: scale(12),
      color: colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    section: {
      marginBottom: verticalScale(24),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: verticalScale(12),
    },
    sectionSubtitle: {
      fontSize: scale(14),
      color: '#6B7280',
      marginBottom: verticalScale(12),
      marginTop: verticalScale(-8),
    },
    cardContainer: {
      backgroundColor: colors.cardBackground,
      borderWidth: scale(1),
      borderColor: colors.border,
      borderRadius: scale(16),
      padding: scale(16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    playerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(8),
    },
    prRequestRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(8),
    },
    playerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
    },
    avatarPlaceholder: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: '#1F2937',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playerName: {
      fontSize: scale(16),
      fontWeight: '600',
      color: '#111827',
    },
    playerDetail: {
      fontSize: scale(13),
      color: '#6B7280',
    },
    divider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginVertical: verticalScale(12),
    },
    viewAllButton: {
      marginTop: verticalScale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      paddingVertical: verticalScale(12),
      backgroundColor: colors.playerCardBackground,
      borderRadius: scale(8),
      alignItems: 'center',
    },
    viewAllText: {
      fontSize: scale(14),
      fontWeight: '600',
      color: colors.text,
    },
    chartPlaceholder: {
      height: verticalScale(160),
      backgroundColor: colors.primary,
      borderRadius: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    eventRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(16),
      paddingVertical: verticalScale(4),
    },
    dateContainer: {
      backgroundColor: '#EEF2FF',
      padding: scale(8),
      borderRadius: scale(8),
      alignItems: 'center',
      minWidth: scale(50),
    },
    dateMonth: {
      fontSize: scale(10),
      fontWeight: '700',
      color: '#4F46E5',
      textTransform: 'uppercase',
    },
    dateDay: {
      fontSize: scale(18),
      fontWeight: 'bold',
      color: '#4F46E5',
    },
    eventTitle: {
      fontSize: scale(16),
      fontWeight: '600',
      color: '#111827',
    },
    eventSubtitle: {
      fontSize: scale(13),
      color: '#6B7280',
    },
  });
