import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { CustomText } from '@/components/CustomText';
import { Typography } from '@/constants/Typography';
import { scale, verticalScale } from 'react-native-size-matters';

interface LogoutButtonProps {
  variant?: 'text' | 'icon' | 'full';
  color?: string;
  size?: 'small' | 'medium' | 'large';
  onLogoutComplete?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'full',
  color = '#FF3B30',
  size = 'medium',
  onLogoutComplete,
}) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onLogoutComplete?.();
            } catch (error) {
              Alert.alert('Error', 'Logout failed. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;
  const fontSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoading}
        style={[styles.iconButton, { opacity: isLoading ? 0.5 : 1 }]}>
        <MaterialCommunityIcons name="logout" size={iconSize} color={color} />
      </TouchableOpacity>
    );
  }

  if (variant === 'text') {
    return (
      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoading}
        style={[styles.textButton, { opacity: isLoading ? 0.5 : 1 }]}>
        <CustomText style={[styles.textButtonText, { color, fontSize }]}>
          {isLoading ? 'Logging out...' : 'Logout'}
        </CustomText>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleLogout}
      disabled={isLoading}
      style={[
        styles.fullButton,
        { backgroundColor: color, opacity: isLoading ? 0.5 : 1 },
        size === 'small' && styles.fullButtonSmall,
        size === 'large' && styles.fullButtonLarge,
      ]}>
      <MaterialCommunityIcons name="logout" size={iconSize} color="#FFFFFF" />
      <CustomText style={[styles.fullButtonText, { fontSize }]}>
        {isLoading ? 'Logging out...' : 'Logout'}
      </CustomText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton: {
    padding: scale(8),
  },
  textButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
  },
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(24),
    borderRadius: 12,
    gap: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullButtonSmall: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
  },
  fullButtonLarge: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(32),
  },
  fullButtonText: {
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily.bold,
  },
});
