import { StyleSheet, View, Text, TouchableOpacity, Switch, TextInput, ScrollView, Alert, Modal, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomText } from '@/components';
import { scale, verticalScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentPlayerProfile, useUpdatePlayerProfile } from '@/hooks/usePlayer';
import { Typography } from '@/constants/Typography';
import { playerPositions } from '@/constants/PlayerPositions';

// Validation schema matching backend
const playerProfileUpdateSchema = z.object({
  jerseyNumber: z.number().int().positive().optional(),
  positions: z.array(z.string()).min(1).optional(),
  dominantHand: z.enum(['left', 'right', 'ambidextrous']).optional(),
  heightCm: z.number().int().positive().optional(),
  weightKg: z.number().int().positive().optional(),
  bio: z.string().max(1000).optional(),
});

export const ProfileScreen = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { data: playerProfile, isLoading, error, refetch } = useCurrentPlayerProfile();
  const { mutate: updateProfile, isPending } = useUpdatePlayerProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [formData, setFormData] = useState({
    jerseyNumber: '',
    positions: [""],
    heightCm: '',
    weightKg: '',
    dominantHand: '' as 'left' | 'right' | 'ambidextrous' | '',
    bio: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (playerProfile) {
      setFormData({
        jerseyNumber: playerProfile.jerseyNumber?.toString() || '',
        positions: playerProfile.positions || [""],
        heightCm: playerProfile.heightCm?.toString() || '',
        weightKg: playerProfile.weightKg?.toString() || '',
        dominantHand: playerProfile.dominantHand || '',
        bio: playerProfile.bio || '',
      });
    }
  }, [playerProfile]);

  const handleSave = () => {
    if (!playerProfile) return;

    // Build update payload (only include changed fields)
    const updates: any = {};

    if (formData.jerseyNumber && formData.jerseyNumber !== playerProfile.jerseyNumber?.toString()) {
      const jerseyNum = parseInt(formData.jerseyNumber);
      if (isNaN(jerseyNum)) {
        Alert.alert('Validation Error', 'Jersey number must be a valid number');
        return;
      }
      updates.jerseyNumber = jerseyNum;
    }
    if (
      formData.positions &&
      JSON.stringify(formData.positions.sort()) !==
      JSON.stringify((playerProfile.positions || []).sort())
    ) {
      updates.positions = formData.positions;
    }
    if (formData.heightCm && formData.heightCm !== playerProfile.heightCm?.toString()) {
      const height = parseInt(formData.heightCm);
      if (isNaN(height)) {
        Alert.alert('Validation Error', 'Height must be a valid number');
        return;
      }
      updates.heightCm = height;
    }
    if (formData.weightKg && formData.weightKg !== playerProfile.weightKg?.toString()) {
      const weight = parseInt(formData.weightKg);
      if (isNaN(weight)) {
        Alert.alert('Validation Error', 'Weight must be a valid number');
        return;
      }
      updates.weightKg = weight;
    }
    if (formData.dominantHand && formData.dominantHand !== playerProfile.dominantHand) {
      updates.dominantHand = formData.dominantHand;
    }
    if (formData.bio !== playerProfile.bio) {
      updates.bio = formData.bio;
    }

    // Validate with Zod
    try {
      playerProfileUpdateSchema.parse(updates);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        const fieldName = firstError.path.join('.');
        Alert.alert('Validation Error', `${fieldName}: ${firstError.message}`);
        return;
      }
    }

    // If no changes, just exit edit mode
    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }

    updateProfile(
      { playerId: playerProfile.id, data: updates },
      {
        onSuccess: async () => {
          // Manually refetch to get complete profile data
          await refetch();
          setIsEditing(false);
          Alert.alert('Success', 'Profile updated successfully!');
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to update profile');
        },
      }
    );
  };



  const handleCancel = () => {
    // Reset form to current profile data
    if (playerProfile) {
      setFormData({
        jerseyNumber: playerProfile.jerseyNumber?.toString() || '',
        positions: playerProfile.positions || [''],
        heightCm: playerProfile.heightCm?.toString() || '',
        weightKg: playerProfile.weightKg?.toString() || '',
        dominantHand: playerProfile.dominantHand || '',
        bio: playerProfile.bio || '',
      });
    }
    setIsEditing(false);
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <CustomText style={[styles.headerTitle, { color: colors.text }]}>Profile</CustomText>
        {!isEditing && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Player Info Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={colors.primary} />
            <CustomText style={[styles.sectionTitle, { color: colors.text }]}>
              Player Information
            </CustomText>
          </View>

          {/* Name (Read-only) */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Name
            </CustomText>
            <CustomText style={[styles.infoValue, { color: colors.text }]}>
              {user?.fullName || 'Not set'}
            </CustomText>
          </View>

          {/* Jersey Number */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Jersey Number
            </CustomText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.jerseyNumber}
                onChangeText={(text) => setFormData({ ...formData, jerseyNumber: text })}
                keyboardType="number-pad"
                placeholder="Enter number"
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <CustomText style={[styles.infoValue, { color: colors.primary }]}>
                {isLoading ? '...' : playerProfile?.jerseyNumber ? `#${playerProfile.jerseyNumber}` : 'Not set'}
              </CustomText>
            )}
          </View>

          {/* Position */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Position
            </CustomText>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.positionSelector, { borderColor: colors.border }]}
                onPress={() => setShowPositionModal(true)}
              >
                <CustomText style={[styles.positionText, { color: formData.positions ? colors.text : colors.textMuted }]}>
                  {formData.positions && formData.positions.length > 0 && formData.positions[0] !== ""
                    ? formData.positions.join(', ')
                    : 'Select position'}
                </CustomText>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading ? '...' : playerProfile?.positions?.join(', ') || 'Not set'}
              </CustomText>
            )}
          </View>

          {/* Height */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Height (cm)
            </CustomText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.heightCm}
                onChangeText={(text) => setFormData({ ...formData, heightCm: text })}
                keyboardType="number-pad"
                placeholder="e.g., 185"
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading ? '...' : playerProfile?.heightCm ? `${playerProfile.heightCm} cm` : 'Not set'}
              </CustomText>
            )}
          </View>

          {/* Weight */}
          <View style={styles.infoRow}>
            <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Weight (kg)
            </CustomText>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.weightKg}
                onChangeText={(text) => setFormData({ ...formData, weightKg: text })}
                keyboardType="number-pad"
                placeholder="e.g., 90"
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading ? '...' : playerProfile?.weightKg ? `${playerProfile.weightKg} kg` : 'Not set'}
              </CustomText>
            )}
          </View>

          {/* Dominant Hand */}
          {isEditing ? (
            <View style={styles.dominantHandSection}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary, marginBottom: verticalScale(8) }]}>
                Dominant Hand
              </CustomText>
              <View style={styles.handButtons}>
                {(['left', 'right', 'ambidextrous'] as const).map((hand) => (
                  <TouchableOpacity
                    key={hand}
                    style={[
                      styles.handButton,
                      { borderColor: colors.border },
                      formData.dominantHand === hand && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setFormData({ ...formData, dominantHand: hand })}
                  >
                    <Text
                      style={[
                        styles.handButtonText,
                        { color: formData.dominantHand === hand ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {hand.charAt(0).toUpperCase() + hand.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Dominant Hand
              </CustomText>
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading
                  ? '...'
                  : playerProfile?.dominantHand
                    ? playerProfile.dominantHand.charAt(0).toUpperCase() + playerProfile.dominantHand.slice(1)
                    : 'Not set'}
              </CustomText>
            </View>
          )}

          {/* Bio */}
          {isEditing ? (
            <View style={[styles.bioContainer, { borderTopColor: colors.border }]}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary, marginBottom: verticalScale(8) }]}>
                Bio
              </CustomText>
              <TextInput
                style={[styles.bioInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Tell us about yourself..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          ) : (
            <View style={styles.infoRow}>
              <CustomText style={[styles.infoLabel, { color: colors.textSecondary }]}>Bio</CustomText>
              <CustomText style={[styles.infoValue, { color: colors.text }]}>
                {isLoading ? '...' : playerProfile?.bio || 'Not set'}
              </CustomText>
            </View>
          )}
        </View>

        {/* Theme Toggle Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
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
        </View>

        {/* Action Buttons */}
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
                <CustomText style={styles.saveButtonText}>Saving...</CustomText>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <CustomText style={styles.saveButtonText}>Save Changes</CustomText>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error || '#FF3B30' }]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <CustomText style={styles.logoutText}>Log Out</CustomText>
          </TouchableOpacity>
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
                Select Position
              </CustomText>
              <TouchableOpacity onPress={() => setShowPositionModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={playerPositions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.positionItem,
                    { borderBottomColor: colors.border },
                    formData.positions.includes(item) && { backgroundColor: colors.primaryLight + '20' },
                  ]}
                  onPress={() => {
                    const currentPositions = formData.positions.filter((p) => p !== ""); // Clean empty strings
                    let newPositions;
                    if (currentPositions.includes(item)) {
                      newPositions = currentPositions.filter((p) => p !== item);
                    } else {
                      newPositions = [...currentPositions, item];
                    }
                    setFormData({ ...formData, positions: newPositions });
                    // Don't close modal immediately for multi-select
                  }}
                >
                  <CustomText style={[styles.positionItemText, { color: colors.text }]}>
                    {item}
                  </CustomText>
                  {formData.positions.includes(item) && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(15),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontFamily: Typography.fontFamily.bold,
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
    fontFamily: Typography.fontFamily.regular,
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
    fontFamily: Typography.fontFamily.regular,
  },
  infoValue: {
    fontSize: scale(16),
    fontFamily: Typography.fontFamily.semiBold,
  },
  input: {
    fontSize: scale(16),
    fontFamily: Typography.fontFamily.semiBold,
    borderWidth: 1,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    minWidth: scale(100),
    textAlign: 'right',
  },
  positionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    minWidth: scale(120),
    gap: scale(8),
  },
  positionText: {
    fontSize: scale(16),
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
  dominantHandSection: {
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  handButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  handButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  handButtonText: {
    fontSize: scale(12),
    fontFamily: Typography.fontFamily.semiBold,
  },
  bioContainer: {
    borderTopWidth: 1,
    paddingTop: verticalScale(12),
    marginTop: verticalScale(8),
  },
  bioInput: {
    fontSize: scale(14),
    fontFamily: Typography.fontFamily.regular,
    borderWidth: 1,
    borderRadius: scale(8),
    padding: scale(12),
    minHeight: verticalScale(100),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: verticalScale(20),
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(16),
    borderRadius: scale(12),
    gap: scale(8),
    marginBottom: verticalScale(20),
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: scale(16),
    fontFamily: Typography.fontFamily.semiBold,
  },
});
