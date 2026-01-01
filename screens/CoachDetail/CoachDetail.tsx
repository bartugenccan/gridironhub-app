import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RosterStackParamList } from '@/types/navigation/stacks';
import { AppRoutes } from '@/types/navigation/routes';
import { useCoachProfile } from '@/hooks/useCoach';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';
import { Typography } from '@/constants/Typography';
type CoachProfileRouteProp = RouteProp<RosterStackParamList, AppRoutes.COACH_DETAIL>;

export const CoachDetail = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute<CoachProfileRouteProp>();
  const { coachId } = route.params;
  const { data: coach, isLoading, error } = useCoachProfile(coachId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !coach) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={scale(48)} color={colors.error} />
          <Text style={styles.errorText}>{error?.message || 'Failed to load player profile'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="whistle" size={scale(48)} color={colors.primary} />
            </View>
            <Text style={styles.coachName}>{coach.fullName}</Text>
            <Text style={styles.coachRole}>
              {coach.currentTeam ? `Coach at ${coach.currentTeam}` : 'Coach'}
            </Text>
          </View>
        </View>

        {/* Bio Section */}
        {coach.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{coach.bio}</Text>
          </View>
        )}

        {/* Experience Section */}
        {coach.yearsOfExperience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.experienceCard}>
              <MaterialCommunityIcons name="trophy" size={scale(24)} color={colors.primary} />
              <Text style={styles.experienceText}>
                {coach.yearsOfExperience} {coach.yearsOfExperience === 1 ? 'Year' : 'Years'}
              </Text>
            </View>
          </View>
        )}

        {/* Certifications Section */}
        {coach.certifications && coach.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.chipsContainer}>
              {coach.certifications.map((cert, index) => (
                <View key={index} style={styles.chip}>
                  <MaterialCommunityIcons
                    name="certificate"
                    size={scale(16)}
                    color={colors.primary}
                  />
                  <Text style={styles.chipText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Preferred Positions Section */}
        {coach.preferredPositions && coach.preferredPositions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coaching Positions</Text>
            <View style={styles.chipsContainer}>
              {coach.preferredPositions.map((position, index) => (
                <View key={index} style={styles.positionChip}>
                  <Text style={styles.positionChipText}>{position}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Teams Section */}
        {coach.teams && coach.teams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teams</Text>
            {coach.teams.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamInfo}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={scale(20)}
                    color={colors.primary}
                  />
                  <View style={styles.teamTextContainer}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamRole}>{team.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: typeof import('@/constants/Colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: verticalScale(16),
      fontSize: scale(14),
      color: colors.textSecondary,
      fontFamily: Typography.fontFamily.regular,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(32),
    },
    errorText: {
      marginTop: verticalScale(16),
      fontSize: scale(14),
      color: colors.error,
      fontFamily: Typography.fontFamily.regular,
      textAlign: 'center',
    },
    header: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(24),
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerInfo: {
      alignItems: 'center',
    },
    iconContainer: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(12),
      borderWidth: 2,
      borderColor: colors.primary,
    },
    coachName: {
      fontSize: scale(24),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginBottom: verticalScale(4),
      textAlign: 'center',
    },
    coachRole: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    section: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(20),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginBottom: verticalScale(12),
    },
    bioText: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
      color: colors.text,
      lineHeight: scale(20),
    },
    experienceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      padding: scale(16),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: scale(12),
    },
    experienceText: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(8),
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      paddingHorizontal: scale(12),
      paddingVertical: scale(8),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: scale(6),
    },
    chipText: {
      fontSize: scale(13),
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
    },
    positionChip: {
      backgroundColor: colors.primary,
      paddingHorizontal: scale(16),
      paddingVertical: scale(8),
      borderRadius: scale(20),
    },
    positionChipText: {
      fontSize: scale(13),
      fontFamily: Typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    teamCard: {
      backgroundColor: colors.cardBackground,
      padding: scale(16),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: colors.borderLight,
      marginBottom: verticalScale(8),
    },
    teamInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
    },
    teamTextContainer: {
      flex: 1,
    },
    teamName: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginBottom: verticalScale(2),
    },
    teamRole: {
      fontSize: scale(13),
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
  });
