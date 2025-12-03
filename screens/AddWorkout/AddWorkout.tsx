import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { CustomText } from '@/components';
import { Typography } from '@/constants/Typography';
import { scale, verticalScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoachDashboardStackParamList } from '@/types/navigation/stacks';
import { CreateWorkoutRequest } from '@/api/types/workouts';
import { useCreateWorkout } from '@/hooks';

interface AddWorkoutFormState {
  name: string;
  description: string;
  durationMinutes: number;
  assignedToPositions: string[];
  difficultyLevel: string;
  equipmentNeededInput: string;
}

type AddWorkoutNavigationProp = StackNavigationProp<CoachDashboardStackParamList>;

export const AddWorkout = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<AddWorkoutNavigationProp>();
  const styles = getStyles(colors);
  const { mutateAsync: createWorkout, isPending } = useCreateWorkout();

  const [formData, setFormData] = useState<AddWorkoutFormState>({
    name: '',
    description: '',
    durationMinutes: 0,
    assignedToPositions: [],
    difficultyLevel: '',
    equipmentNeededInput: '',
  });
  const [positionSpecific, setPositionSpecific] = useState(false);
  const [loading, setLoading] = useState(false);

  const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];

  const togglePosition = (position: string) => {
    setFormData((prev) => {
      const positions = prev.assignedToPositions || [];
      const isSelected = positions.includes(position);

      return {
        ...prev,
        assignedToPositions: isSelected
          ? positions.filter((p) => p !== position)
          : [...positions, position],
      };
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter workout name');
      return false;
    }
    if (formData.durationMinutes <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid duration');
      return false;
    }
    if (
      positionSpecific &&
      (!formData.assignedToPositions || formData.assignedToPositions.length === 0)
    ) {
      Alert.alert('Validation Error', 'Please select at least one position');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const workoutData: CreateWorkoutRequest = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        durationMinutes: formData.durationMinutes,
        assignedToPositions: positionSpecific ? formData.assignedToPositions : undefined,
        difficultyLevel: formData.difficultyLevel.trim().toLowerCase() || undefined,
        equipmentNeeded:
          formData.equipmentNeededInput.trim().length > 0
            ? formData.equipmentNeededInput
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item.length > 0)
            : undefined,
      };

      await createWorkout(workoutData);

      Alert.alert('Success', 'Workout created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to create workout:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to create workout. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <CustomText style={[styles.headerTitle, { color: colors.text }]}>Add Workout</CustomText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Workout Name */}
        <View style={styles.section}>
          <CustomText style={[styles.label, { color: colors.text }]}>Workout Name *</CustomText>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.cardBackground,
              },
            ]}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., Morning Strength Training"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <CustomText style={[styles.label, { color: colors.text }]}>Description</CustomText>
          <TextInput
            style={[
              styles.textArea,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.cardBackground,
              },
            ]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Add workout details..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <CustomText style={[styles.label, { color: colors.text }]}>
            Duration (minutes) *
          </CustomText>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.cardBackground,
              },
            ]}
            value={formData.durationMinutes > 0 ? formData.durationMinutes.toString() : ''}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              setFormData({ ...formData, durationMinutes: num });
            }}
            placeholder="60"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>

        {/* Difficulty Level */}
        <View style={styles.section}>
          <CustomText style={[styles.label, { color: colors.text }]}>
            Difficulty Level (optional)
          </CustomText>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.cardBackground,
              },
            ]}
            value={formData.difficultyLevel}
            onChangeText={(text) => setFormData({ ...formData, difficultyLevel: text })}
            placeholder="e.g., Beginner, Intermediate, Advanced"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Equipment Needed */}
        <View style={styles.section}>
          <CustomText style={[styles.label, { color: colors.text }]}>
            Equipment Needed (comma separated, optional)
          </CustomText>
          <TextInput
            style={[
              styles.textArea,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.cardBackground,
              },
            ]}
            value={formData.equipmentNeededInput}
            onChangeText={(text) => setFormData({ ...formData, equipmentNeededInput: text })}
            placeholder="e.g., Barbell, Plates, Bench"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Position Specific Toggle */}
        <View style={[styles.section, styles.toggleSection]}>
          <View style={styles.toggleInfo}>
            <CustomText style={[styles.label, { color: colors.text }]}>
              Position Specific
            </CustomText>
            <CustomText style={[styles.toggleDescription, { color: colors.textMuted }]}>
              Target specific positions instead of entire team
            </CustomText>
          </View>
          <Switch
            value={positionSpecific}
            onValueChange={(value) => {
              setPositionSpecific(value);
              if (!value) {
                setFormData({ ...formData, assignedToPositions: [] });
              }
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={positionSpecific ? colors.primaryLight : '#f4f3f4'}
            ios_backgroundColor={colors.border}
          />
        </View>

        {/* Position Selection */}
        {positionSpecific && (
          <View style={styles.section}>
            <CustomText style={[styles.label, { color: colors.text }]}>
              Target Positions *
            </CustomText>
            <View style={styles.positionsGrid}>
              {positions.map((position) => {
                const isSelected = formData.assignedToPositions?.includes(position);
                return (
                  <TouchableOpacity
                    key={position}
                    style={[
                      styles.positionChip,
                      { borderColor: colors.border },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => togglePosition(position)}>
                    <CustomText
                      style={[
                        styles.positionText,
                        { color: colors.text },
                        isSelected && { color: '#fff' },
                      ]}>
                      {position}
                    </CustomText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            loading && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <CustomText style={styles.submitButtonText}>Create Workout</CustomText>
            </>
          )}
        </TouchableOpacity>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: scale(4),
    },
    headerTitle: {
      fontSize: scale(20),
      fontFamily: Typography.fontFamily.bold,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: scale(20),
      paddingBottom: verticalScale(40),
    },
    section: {
      marginBottom: verticalScale(24),
    },
    label: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
      marginBottom: verticalScale(8),
    },
    input: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.regular,
      borderWidth: 1,
      borderRadius: scale(12),
      padding: scale(16),
      minHeight: verticalScale(50),
    },
    textArea: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.regular,
      borderWidth: 1,
      borderRadius: scale(12),
      padding: scale(16),
      minHeight: verticalScale(120),
    },
    toggleSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    toggleInfo: {
      flex: 1,
      marginRight: scale(16),
    },
    toggleDescription: {
      fontSize: scale(12),
      fontFamily: Typography.fontFamily.regular,
      marginTop: verticalScale(2),
    },
    positionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(8),
    },
    positionChip: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(10),
      borderRadius: scale(20),
      borderWidth: 1,
    },
    positionText: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: scale(16),
      borderRadius: scale(12),
      gap: scale(8),
      marginTop: verticalScale(8),
    },
    submitButtonText: {
      color: '#fff',
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.semiBold,
    },
  });
