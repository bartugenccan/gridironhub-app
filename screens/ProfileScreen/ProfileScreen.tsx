import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomText } from '@/components';
import { scale, verticalScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProfileScreen = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <CustomText style={[styles.headerTitle, { color: colors.text }]}>Profile</CustomText>
      </View>

      <View style={styles.content}>
        {/* Theme Toggle Section */}
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

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={theme === 'dark' ? 'moon' : 'sunny'}
                size={20}
                color={colors.textSecondary}
              />
              <CustomText style={[styles.settingLabel, { color: colors.text }]}>
                Dark Mode
              </CustomText>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={theme === 'dark' ? colors.primaryLight : '#f4f3f4'}
            />
          </View>

          <CustomText style={[styles.settingDescription, { color: colors.textMuted }]}>
            {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
          </CustomText>
        </View>

        {/* User Info Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={colors.primary} />
            <CustomText style={[styles.sectionTitle, { color: colors.text }]}>
              User Information
            </CustomText>
          </View>

          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Name
            </CustomText>
            <CustomText style={[styles.infoValue, { color: colors.text }]}>
              Bartu Gençcan
            </CustomText>
          </View>

          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Position
            </CustomText>
            <CustomText style={[styles.infoValue, { color: colors.text }]}>QuarterBack</CustomText>
          </View>

          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Number
            </CustomText>
            <CustomText style={[styles.infoValue, { color: colors.primary }]}>#4</CustomText>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error || '#FF3B30' }]}
          onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <CustomText style={styles.logoutText}>Log Out</CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(15),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: scale(20),
  },
  section: {
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    gap: scale(12),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  settingLabel: {
    fontSize: scale(16),
  },
  settingDescription: {
    fontSize: scale(12),
    marginTop: verticalScale(8),
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: scale(14),
  },
  infoValue: {
    fontSize: scale(16),
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(16),
    borderRadius: scale(12),
    gap: scale(8),
    marginTop: 'auto',
    marginBottom: verticalScale(20),
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: scale(16),
    fontWeight: '600',
  },
});
