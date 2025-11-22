import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { CustomText } from '@/components';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { statsService, PersonalRecord as ApiPersonalRecord } from '@/api/services/stats.service';
import { formatDate } from '@/utils/formatDate';

interface RecentActivity {
  id: string;
  title: string;
  date: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface PersonalRecord {
  id: string;
  exercise: string;
  weight: string;
  date: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isNewPr?: boolean;
}

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    title: 'Team meeting tomorrow at 8 AM in the main gym. Be on time.',
    date: '1h ago',
    description: 'Coach Miller',
    icon: 'bullhorn-outline',
  },
  {
    id: '2',
    title: 'You set a new Personal Record in Bench Press: 315 lbs',
    date: 'Nov 15, 2023',
    description: '',
    icon: 'chart-line-variant',
  },
  {
    id: '3',
    title: 'You updated your Back Squat: 405 lbs',
    date: 'Oct 28, 2023',
    description: '',
    icon: 'dumbbell',
  },
];

// Icon mapping for different exercises
const getExerciseIcon = (liftName: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  const lowerName = liftName.toLowerCase();

  if (lowerName.includes('squat')) return 'dumbbell';
  if (lowerName.includes('bench') || lowerName.includes('press')) return 'minus';
  if (lowerName.includes('deadlift')) return 'weight-lifter';
  if (lowerName.includes('dash') || lowerName.includes('run')) return 'run-fast';
  if (lowerName.includes('clean')) return 'dumbbell';

  return 'dumbbell'; // default icon
};

export const PlayerDashboard = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user } = useAuth();

  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalRecords();
  }, []);

  const fetchPersonalRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const records = await statsService.getPersonalRecords();

      // Transform API data to component format
      const transformedRecords: PersonalRecord[] = records.map((record, index) => ({
        id: `${record.liftName}-${index}`,
        exercise: record.liftName,
        weight:
          record.liftName.includes('Dash') || record.liftName.includes('Run')
            ? `${record.oneRepMax}s`
            : `${record.oneRepMax} lbs`,
        date: formatDate(record.recordedAt),
        icon: getExerciseIcon(record.liftName),
        isNewPr: false, // You can add logic to determine if it's a new PR
      }));

      setPersonalRecords(transformedRecords);
    } catch (err: any) {
      console.error('Error fetching personal records:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(err.message || 'Failed to load personal records');
      // Set empty array so UI still renders
      setPersonalRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActivityItem = ({ item }: { item: RecentActivity }) => (
    <View style={styles.activityCard}>
      <View style={styles.activityIconContainer}>
        <MaterialCommunityIcons
          name={item.icon}
          size={scale(20)}
          color={colors.activityIconColor}
        />
      </View>
      <View style={styles.activityContent}>
        <CustomText style={styles.activityTitle}>{item.title}</CustomText>
        {item.description ? (
          <CustomText style={styles.activityDescription}>
            {item.description} - {item.date}
          </CustomText>
        ) : (
          <CustomText style={styles.activityDescription}>{item.date}</CustomText>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={scale(20)} color={colors.textSecondary} />
    </View>
  );

  const renderRecordItem = ({ item }: { item: PersonalRecord }) => (
    <View style={styles.recordCard}>
      {item.isNewPr && (
        <View style={styles.newPrBadge}>
          <CustomText style={styles.newPrText}>NEW PR!</CustomText>
        </View>
      )}
      <View style={styles.recordIconContainer}>
        <MaterialCommunityIcons name={item.icon} size={scale(20)} color={colors.recordIconColor} />
      </View>
      <View style={styles.recordContent}>
        <View style={styles.recordHeader}>
          <CustomText style={styles.recordExercise}>{item.exercise}</CustomText>
        </View>
        <CustomText style={styles.recordDate}>{item.date}</CustomText>
      </View>
      <View style={styles.recordRight}>
        <CustomText style={styles.recordWeight}>{item.weight}</CustomText>
        <MaterialCommunityIcons
          name="chevron-right"
          size={scale(20)}
          color={colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderPersonalRecordsContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText style={styles.loadingText}>Loading records...</CustomText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={scale(40)} color={colors.error} />
          <CustomText style={styles.errorText}>{error}</CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPersonalRecords}>
            <CustomText style={styles.retryButtonText}>Retry</CustomText>
          </TouchableOpacity>
        </View>
      );
    }

    if (personalRecords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="dumbbell" size={scale(40)} color={colors.textSecondary} />
          <CustomText style={styles.emptyText}>No personal records yet</CustomText>
        </View>
      );
    }

    return (
      <FlatList
        data={personalRecords}
        renderItem={renderRecordItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.teamLogo}
              source={require('../../assets/images/sakarya-logo.png')}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <CustomText style={styles.teamName}>{user?.teamName || 'Team Name'}</CustomText>
            <CustomText style={styles.pageTitle}>Player Dashboard</CustomText>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={scale(24)} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Player Info Section */}
        <View style={styles.playerInfoSection}>
          <View style={styles.playerHeaderRow}>
            <View style={styles.playerImageContainer}>
              <Image
                source={{ uri: 'https://picsum.photos/seed/picsum/200/300' }}
                style={styles.playerImage}
              />
            </View>
            <View style={styles.playerInfoContainer}>
              <CustomText style={styles.playerName}>{user?.fullName || 'Player Name'}</CustomText>
              <CustomText style={styles.playerPosition}>
                {/* #{user?.position || '4'} - {user?.positionName || 'Tight End'} */}
              </CustomText>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <CustomText style={styles.statLabel}>Height</CustomText>
              <CustomText style={styles.statValue}>198cm</CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText style={styles.statLabel}>Weight</CustomText>
              <CustomText style={styles.statValue}>107kg</CustomText>
            </View>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Recent Activity</CustomText>
          <FlatList
            data={recentActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Personal Records Section */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Personal Records</CustomText>
          {renderPersonalRecordsContent()}
        </View>
        <View style={{ height: verticalScale(80) }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={scale(30)} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: typeof import('@/constants/Colors').DarkColors) =>
  StyleSheet.create({
    // ...existing styles...
    mainContainer: {
      flex: 1,
      backgroundColor: colors.playerDashboardBackground,
    },
    container: {
      flex: 1,
    },
    loadingContainer: {
      paddingVertical: verticalScale(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: verticalScale(10),
      fontSize: scale(14),
      color: colors.textSecondary,
      fontFamily: Typography.fontFamily.regular,
    },
    errorContainer: {
      paddingVertical: verticalScale(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      marginTop: verticalScale(10),
      fontSize: scale(14),
      color: colors.error,
      fontFamily: Typography.fontFamily.regular,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: verticalScale(15),
      backgroundColor: colors.primary,
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(10),
      borderRadius: scale(8),
    },
    retryButtonText: {
      color: colors.white,
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
    },
    emptyContainer: {
      paddingVertical: verticalScale(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      marginTop: verticalScale(10),
      fontSize: scale(14),
      color: colors.textSecondary,
      fontFamily: Typography.fontFamily.regular,
    },
    // ...keep all existing styles from the original file...
    headerSection: {
      paddingTop: verticalScale(50),
      paddingBottom: verticalScale(15),
      paddingHorizontal: scale(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoContainer: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    teamLogo: {
      width: scale(36),
      height: scale(36),
    },
    headerTextContainer: {
      alignItems: 'center',
    },
    teamName: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    pageTitle: {
      fontSize: scale(12),
      color: colors.textSecondary,
      fontFamily: Typography.fontFamily.regular,
    },
    settingsButton: {
      padding: scale(5),
    },
    playerInfoSection: {
      paddingVertical: verticalScale(20),
      paddingHorizontal: scale(20),
    },
    playerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    playerImageContainer: {
      width: scale(70),
      height: scale(70),
      borderRadius: scale(35),
      overflow: 'hidden',
      marginRight: scale(15),
      borderWidth: 2,
      borderColor: colors.playerCardBackground,
    },
    playerImage: {
      width: '100%',
      height: '100%',
    },
    playerInfoContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    playerName: {
      fontSize: scale(20),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginBottom: verticalScale(2),
    },
    playerPosition: {
      fontSize: scale(14),
      color: colors.textSecondary,
      fontFamily: Typography.fontFamily.regular,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: scale(15),
    },
    statBox: {
      flex: 1,
      borderWidth: scale(1),
      borderColor: colors.borderLight,
      backgroundColor: colors.playerCardBackground,
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(20),
      borderRadius: scale(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    statLabel: {
      fontSize: scale(12),
      color: colors.textSecondary,
      marginBottom: verticalScale(5),
      fontFamily: Typography.fontFamily.semiBold,
    },
    statValue: {
      fontSize: scale(20),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    section: {
      marginTop: verticalScale(10),
      paddingHorizontal: scale(20),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontFamily: Typography.fontFamily.bold,
      marginBottom: verticalScale(10),
      color: colors.text,
    },
    activityCard: {
      backgroundColor: colors.playerCardBackground,
      borderWidth: scale(1),
      borderColor: colors.borderLight,
      padding: scale(15),
      borderRadius: scale(12),
      marginBottom: verticalScale(10),
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    activityIconContainer: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(8),
      backgroundColor: colors.activityIconBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(15),
    },
    activityContent: {
      flex: 1,
      marginRight: scale(10),
    },
    activityTitle: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
      marginBottom: verticalScale(4),
    },
    activityDescription: {
      fontSize: scale(12),
      color: colors.textSecondary,
      fontFamily: Typography.fontFamily.regular,
    },
    recordCard: {
      backgroundColor: colors.playerCardBackground,
      padding: scale(15),
      borderWidth: scale(1),
      borderColor: colors.borderLight,
      borderRadius: scale(12),
      marginBottom: verticalScale(10),
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    recordIconContainer: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(8),
      backgroundColor: colors.recordIconBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(15),
    },
    recordContent: {
      flex: 1,
    },
    recordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(4),
    },
    recordExercise: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
      marginRight: scale(8),
    },
    newPrBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: '#2563EB',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      borderTopRightRadius: scale(12),
      borderBottomLeftRadius: scale(12),
      zIndex: 1,
    },
    newPrText: {
      color: '#fff',
      fontSize: scale(10),
      fontFamily: Typography.fontFamily.bold,
    },
    recordDate: {
      fontSize: scale(12),
      color: colors.info,
      fontFamily: Typography.fontFamily.semiBold,
    },
    recordRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    recordWeight: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginRight: scale(5),
    },
    fab: {
      position: 'absolute',
      bottom: verticalScale(20),
      right: scale(20),
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      backgroundColor: '#2563EB',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    },
  });
