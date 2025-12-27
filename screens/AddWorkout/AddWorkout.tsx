import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { workoutSchema } from '@/validations/workout.schema';

interface AddWorkoutFormState {
  name: string;
  description: string;
  durationMinutes: number;
  assignedToPositions: string[];
  equipmentNeededInput: string;
  scheduledDate: string; // YYYY-MM-DD format
  youtubeUrl: string;
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
    equipmentNeededInput: '',
    scheduledDate: '',
    youtubeUrl: '',
  });
  const [positionSpecific, setPositionSpecific] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(currentDate);
      setFormData({ ...formData, scheduledDate: formatDate(currentDate) });
    }
  };

  const handleSubmit = async () => {
    // Validate form data using Zod schema
    const dataToValidate = {
      ...formData,
      positionSpecific,
    };

    const validation = workoutSchema.safeParse(dataToValidate);

    if (!validation.success) {
      Alert.alert('Validation Error', validation.error.issues[0].message);
      return;
    }

    // Use validated data for submission
    const validatedData = validation.data;

    try {
      const workoutData: CreateWorkoutRequest = {
        name: validatedData.name.trim(),
        description: validatedData.description?.trim() || undefined,
        durationMinutes: validatedData.durationMinutes,
        assignedToPositions: positionSpecific ? validatedData.assignedToPositions : undefined,
        equipmentNeeded:
          formData.equipmentNeededInput.trim().length > 0
            ? formData.equipmentNeededInput
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item.length > 0)
            : undefined,
        scheduledDate: formData.scheduledDate || undefined,
        youtubeUrl: validatedData.youtubeUrl?.trim() || undefined,
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

        {/* YouTube URL */}
        <View style={styles.section}>
          <CustomText style={[styles.label, { color: colors.text }]}>
            YouTube Video URL (optional)
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
            value={formData.youtubeUrl}
            onChangeText={(text) => setFormData({ ...formData, youtubeUrl: text })}
            placeholder="https://www.youtube.com/watch?v=..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {/* Scheduled Date */}
        <View style={styles.section}>
          <CustomText style={[styles.label, { color: colors.text }]}>
            Scheduled Date (optional)
          </CustomText>
          <TouchableOpacity
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.cardBackground,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
            ]}
            onPress={() => setShowDatePicker(true)}>
            <CustomText
              style={[
                styles.dateText,
                { color: formData.scheduledDate ? colors.text : colors.textMuted },
              ]}>
              {formData.scheduledDate
                ? new Date(formData.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select date'}
            </CustomText>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {showDatePicker && (
            <View>
              <DateTimePicker
                testID="dateTimePicker"
                value={selectedDate}
                mode="date"
                is24Hour={true}
                minimumDate={new Date()}
                onChange={onChange}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    padding: 8,
                    marginTop: 8,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                  }}
                  onPress={() => setShowDatePicker(false)}>
                  <CustomText style={{ color: '#fff', fontFamily: Typography.fontFamily.semiBold }}>
                    Done
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>
          )}
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
            isPending && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={isPending}>
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <CustomText style={styles.submitButtonText}>Create Workout</CustomText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker handled inline/dialog */}
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
    dateText: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.regular,
    },
  });
