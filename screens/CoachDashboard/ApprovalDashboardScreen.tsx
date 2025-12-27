import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale } from 'react-native-size-matters';
import { coachService } from '@/api/services/coach.service';
import { DarkColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface PendingUser {
    userId: string;
    fullName: string;
    email: string;
    role: 'player' | 'coach';
    createdAt: string;
}

export const ApprovalDashboardScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { user } = useAuth(); // Get current user (coach)

    const fetchPendingUsers = async () => {
        if (!user?.teamId) {
            Alert.alert('Error', 'Coach team ID not found');
            setLoading(false);
            return;
        }

        try {
            // setLoading(true); // Don't block UI on refresh
            const data = await coachService.getPendingUsers(user.teamId);
            setPendingUsers(data);
        } catch (error) {
            console.error('Error fetching pending users:', error);
            Alert.alert('Error', 'Failed to fetch pending requests');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string, action: 'approve' | 'reject') => {
        try {
            await coachService.approveUser(userId, action);
            Alert.alert('Success', 'User ' + action + 'ed successfully');
            // Remove from list
            setPendingUsers((prev) => prev.filter((u) => u.userId !== userId));
        } catch (error) {
            console.error('Error approving user:', error);
            Alert.alert('Error', 'Failed to ' + action + ' user');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPendingUsers();
    };

    const renderItem = ({ item }: { item: PendingUser }) => (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
                </View>
                <View>
                    <Text style={styles.userName}>{item.fullName}</Text>
                    <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(item.userId, 'approve')}
                >
                    <Ionicons name="checkmark-circle-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleApprove(item.userId, 'reject')}
                >
                    <Ionicons name="close-circle-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending Approvals</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={pendingUsers}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.userId ? item.userId.toString() : `pending-user-${index}`}
                    contentContainerStyle={styles.listContent}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                            <Text style={styles.emptyText}>No pending approvals</Text>
                        </View>
                    }
                />
            )}
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
            padding: scale(16),
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            padding: 4,
        },
        headerTitle: {
            fontSize: scale(18),
            fontWeight: 'bold',
            color: colors.text,
        },
        listContent: {
            padding: scale(16),
        },
        card: {
            backgroundColor: colors.cardBackground,
            borderRadius: scale(12),
            padding: scale(16),
            marginBottom: verticalScale(12),
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        userInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(12),
            flex: 1,
        },
        avatarPlaceholder: {
            width: scale(40),
            height: scale(40),
            borderRadius: scale(20),
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarText: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: scale(18),
        },
        userName: {
            fontSize: scale(16),
            fontWeight: '600',
            color: colors.text,
        },
        userEmail: {
            fontSize: scale(12),
            color: colors.textSecondary,
        },
        roleBadge: {
            backgroundColor: colors.backgroundLight,
            paddingHorizontal: scale(6),
            borderRadius: scale(4),
            alignSelf: 'flex-start',
        },
        roleText: {
            fontSize: scale(10),
            fontWeight: 'bold',
            color: colors.text,
        },
        buttonContainer: {
            flexDirection: 'row',
            gap: scale(8),
        },
        approveButton: {
            backgroundColor: DarkColors.success, // Use a success color
            paddingHorizontal: scale(12),
            paddingVertical: verticalScale(8),
            borderRadius: scale(8),
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        rejectButton: {
            backgroundColor: DarkColors.error, // Use a success color
            paddingHorizontal: scale(12),
            paddingVertical: verticalScale(8),
            borderRadius: scale(8),
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        rejectButtonText: {
            color: 'white',
            fontWeight: '600',
            fontSize: scale(12),
        },
        approveButtonText: {
            color: 'white',
            fontWeight: '600',
            fontSize: scale(12),
        },
        emptyContainer: {
            alignItems: 'center',
            marginTop: verticalScale(40),
            gap: verticalScale(16),
        },
        emptyText: {
            color: colors.textSecondary,
            fontSize: scale(16),
        },
    });
