import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CustomText, VideoPreview } from '@/components';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { DashboardStackParamList } from '@/types/navigation/stacks';
import { AppRoutes } from '@/types/navigation/routes';
import { useCreatePrRequest } from '@/hooks/useStats';
import { useVideoPicker } from '@/hooks/useVideoPicker';
import { personalRecordSchema } from '@/validations/stats.schema';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';

const LIFT_OPTIONS = [
  'Bench Press',
  'Squat',
  'Clean',
  'Deadlift',
  'Overhead Press',
  '40 Yard Dash',
];

type AddPRScreenRouteProp = RouteProp<DashboardStackParamList, typeof AppRoutes.ADD_PR>;

export const AddPRScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const route = useRoute<AddPRScreenRouteProp>();
  const { isEdit, record } = route.params || {};
  const { user } = useAuth();

  const { user } = useAuth();

  const [liftName, setLiftName] = useState(record?.liftName || '');
  const [oneRepMax, setOneRepMax] = useState(record?.oneRepMax?.toString() || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: createRequest, isPending: isLoading } = useCreatePrRequest();
  const { video, isLoading: isVideoLoading, pickVideo, clearVideo } = useVideoPicker();

  const handleSave = async () => {
    if (!liftName) {
      Alert.alert('Error', 'Please select a lift');
      return;
    }
    if (!oneRepMax) {
      Alert.alert('Error', 'Please enter your One Rep Max');
      return;
    }
    if (!video) {
      Alert.alert('Error', 'Video proof is required for PR requests');
      return;
    }

    // Validate video URL
    if (video) {
      const validation = personalRecordSchema.safeParse({ videoUrl: video.uri });
      if (!validation.success) {
        Alert.alert('Validation Error', validation.error.issues[0].message);
        return;
      }
    }

    try {
      if (!video) throw new Error('No video selected');

      setIsSubmitting(true);
      // 1. Upload Video to Supabase Storage
      const fileExt = video.uri.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const videoAsset = {
        uri: video.uri,
        name: fileName,
        type: video.type || `video/${fileExt}`,
      } as any;

      const formData = new FormData();
      formData.append('file', videoAsset);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pr-videos')
        .upload(fileName, formData, {
          contentType: video.type || `video/${fileExt}`,
        });

      if (uploadError) {
        throw new Error('Video upload failed: ' + uploadError.message);
      }

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('pr-videos').getPublicUrl(fileName);

      // 3. Send to Backend
      const requestData: any = {
        liftName,
        value: Number(oneRepMax),
        videoUrl: publicUrl,
        notes,
      };

      if (isEdit && record?.id) {
        requestData.strengthLogId = record.id;
      }

      createRequest(requestData, {
        onSuccess: () => {
          Alert.alert('Success', 'PR Request sent to coach for approval', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (error: any) => {
          setIsSubmitting(false);
          Alert.alert('Error', error.message || 'Failed to submit PR Request');
        },
      });
    } catch (error: any) {
      setIsSubmitting(false);
      console.error('Error submitting PR:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>{isEdit ? 'Update PR' : 'Add New PR'}</CustomText>
        <View style={{ width: scale(24) }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <CustomText style={styles.label}>Lift Name</CustomText>
          <View style={styles.optionsContainer}>
            {LIFT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, liftName === option && styles.optionButtonSelected]}
                onPress={() => setLiftName(option)}>
                <CustomText
                  style={[styles.optionText, liftName === option && styles.optionTextSelected]}>
                  {option}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <CustomText style={styles.label}>One Rep Max</CustomText>
          <TextInput
            style={styles.input}
            value={oneRepMax}
            onChangeText={(text) => setOneRepMax(text.replace(/[^0-9]/g, ''))}
            placeholder="Enter weight/time"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <CustomText style={styles.label}>Notes (Optional)</CustomText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Video Upload */}
        <View style={styles.formGroup}>
          <CustomText style={styles.label}>Workout Video (Required)</CustomText>
          {video ? (
            <VideoPreview video={video} onRemove={clearVideo} />
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { borderColor: colors.borderLight, backgroundColor: colors.cardBackground },
              ]}
              onPress={pickVideo}
              disabled={isVideoLoading}>
              {isVideoLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={scale(48)} color={colors.primary} />
                  <CustomText style={[styles.uploadText, { color: colors.text }]}>
                    Upload Video Proof
                  </CustomText>
                  <CustomText style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
                    Max 50MB, up to 30 seconds.
                  </CustomText>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (isLoading || isSubmitting) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading || isSubmitting}>
          {isLoading || isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <CustomText style={styles.saveButtonText}>Submit for Approval</CustomText>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(50),
      paddingBottom: verticalScale(15),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    backButton: {
      padding: scale(5),
    },
    headerTitle: {
      fontSize: scale(18),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: scale(20),
    },
    formGroup: {
      marginBottom: verticalScale(20),
    },
    label: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
      marginBottom: verticalScale(10),
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
    },
    optionButton: {
      paddingHorizontal: scale(15),
      paddingVertical: verticalScale(8),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.cardBackground,
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: scale(12),
      fontFamily: Typography.fontFamily.regular,
      color: colors.text,
    },
    optionTextSelected: {
      color: '#fff',
    },
    input: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: scale(8),
      padding: scale(12),
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
      color: colors.text,
    },
    textArea: {
      height: verticalScale(100),
      textAlignVertical: 'top',
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: scale(8),
      padding: scale(12),
    },
    dateText: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
      color: colors.text,
    },
    footer: {
      padding: scale(20),
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: verticalScale(15),
      borderRadius: scale(8),
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.bold,
      color: '#fff',
    },
    uploadButton: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: scale(12),
      padding: scale(32),
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: verticalScale(160),
    },
    uploadText: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.semiBold,
      marginTop: verticalScale(12),
    },
    uploadSubtext: {
      fontSize: scale(13),
      fontFamily: Typography.fontFamily.regular,
      marginTop: verticalScale(4),
    },
  });
