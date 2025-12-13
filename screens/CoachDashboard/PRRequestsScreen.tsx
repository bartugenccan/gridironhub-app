import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { scale, verticalScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import { usePendingPrRequests, useUpdatePrRequestStatus } from '@/hooks/useStats';
import { VideoPlayerModal } from '@/components';

export const PRRequestsScreen = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const navigation = useNavigation();
    const { data: pendingRequests } = usePendingPrRequests();
    const { mutate: updateRequestStatus } = useUpdatePrRequestStatus();
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

    const handleApprove = (id: string) => {
        updateRequestStatus(
            { id, data: { status: 'approved' } },
            { onSuccess: () => Alert.alert('Approved', 'PR Request approved') }
        );
    };

    const handleReject = (id: string) => {
        updateRequestStatus(
            { id, data: { status: 'rejected' } },
            { onSuccess: () => Alert.alert('Rejected', 'PR Request rejected') }
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <VideoPlayerModal
                visible={!!selectedVideoUrl}
                videoUrl={selectedVideoUrl}
                onClose={() => setSelectedVideoUrl(null)}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PR Requests</Text>
                <View style={{ width: scale(24) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!pendingRequests || pendingRequests.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No pending requests</Text>
                    </View>
                ) : (
                    <View style={styles.cardContainer}>
                        {pendingRequests.map((request, index) => (
                            <View key={request.id}>
                                <View style={styles.prRequestRow}>
                                    <View style={styles.playerInfo}>
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                {(request.playerName || 'U').charAt(0)}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.playerName}>{request.playerName || 'Unknown Player'}</Text>
                                            <Text style={styles.playerDetail}>
                                                {request.liftName} - {request.value}
                                            </Text>
                                            {request.videoUrl && (
                                                <TouchableOpacity onPress={() => setSelectedVideoUrl(request.videoUrl)}>
                                                    <Text style={styles.videoLink}>Watch Video</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity onPress={() => handleReject(request.id)}>
                                            <Ionicons name="close-circle" size={scale(32)} color="#EF4444" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleApprove(request.id)}>
                                            <Ionicons name="checkmark-circle" size={scale(32)} color="#10B981" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {index < pendingRequests.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#F6F8FC',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(15),
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight || '#E5E7EB',
        },
        backButton: {
            padding: scale(4),
        },
        headerTitle: {
            fontSize: scale(18),
            fontWeight: 'bold',
            color: colors.text,
        },
        scrollContent: {
            padding: scale(16),
        },
        cardContainer: {
            backgroundColor: '#fff',
            borderRadius: scale(16),
            padding: scale(16),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        prRequestRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: verticalScale(8),
        },
        playerInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(12),
            flex: 1,
        },
        avatarPlaceholder: {
            width: scale(40),
            height: scale(40),
            borderRadius: scale(20),
            backgroundColor: '#1F2937',
            justifyContent: 'center',
            alignItems: 'center',
        },
        playerName: {
            fontSize: scale(16),
            fontWeight: '600',
            color: '#111827',
        },
        playerDetail: {
            fontSize: scale(13),
            color: '#6B7280',
        },
        videoLink: {
            color: '#4F46E5',
            fontSize: scale(12),
            marginTop: 2,
        },
        actions: {
            flexDirection: 'row',
            gap: scale(12),
        },
        divider: {
            height: 1,
            backgroundColor: '#F3F4F6',
            marginVertical: verticalScale(12),
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: verticalScale(50),
        },
        emptyText: {
            fontSize: scale(16),
            color: '#6B7280',
        },
    });
