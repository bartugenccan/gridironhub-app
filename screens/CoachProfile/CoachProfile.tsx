import { StyleSheet, View, ScrollView, Switch, TouchableOpacity, TextInput, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomText, LogoutButton } from '@/components';
import { Typography } from '@/constants/Typography';
import { scale, verticalScale } from 'react-native-size-matters';
import { useCurrentCoachProfile, useUpdateCoachProfile } from '@/hooks/useCoach';
import { z } from 'zod';
import { coachPositions } from '@/constants/CoachPositions';

const coachProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  preferredPositions: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

export const CoachProfile = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const styles = getStyles(colors);

  const { data: coachProfile, isLoading, refetch } = useCurrentCoachProfile();
  const { mutate: updateProfile, isPending } = useUpdateCoachProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    yearsOfExperience: '',
    preferredPositions: [''],
    certifications: '', // Simplified as comma-separated string for now
  });

  useEffect(() => {
    if (coachProfile) {
      setFormData({
        fullName: coachProfile.fullName || '',
        bio: coachProfile.bio || '',
        yearsOfExperience: coachProfile.yearsOfExperience?.toString() || '',
        preferredPositions: coachProfile.preferredPositions || [''],
        certifications: coachProfile.certifications?.join(', ') || '',
      });
    }
  }, [coachProfile]);

  const handleSave = () => {
    if (!coachProfile) return;

    const updates: any = {};

    if (formData.fullName !== coachProfile.fullName) {
      updates.fullName = formData.fullName;
    }
    if (formData.bio !== coachProfile.bio) {
      updates.bio = formData.bio;
    }

    // Parse years of experience
    if (formData.yearsOfExperience !== coachProfile.yearsOfExperience?.toString()) {
      const years = parseInt(formData.yearsOfExperience);
      if (formData.yearsOfExperience && isNaN(years)) {
        Alert.alert('Validation Error', 'Years of experience must be a valid number');
        return;
      }
      updates.yearsOfExperience = isNaN(years) ? undefined : years;
    }

    if (JSON.stringify(formData.preferredPositions.sort()) !== JSON.stringify((coachProfile.preferredPositions || []).sort())) {
      updates.preferredPositions = formData.preferredPositions.filter(p => p !== '');
    }

    // Parse certifications from comma string
    const certArray = formData.certifications.split(',').map(c => c.trim()).filter(c => c !== '');
    if (JSON.stringify(certArray.sort()) !== JSON.stringify((coachProfile.certifications || []).sort())) {
      updates.certifications = certArray;
    }

    try {
      coachProfileUpdateSchema.parse(updates);
    } catch (error) {
      if (error instanceof z.ZodError) {
        Alert.alert('Validation Error', error.issues[0].message);
        return;
      }
    }

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }

    updateProfile(
      { coachId: coachProfile.id, data: updates },
      {
        onSuccess: async () => {
          await refetch();
          setIsEditing(false);
          Alert.alert('Success', 'Profile updated successfully!');
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to update profile');
        }
      }
    );
  };

  const handleCancel = () => {
    if (coachProfile) {
      setFormData({
        fullName: coachProfile.fullName || '',
        bio: coachProfile.bio || '',
        yearsOfExperience: coachProfile.yearsOfExperience?.toString() || '',
        preferredPositions: coachProfile.preferredPositions || [''],
        certifications: coachProfile.certifications?.join(', ') || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <CustomText style={[styles.headerTitle, { color: colors.text }]}>Coach Profile</CustomText>
        {!isEditing && !isLoading && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <CustomText style={styles.editButtonText}>Edit</CustomText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={colors.primary} />
            <CustomText style={[styles.sectionTitle, { color: colors.text }]}>
              Basic Information
            </CustomText>
          </View>

          {/* Full Name */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Name
            </CustomText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                placeholder="Enter name"
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading ? '...' : coachProfile?.fullName || 'Not set'}
              </CustomText>
            )}
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

          {/* Current Team */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Current Team
            </CustomText>
            <CustomText style={[styles.infoValue, { color: colors.text }]}>
              {isLoading ? '...' : coachProfile?.currentTeam || 'Not set'}
            </CustomText>
          </View>

          {/* Experience */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Experience (Years)
            </CustomText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.yearsOfExperience}
                onChangeText={(text) => setFormData({ ...formData, yearsOfExperience: text })}
                keyboardType="number-pad"
                placeholder="e.g. 5"
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading ? '...' : coachProfile?.yearsOfExperience ? `${coachProfile.yearsOfExperience} years` : 'Not set'}
              </CustomText>
            )}
          </View>

          {/* Preferred Positions */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Specialties
            </CustomText>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.positionSelector, { borderColor: colors.border }]}
                onPress={() => setShowPositionModal(true)}
              >
                <CustomText
                  style={[styles.positionText, { color: formData.preferredPositions.length > 0 ? colors.text : colors.textMuted }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formData.preferredPositions && formData.preferredPositions.length > 0 && formData.preferredPositions[0] !== ""
                    ? formData.preferredPositions.join(', ')
                    : 'Select positions'}
                </CustomText>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading ? '...' : coachProfile?.preferredPositions?.join(', ') || 'Not set'}
              </CustomText>
            )}
          </View>

        </View>

        {/* Additional Details */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <CustomText style={[styles.sectionTitle, { color: colors.text }]}>
              Details
            </CustomText>
          </View>

          {/* Certifications */}
          {isEditing ? (
            <View style={styles.inputContainer}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary, marginBottom: verticalScale(8) }]}>
                Certifications (comma separated)
              </CustomText>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, minHeight: verticalScale(60) }]}
                value={formData.certifications}
                onChangeText={(text) => setFormData({ ...formData, certifications: text })}
                placeholder="e.g. CSCS, USAW Level 1"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>
          ) : (
            <View style={styles.infoRow}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Certifications
              </CustomText>
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading ? '...' : coachProfile?.certifications?.join(', ') || 'None'}
              </CustomText>
            </View>
          )}

          {/* Bio */}
          {isEditing ? (
            <View style={[styles.inputContainer, { marginTop: verticalScale(12) }]}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary, marginBottom: verticalScale(8) }]}>
                Bio
              </CustomText>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Tell us about your coaching philosophy..."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>
          ) : (
            <View style={[styles.infoRow, styles.lastInfoRow, { flexDirection: 'column', alignItems: 'flex-start', gap: verticalScale(8) }]}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Bio
              </CustomText>
              <CustomText style={[styles.bioText, { color: colors.text }]}>
                {isLoading ? '...' : coachProfile?.bio || 'No bio available'}
              </CustomText>
            </View>
          )}
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
          <View style={[styles.settingRow, styles.lastInfoRow]}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={theme === 'dark' ? 'moon' : 'sunny'}
                size={20}
                color={colors.textSecondary}
              />
              <View>
                <CustomText style={[styles.infoLabel, { color: colors.text }]}>
                  Dark Mode
                </CustomText>
              </View>
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
        {isEditing ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
              disabled={isPending}
            >
              <CustomText style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <CustomText style={styles.saveButtonText}>Save Changes</CustomText>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
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
        )}

      </ScrollView>

      {/* Position Selection Modal */}
      <Modal
        visible={showPositionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPositionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <CustomText style={[styles.modalTitle, { color: colors.text }]}>
                Select Specialties
              </CustomText>
              <TouchableOpacity onPress={() => setShowPositionModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={coachPositions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.positionItem,
                    { borderBottomColor: colors.border },
                    formData.preferredPositions.includes(item) && { backgroundColor: colors.primaryLight + '20' },
                  ]}
                  onPress={() => {
                    const currentPositions = formData.preferredPositions.filter((p) => p !== "");
                    let newPositions;
                    if (currentPositions.includes(item)) {
                      newPositions = currentPositions.filter((p) => p !== item);
                    } else {
                      newPositions = [...currentPositions, item];
                    }
                    setFormData({ ...formData, preferredPositions: newPositions });
                  }}
                >
                  <CustomText style={[styles.positionItemText, { color: colors.text }]}>
                    {item}
                  </CustomText>
                  {formData.preferredPositions.includes(item) && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: scale(24),
      fontFamily: Typography.fontFamily.bold,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: scale(8),
      gap: scale(4),
    },
    editButtonText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
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
    input: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
      borderWidth: 1,
      borderRadius: scale(8),
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      minWidth: scale(120),
      textAlign: 'right',
    },
    inputContainer: {

    },
    textArea: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
      borderWidth: 1,
      borderRadius: scale(8),
      padding: scale(12),
      minHeight: verticalScale(100),
    },
    bioText: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
      lineHeight: scale(20),
    },
    positionSelector: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: scale(8),
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(8),
      marginLeft: scale(16),
      gap: scale(8),
    },
    positionText: {
      flex: 1,
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
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

    themeDescription: {
      fontSize: scale(12),
      fontFamily: Typography.fontFamily.regular,
      marginTop: verticalScale(2),
    },
    logoutContainer: {
      paddingTop: verticalScale(8),
    },
    actionButtons: {
      flexDirection: 'row',
      gap: scale(12),
      marginBottom: verticalScale(40),
    },
    cancelButton: {
      flex: 1,
      padding: scale(16),
      borderRadius: scale(12),
      borderWidth: 1,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
    },
    saveButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: scale(16),
      borderRadius: scale(12),
      gap: scale(8),
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: scale(20),
      borderTopRightRadius: scale(20),
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: scale(20),
      borderBottomWidth: 1,
    },
    modalTitle: {
      fontSize: scale(18),
      fontFamily: Typography.fontFamily.bold,
    },
    positionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: scale(16),
      borderBottomWidth: 1,
    },
    positionItemText: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.regular,
    },
  });
