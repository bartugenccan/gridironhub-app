import { StyleSheet, View, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomText } from '@/components';
import { Typography } from '@/constants/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';
import { RouteProp, useRoute } from '@react-navigation/native';
import { WorkoutsDetail as WorkoutDetailType } from '@/api/types/workoutsDetail';

type WorkoutsDetailRouteProp = RouteProp<
  { WorkoutsDetail: { workout: WorkoutDetailType } },
  'WorkoutsDetail'
>;

const DifficultyBadge = ({ level, colors }: { level: string; colors: any }) => {
  const getDifficultyColor = () => {
    switch (level.toLowerCase()) {
      case 'easy':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'medium':
        return { bg: '#FFF3E0', text: '#E65100' };
      case 'hard':
        return { bg: '#FFEBEE', text: '#C62828' };
      default:
        return { bg: colors.recordIconBackground, text: colors.recordIconColor };
    }
  };

  const difficultyColors = getDifficultyColor();

  return (
    <View style={[getStyles(colors).difficultyBadge, { backgroundColor: difficultyColors.bg }]}>
      <CustomText style={[getStyles(colors).difficultyText, { color: difficultyColors.text }]}>
        {level.toUpperCase()}
      </CustomText>
    </View>
  );
};

export const WorkoutsDetail = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute<WorkoutsDetailRouteProp>();
  const { workout } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="dumbbell" size={40} color={colors.recordIconColor} />
          </View>
          <CustomText style={styles.title}>{workout.name}</CustomText>

          <View style={styles.metaContainer}>
            <View style={styles.durationContainer}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={colors.textSecondary} />
              <CustomText style={styles.duration}>{workout.durationMinutes} minutes</CustomText>
            </View>

            {workout.difficultyLevel && (
              <DifficultyBadge level={workout.difficultyLevel} colors={colors} />
            )}
          </View>
        </View>

        {/* Description Section */}
        {workout.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="text-box-outline" size={22} color={colors.primary} />
              <CustomText style={styles.sectionTitle}>Description</CustomText>
            </View>
            <CustomText style={styles.description}>{workout.description}</CustomText>
          </View>
        )}

        {/* Assigned Positions Section */}
        {workout.assignedToPositions && workout.assignedToPositions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-group" size={22} color={colors.primary} />
              <CustomText style={styles.sectionTitle}>Target Positions</CustomText>
            </View>
            <View style={styles.positionsContainer}>
              {workout.assignedToPositions.map((position, index) => (
                <View key={index} style={styles.positionChip}>
                  <CustomText style={styles.positionText}>{position}</CustomText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Equipment Needed Section */}
        {workout.equipmentNeeded && workout.equipmentNeeded.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="hammer-wrench" size={22} color={colors.primary} />
              <CustomText style={styles.sectionTitle}>Equipment Needed</CustomText>
            </View>
            <View style={styles.equipmentList}>
              {workout.equipmentNeeded.map((equipment, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
                  <CustomText style={styles.equipmentText}>{equipment}</CustomText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Workout Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information-outline" size={22} color={colors.primary} />
            <CustomText style={styles.sectionTitle}>Workout Information</CustomText>
          </View>

          <View style={styles.infoRow}>
            <CustomText style={styles.infoLabel}>Created</CustomText>
            <CustomText style={styles.infoValue}>
              {new Date(workout.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </CustomText>
          </View>

          <View style={styles.infoRow}>
            <CustomText style={styles.infoLabel}>Last Updated</CustomText>
            <CustomText style={styles.infoValue}>
              {new Date(workout.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </CustomText>
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
    content: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.playerCardBackground,
      padding: scale(24),
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.recordIconBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    title: {
      fontSize: 26,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: verticalScale(16),
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(16),
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    durationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8),
      backgroundColor: colors.recordIconBackground,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: 20,
    },
    duration: {
      fontSize: 15,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.recordIconColor,
    },
    difficultyBadge: {
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: 20,
    },
    difficultyText: {
      fontSize: 13,
      fontFamily: Typography.fontFamily.bold,
      letterSpacing: 0.5,
    },
    section: {
      padding: scale(20),
      backgroundColor: colors.playerCardBackground,
      marginTop: verticalScale(12),
      marginHorizontal: scale(16),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8),
      marginBottom: verticalScale(16),
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    description: {
      fontSize: 15,
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    positionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(8),
    },
    positionChip: {
      backgroundColor: colors.recordIconBackground,
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(8),
      borderRadius: 20,
    },
    positionText: {
      fontSize: 14,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.recordIconColor,
    },
    equipmentList: {
      gap: verticalScale(12),
    },
    equipmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
    },
    equipmentText: {
      fontSize: 15,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
      flex: 1,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(8),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    infoLabel: {
      fontSize: 15,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 15,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
    },
  });
