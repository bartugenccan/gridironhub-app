import { StyleSheet, View, ScrollView, Switch } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomText, LogoutButton } from '@/components';
import { Typography } from '@/constants/Typography';
import { scale, verticalScale } from 'react-native-size-matters';

export const CoachProfile = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <CustomText style={[styles.headerTitle, { color: colors.text }]}>Coach Profile</CustomText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Information Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={colors.primary} />
            <CustomText style={[styles.sectionTitle, { color: colors.text }]}>
              Account Information
            </CustomText>
          </View>

          {/* Full Name */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Name
            </CustomText>
            <CustomText style={[styles.infoValue, { color: colors.text }]}>
              {user?.fullName || 'Not set'}
            </CustomText>
          </View>

          {/* Email */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Email
            </CustomText>
            <CustomText style={[styles.infoValue, { color: colors.text }]}>
              {user?.email || 'Not set'}
            </CustomText>
          </View>

          {/* Team Name */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Team
            </CustomText>
            <CustomText style={[styles.infoValue, { color: colors.text }]}>
              {user?.teamName || 'Not set'}
            </CustomText>
          </View>

          {/* Role */}
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Role
            </CustomText>
            <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
              <CustomText style={[styles.roleText, { color: colors.primary }]}>Coach</CustomText>
            </View>
          </View>
        </View>

        {/* Appearance Settings Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
            <CustomText style={[styles.sectionTitle, { color: colors.text }]}>
              Appearance
            </CustomText>
          </View>

          {/* Theme Toggle */}
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <View style={styles.themeInfo}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Dark Mode
              </CustomText>
              <CustomText style={[styles.themeDescription, { color: colors.textMuted }]}>
                Switch between light and dark theme
              </CustomText>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={theme === 'dark' ? colors.primaryLight : '#f4f3f4'}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
            <CustomText style={[styles.sectionTitle, { color: colors.text }]}>Actions</CustomText>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <LogoutButton variant="full" color={colors.error || '#FF3B30'} size="medium" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: scale(24),
      fontFamily: Typography.fontFamily.bold,
    },
    content: {
      flex: 1,
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(20),
    },
    section: {
      borderRadius: scale(12),
      padding: scale(16),
      marginBottom: verticalScale(16),
      borderWidth: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(16),
      gap: scale(8),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontFamily: Typography.fontFamily.semiBold,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastInfoRow: {
      borderBottomWidth: 0,
    },
    infoLabel: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
    },
    infoValue: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
      textAlign: 'right',
      flex: 1,
      marginLeft: scale(16),
    },
    roleBadge: {
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(4),
      borderRadius: scale(8),
    },
    roleText: {
      fontSize: scale(12),
      fontFamily: Typography.fontFamily.semiBold,
      textTransform: 'uppercase',
    },
    themeInfo: {
      flex: 1,
    },
    themeDescription: {
      fontSize: scale(12),
      fontFamily: Typography.fontFamily.regular,
      marginTop: verticalScale(2),
    },
    logoutContainer: {
      paddingTop: verticalScale(8),
    },
  });
