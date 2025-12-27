import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';

import { CustomText } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { rosterService } from '@/api/services/roster.service';
import { playerService } from '@/api/services/player.service';
import type { PlayerProfile } from '@/api/types/player';

type MetricKey = keyof PlayerProfile['prs'];

const PR_METRICS: Array<{
  key: MetricKey;
  label: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
    { key: 'benchPress', label: 'Bench Press', unit: 'kg', icon: 'barbell' },
    { key: 'squat', label: 'Squat', unit: 'kg', icon: 'fitness' },
    { key: 'deadlift', label: 'Deadlift', unit: 'kg', icon: 'body' },
    { key: 'overheadPress', label: 'Overhead Press', unit: 'kg', icon: 'move' },
    { key: 'clean', label: 'Clean', unit: 'kg', icon: 'repeat' },
    { key: 'fortyYardDash', label: '40 Yard Dash', unit: 's', icon: 'stopwatch' },
  ];

interface AnalyticsPlayer {
  id: string;
  fullName: string;
  positions: string[] | null;
  prs: PlayerProfile['prs'];
}

export const CoachAnalytics = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user } = useAuth();

  const [players, setPlayers] = useState<AnalyticsPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(PR_METRICS[0].key);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    if (user?.role !== 'coach') {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const roster = await rosterService.getRoster();
        const playerProfiles = await Promise.all(
          roster.players.map(async (player) => {
            try {
              const profile = await playerService.getPlayerProfile(player.id);
              return profile;
            } catch (profileError) {
              console.error('Failed to load player profile', player.id, profileError);
              return null;
            }
          })
        );

        if (!isMounted) {
          return;
        }

        setPlayers(
          playerProfiles
            .filter((profile): profile is PlayerProfile => profile !== null)
            .map((profile) => ({
              id: profile.id,
              fullName: profile.fullName,
              positions: profile.positions,
              prs: profile.prs,
            }))
        );
      } catch (fetchError) {
        console.error('Coach analytics fetch error:', fetchError);
        if (isMounted) {
          setError('Unable to load analytics data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const metricStats = useMemo(() => {
    const stats: Partial<Record<MetricKey, { average: number | null; count: number }>> = {};

    PR_METRICS.forEach(({ key }) => {
      const values = players
        .map((player) => player.prs[key]?.value)
        .filter((value): value is number => typeof value === 'number');

      if (values.length === 0) {
        stats[key] = { average: null, count: 0 };
        return;
      }

      const sum = values.reduce((acc, value) => acc + value, 0);
      stats[key] = { average: sum / values.length, count: values.length };
    });

    return stats;
  }, [players]);

  const selectedMetricMeta = useMemo(
    () => PR_METRICS.find((metric) => metric.key === selectedMetric)!,
    [selectedMetric]
  );

  const sortedPlayers = useMemo(() => {
    const fallbackValue = sortOrder === 'desc' ? -Infinity : Infinity;
    const metricKey = selectedMetric;

    return [...players]
      .map((player) => ({
        ...player,
        metricValue: player.prs[metricKey]?.value ?? null,
      }))
      .sort((a, b) => {
        const aVal = a.metricValue ?? fallbackValue;
        const bVal = b.metricValue ?? fallbackValue;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
  }, [players, selectedMetric, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const formatMetricValue = (value: number | null) => {
    if (value === null) {
      return 'No data';
    }

    const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
    return `${formatted} ${selectedMetricMeta.unit}`;
  };

  const renderContent = () => {
    if (user?.role !== 'coach') {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="lock-closed" size={scale(48)} color={colors.textMuted} />
          <CustomText style={styles.messageTitle}>Coaches Only</CustomText>
          <CustomText style={styles.messageSubtitle}>
            Detailed analytics are restricted to coaching staff.
          </CustomText>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText style={styles.loadingText}>Loading analytics...</CustomText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle" size={scale(48)} color={colors.error} />
          <CustomText style={styles.messageTitle}>Something went wrong</CustomText>
          <CustomText style={styles.messageSubtitle}>{error}</CustomText>
        </View>
      );
    }

    if (players.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="people" size={scale(48)} color={colors.textMuted} />
          <CustomText style={styles.messageTitle}>No player data yet</CustomText>
          <CustomText style={styles.messageSubtitle}>
            Add players to the roster to view analytics.
          </CustomText>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <CustomText style={styles.sectionTitle}>Team Strength Insights</CustomText>
          <CustomText style={styles.sectionSubtitle}>
            Aggregated personal record metrics across your roster.
          </CustomText>
        </View>

        <View style={styles.summaryGrid}>
          {PR_METRICS.map((metric) => {
            const stat = metricStats[metric.key];
            const value =
              stat && stat.average !== null
                ? `${Number.isInteger(stat.average) ? stat.average : stat.average.toFixed(1)} ${metric.unit
                }`
                : '—';

            return (
              <View key={metric.key} style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Ionicons name={metric.icon} size={scale(20)} color={colors.primary} />
                  <CustomText style={styles.summaryLabel}>{metric.label}</CustomText>
                </View>
                <CustomText style={styles.summaryValue}>{value}</CustomText>
                <CustomText style={styles.summaryHint}>
                  {stat?.count ?? 0} recorded {stat && stat.count === 1 ? 'athlete' : 'athletes'}
                </CustomText>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.metricSelectorHeader}>
            <CustomText style={styles.sectionTitle}>Ranking</CustomText>
            <TouchableOpacity style={styles.sortToggle} onPress={toggleSortOrder}>
              <Ionicons
                name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                size={scale(16)}
                color="#fff"
              />
              <CustomText style={styles.sortToggleText}>
                {sortOrder === 'desc' ? 'High → Low' : 'Low → High'}
              </CustomText>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={PR_METRICS}
            keyExtractor={(metric) => metric.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricChipsList}
            ItemSeparatorComponent={() => <View style={{ width: scale(8) }} />}
            renderItem={({ item: metric }) => {
              const isActive = selectedMetric === metric.key;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedMetric(metric.key)}
                  style={[
                    styles.metricChip,
                    isActive && [styles.metricChipActive, { borderColor: colors.primary }],
                  ]}>
                  <CustomText
                    style={[
                      styles.metricChipText,
                      isActive && { color: colors.primary, fontWeight: '600' },
                    ]}>
                    {metric.label}
                  </CustomText>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.listContainer}>
            {sortedPlayers.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <View style={styles.rankBadge}>
                    <CustomText style={styles.rankText}>{index + 1}</CustomText>
                  </View>
                  <View>
                    <CustomText style={styles.playerName}>{player.fullName}</CustomText>
                    <CustomText style={styles.playerMeta}>
                      {player.positions?.join(', ') || 'Position N/A'}
                    </CustomText>
                  </View>
                </View>
                <CustomText style={styles.playerValue}>
                  {formatMetricValue(player.metricValue)}
                </CustomText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.playerDashboardBackground }]}
      edges={['top']}>
      {renderContent()}
    </SafeAreaView>
  );
};

const getStyles = (colors: typeof import('@/constants/Colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: verticalScale(32),
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: verticalScale(12),
    },
    loadingText: {
      fontSize: scale(14),
      color: colors.textSecondary,
      fontFamily: 'System',
    },
    messageTitle: {
      fontSize: scale(18),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    messageSubtitle: {
      fontSize: scale(14),
      color: colors.textSecondary,
      textAlign: 'center',
    },
    sectionHeader: {
      marginBottom: verticalScale(16),
      paddingHorizontal: scale(16),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontWeight: '700',
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: scale(14),
      color: colors.textSecondary,
      marginTop: verticalScale(4),
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(12),
      paddingHorizontal: scale(16),
    },
    summaryCard: {
      flexBasis: '48%',
      backgroundColor: colors.cardBackground,
      borderRadius: scale(12),
      padding: scale(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderLight,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
      marginBottom: verticalScale(8),
    },
    summaryLabel: {
      fontSize: scale(14),
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: scale(24),
      fontWeight: '700',
      color: colors.text,
    },
    summaryHint: {
      fontSize: scale(12),
      color: colors.textSecondary,
      marginTop: verticalScale(4),
    },
    section: {
      marginTop: verticalScale(24),
    },
    metricSelectorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(12),
      paddingHorizontal: scale(16),
    },
    metricChipsList: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(4),
    },
    metricChip: {
      paddingVertical: verticalScale(6),
      paddingHorizontal: scale(14),
      borderRadius: scale(20),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderLight,
      backgroundColor: colors.cardBackground,
    },
    metricChipActive: {
      backgroundColor: `${colors.primary}10`,
    },
    metricChipText: {
      fontSize: scale(13),
      color: colors.textSecondary,
    },
    sortToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
      paddingVertical: verticalScale(6),
      paddingHorizontal: scale(12),
      borderRadius: scale(16),
      backgroundColor: colors.primary,
    },
    sortToggleText: {
      color: '#fff',
      fontSize: scale(12),
      fontWeight: '600',
    },
    listContainer: {
      marginTop: verticalScale(12),
      backgroundColor: colors.cardBackground,
      borderRadius: scale(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderLight,
      width: '90%',
      alignSelf: 'center',
    },
    playerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderLight,
    },
    playerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
    },
    rankBadge: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rankText: {
      fontSize: scale(14),
      fontWeight: '700',
      color: colors.primary,
    },
    playerName: {
      fontSize: scale(16),
      fontWeight: '600',
      color: colors.text,
    },
    playerMeta: {
      fontSize: scale(12),
      color: colors.textSecondary,
      marginTop: verticalScale(2),
    },
    playerValue: {
      fontSize: scale(14),
      fontWeight: '600',
      color: colors.text,
    },
  });
