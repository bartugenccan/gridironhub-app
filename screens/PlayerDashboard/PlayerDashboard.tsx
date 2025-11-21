import { StyleSheet, View, ScrollView, Image, FlatList } from 'react-native';
import React from 'react';
import { CustomText } from '@/components';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';

interface RecentActivity {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface PersonalRecord {
  id: string;
  exercise: string;
  weight: string;
  date: string;
}

const recentActivities: RecentActivity[] = [
  { id: '1', title: 'Leg Day Workout', date: 'Nov 20, 2025', description: '45 min session' },
  { id: '2', title: 'Upper Body', date: 'Nov 18, 2025', description: '60 min session' },
  { id: '3', title: 'Cardio Training', date: 'Nov 16, 2025', description: '30 min session' },
];

const personalRecords: PersonalRecord[] = [
  { id: '1', exercise: 'Bench Press', weight: '225 lbs', date: 'Nov 15, 2025' },
  { id: '2', exercise: 'Squat', weight: '315 lbs', date: 'Nov 10, 2025' },
  { id: '3', exercise: 'Deadlift', weight: '405 lbs', date: 'Nov 5, 2025' },
  { id: '4', exercise: 'Clean and Jerk', weight: '185 lbs', date: 'Nov 1, 2025' },
  { id: '5', exercise: '40- Yard Dash', weight: '4.78 sec', date: 'Oct 28, 2025' },
];

export const PlayerDashboard = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const renderActivityItem = ({ item }: { item: RecentActivity }) => (
    <View style={styles.activityCard}>
      <CustomText style={styles.activityTitle}>{item.title}</CustomText>
      <CustomText style={styles.activityDate}>{item.date}</CustomText>
      <CustomText style={styles.activityDescription}>{item.description}</CustomText>
    </View>
  );

  const renderRecordItem = ({ item }: { item: PersonalRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordLeft}>
        <CustomText style={styles.recordExercise}>{item.exercise}</CustomText>
        <CustomText style={styles.recordDate}>{item.date}</CustomText>
      </View>
      <CustomText style={styles.recordWeight}>{item.weight}</CustomText>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View>
          <Image style={styles.teamLogo} source={require('../../assets/images/sakarya-logo.png')} />
        </View>
        <CustomText style={styles.teamName}>Sakarya Tatankaları</CustomText>
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
            <CustomText style={styles.playerName}>Bartu Gençcan</CustomText>
            <View style={styles.playerMetaRow}>
              <CustomText style={styles.playerNumber}>#4</CustomText>
              <CustomText style={styles.playerPosition}>-</CustomText>
              <CustomText style={styles.playerPosition}>QuarterBack</CustomText>
            </View>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <CustomText style={styles.statLabel}>Height</CustomText>
            <CustomText style={styles.statValue}>6'2"</CustomText>
          </View>
          <View style={styles.statBox}>
            <CustomText style={styles.statLabel}>Weight</CustomText>
            <CustomText style={styles.statValue}>185 lbs</CustomText>
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
        <FlatList
          data={personalRecords}
          renderItem={renderRecordItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: typeof import('@/constants/Colors').DarkColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.playerDashboardBackground,
    },
    headerSection: {
      paddingTop: verticalScale(20),
      paddingBottom: verticalScale(15),
      paddingHorizontal: scale(20),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    teamLogo: {
      width: scale(90),
      height: scale(90),
      marginBottom: verticalScale(10),
    },
    teamName: {
      fontSize: scale(20),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: verticalScale(5),
    },
    pageTitle: {
      fontSize: scale(10),
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    playerInfoSection: {
      paddingVertical: verticalScale(30),
      paddingHorizontal: scale(20),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    playerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    playerImageContainer: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      overflow: 'hidden',
      marginRight: scale(15),
      backgroundColor: colors.surface,
      borderWidth: 3,
      borderColor: colors.primary,
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
      fontSize: scale(24),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: verticalScale(5),
    },
    playerMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
    },
    playerPosition: {
      fontSize: scale(16),
      fontWeight: '600',
      color: colors.textSecondary,
    },
    playerNumber: {
      fontSize: scale(16),
      fontWeight: '600',
      color: colors.primary,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      gap: scale(15),
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(15),
      borderRadius: scale(12),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statItem: {
      alignItems: 'stretch',
      paddingHorizontal: scale(20),
      borderWidth: 1,
      borderColor: colors.border,
    },
    statLabel: {
      fontSize: scale(14),
      color: colors.textSecondary,
      marginBottom: verticalScale(5),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: scale(20),
      fontWeight: 'bold',
      color: colors.text,
    },
    statDivider: {
      width: 1,
      height: verticalScale(40),
      backgroundColor: colors.border,
    },
    section: {
      marginTop: verticalScale(20),
      paddingHorizontal: scale(20),
    },
    sectionTitle: {
      fontSize: scale(20),
      fontWeight: 'bold',
      marginBottom: verticalScale(15),
      color: colors.text,
    },
    activityCard: {
      backgroundColor: colors.cardBackground,
      padding: scale(15),
      borderRadius: scale(12),
      marginBottom: verticalScale(10),
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    activityTitle: {
      fontSize: scale(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: verticalScale(5),
    },
    activityDate: {
      fontSize: scale(12),
      color: colors.textMuted,
      marginBottom: verticalScale(5),
    },
    activityDescription: {
      fontSize: scale(14),
      color: colors.textSecondary,
    },
    recordCard: {
      backgroundColor: colors.cardBackground,
      padding: scale(15),
      borderRadius: scale(12),
      marginBottom: verticalScale(10),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    recordLeft: {
      flex: 1,
    },
    recordExercise: {
      fontSize: scale(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: verticalScale(5),
    },
    recordDate: {
      fontSize: scale(12),
      color: colors.textMuted,
    },
    recordWeight: {
      fontSize: scale(18),
      fontWeight: 'bold',
      color: colors.accent,
    },
  });
