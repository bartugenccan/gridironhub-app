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
import { CustomText } from '@/components';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { useNavigation } from '@react-navigation/native';
import { useAddPersonalRecord } from '@/hooks/useStats';

const LIFT_OPTIONS = [
    'Bench Press',
    'Squat',
    'Clean',
    'Deadlift',
    'Overhead Press',
    '40 Yard Dash',
];

export const AddPRScreen = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const navigation = useNavigation();

    const [liftName, setLiftName] = useState('');
    const [oneRepMax, setOneRepMax] = useState('');
    const [notes, setNotes] = useState('');
    const { mutate: addRecord, isPending: isLoading } = useAddPersonalRecord();

    const handleSave = () => {
        if (!liftName) {
            Alert.alert('Error', 'Please select a lift');
            return;
        }
        if (!oneRepMax) {
            Alert.alert('Error', 'Please enter your One Rep Max');
            return;
        }

        addRecord(
            {
                liftName,
                oneRepMax: Number(oneRepMax),
                notes,
            },
            {
                onSuccess: () => {
                    Alert.alert('Success', 'Personal Record added successfully', [
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
                },
                onError: (error: any) => {
                    Alert.alert('Error', error.message || 'Failed to add Personal Record');
                },
            }
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>Add New PR</CustomText>
                <View style={{ width: scale(24) }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                    <CustomText style={styles.label}>Lift Name</CustomText>
                    <View style={styles.optionsContainer}>
                        {LIFT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.optionButton,
                                    liftName === option && styles.optionButtonSelected,
                                ]}
                                onPress={() => setLiftName(option)}
                            >
                                <CustomText
                                    style={[
                                        styles.optionText,
                                        liftName === option && styles.optionTextSelected,
                                    ]}
                                >
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
                        onChangeText={setOneRepMax}
                        placeholder="Enter weight/time"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
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
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <CustomText style={styles.saveButtonText}>Save PR</CustomText>
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
    });
