import { StyleSheet, View, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomText } from '@/components';
import { Typography } from '@/constants/Typography';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';
import { RouteProp, useRoute } from '@react-navigation/native';
import { WorkoutsDetail as WorkoutDetailType } from '@/api/types/workoutsDetail';
import { workoutsService } from '@/api/services/workouts.service';
import { extractYoutubeVideoId } from '@/utils/youtubeFormatter';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateWorkout } from '@/hooks/useWorkouts';
import { playerPositions } from '@/constants/PlayerPositions';

type WorkoutsDetailRouteProp = RouteProp<
  { WorkoutsDetail: { workoutId: string } },
  'WorkoutsDetail'
>;

export const WorkoutsDetail = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const route = useRoute<WorkoutsDetailRouteProp>();
  const { workoutId } = route.params;

  const { user } = useAuth();
  const isCoach = user?.role === 'coach';

  const [workout, setWorkout] = useState<WorkoutDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    durationMinutes: '',
    youtubeUrl: '',
    assignedToPositions: [] as string[],
    equipmentNeeded: [] as string[],
  });

  const { mutate: updateWorkout, isPending: isUpdating } = useUpdateWorkout();

  useEffect(() => {
    fetchWorkoutDetail();
  }, [workoutId]);

  useEffect(() => {
    if (workout) {
      setEditForm({
        name: workout.name,
        description: workout.description || '',
        durationMinutes: workout.durationMinutes.toString(),
        youtubeUrl: workout.youtubeUrl || '',
        assignedToPositions: workout.assignedToPositions || [],
        equipmentNeeded: workout.equipmentNeeded || [],
      });
    }
  }, [workout]);

  const fetchWorkoutDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workoutsService.getWorkoutDetail(workoutId);
      setWorkout(data);
    } catch (err) {
      console.error('Failed to fetch workout detail:', err);
      setError('Failed to load workout details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.durationMinutes) {
      Alert.alert('Error', 'Name and Duration are required');
      return;
    }

    updateWorkout(
      {
        id: workoutId,
        data: {
          ...editForm,
          durationMinutes: parseInt(editForm.durationMinutes) || 0,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Workout updated');
          setIsEditing(false);
          fetchWorkoutDetail();
        },
        onError: (err) => {
          Alert.alert('Error', err.message || 'Failed to update workout');
        },
      }
    );
  };

  const togglePosition = (position: string) => {
    setEditForm((prev) => {
      const current = prev.assignedToPositions || [];
      if (current.includes(position)) {
        return { ...prev, assignedToPositions: current.filter((p) => p !== position) };
      } else {
        return { ...prev, assignedToPositions: [...current, position] };
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText style={styles.loadingText}>Loading workout details...</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
          <CustomText style={styles.errorText}>{error || 'Workout not found'}</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          {isCoach && (
            <View style={{ position: 'absolute', top: scale(48), right: scale(16), zIndex: 10 }}>
              {isEditing ? (
                <View style={{ flexDirection: 'row', gap: scale(8) }}>
                  <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.actionButton}>
                    <Ionicons name="close" size={24} color={colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionButton}>
                  <Ionicons name="create-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="dumbbell" size={40} color={colors.recordIconColor} />
          </View>
          {isEditing ? (
            <TextInput
              style={[styles.titleInput, { color: colors.text }]}
              value={editForm.name}
              onChangeText={(t) => setEditForm({ ...editForm, name: t })}
              placeholder="Workout Name"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <CustomText style={styles.title}>{workout.name}</CustomText>
          )}

          <View style={styles.metaContainer}>
            <View style={styles.durationContainer}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={colors.textSecondary} />
              {isEditing ? (
                <TextInput
                  style={[styles.durationInput, { color: colors.recordIconColor }]}
                  value={editForm.durationMinutes}
                  onChangeText={(t) => setEditForm({ ...editForm, durationMinutes: t })}
                  keyboardType="number-pad"
                  placeholder="Min"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <CustomText style={styles.duration}>{workout.durationMinutes} minutes</CustomText>
              )}
            </View>
          </View>
        </View>

        {/* Description Section */}
        {(workout.description || isEditing) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="text-box-outline" size={22} color={colors.primary} />
              <CustomText style={styles.sectionTitle}>Description</CustomText>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.descriptionInput, { color: colors.textSecondary }]}
                value={editForm.description}
                onChangeText={(t) => setEditForm({ ...editForm, description: t })}
                multiline
                placeholder="Description"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <CustomText style={styles.description}>{workout.description}</CustomText>
            )}
          </View>
        )}

        {/* Assigned Positions Section */}
        {(workout.assignedToPositions || isEditing) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-group" size={22} color={colors.primary} />
              <CustomText style={styles.sectionTitle}>Target Positions</CustomText>
            </View>
            {isEditing ? (
              <TouchableOpacity
                onPress={() => setShowPositionModal(true)}
                style={styles.chipSelector}>
                {editForm.assignedToPositions.length > 0 ? (
                  <View style={styles.positionsContainer}>
                    {editForm.assignedToPositions.map((position, index) => (
                      <View key={index} style={styles.positionChip}>
                        <CustomText style={styles.positionText}>{position}</CustomText>
                      </View>
                    ))}
                  </View>
                ) : (
                  <CustomText style={{ color: colors.textSecondary }}>Select Positions</CustomText>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.positionsContainer}>
                {workout.assignedToPositions?.map((position, index) => (
                  <View key={index} style={styles.positionChip}>
                    <CustomText style={styles.positionText}>{position}</CustomText>
                  </View>
                ))}
              </View>
            )}
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

          <View style={[styles.infoRow, styles.lastInfoRow]}>
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

        {isEditing && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="youtube" size={22} color={colors.primary} />
              <CustomText style={styles.sectionTitle}>YouTube Video URL</CustomText>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.borderLight,
                  borderWidth: 1,
                  padding: 8,
                  borderRadius: 8,
                },
              ]}
              value={editForm.youtubeUrl}
              onChangeText={(t) => setEditForm({ ...editForm, youtubeUrl: t })}
              placeholder="https://youtube.com/..."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
        )}

        {/*Youtube Video Section*/}
        {(workout.youtubeUrl || isEditing) && (
          <View
            style={{
              marginTop: 24,
              marginHorizontal: 16,
              overflow: 'hidden',
              borderRadius: 12,
            }}>
            <YoutubePlayer
              height={220}
              play={false}
              videoId={extractYoutubeVideoId(isEditing ? editForm.youtubeUrl : (workout.youtubeUrl || '')) || undefined}
            />
          </View>
        )}
      </ScrollView>

      {/* Position Modal */}
      <Modal
        visible={showPositionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPositionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.playerDashboardBackground }]}>
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>Select Positions</CustomText>
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
                    { borderBottomColor: colors.borderLight },
                    editForm.assignedToPositions.includes(item) && {
                      backgroundColor: colors.primary + '20',
                    },
                  ]}
                  onPress={() => togglePosition(item)}>
                  <CustomText style={{ color: colors.text }}>{item}</CustomText>
                  {editForm.assignedToPositions.includes(item) && (
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
      backgroundColor: colors.playerDashboardBackground,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: verticalScale(16),
    },
    loadingText: {
      fontSize: 16,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: verticalScale(16),
      padding: scale(24),
    },
    errorText: {
      fontSize: 16,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.error,
      textAlign: 'center',
      marginBottom: verticalScale(16),
    },
    header: {
      backgroundColor: colors.playerCardBackground,
      paddingTop: scale(50),
      paddingBottom: scale(24),
      paddingHorizontal: scale(24),
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
    lastInfoRow: {
      borderBottomWidth: 0,
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
    actionButton: {
      padding: 8,
      backgroundColor: colors.playerCardBackground,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    titleInput: {
      fontSize: 26,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: verticalScale(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.primary,
      minWidth: '60%',
    },
    durationInput: {
      fontSize: 15,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.recordIconColor,
      minWidth: 40,
    },
    descriptionInput: {
      fontSize: 15,
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
      lineHeight: 24,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 8,
      padding: 8,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    chipSelector: {
      minHeight: 40,
      justifyContent: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      borderRadius: 12,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    positionItem: {
      padding: 16,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    input: {
      fontSize: 14,
      fontFamily: Typography.fontFamily.regular,
    },
  });
