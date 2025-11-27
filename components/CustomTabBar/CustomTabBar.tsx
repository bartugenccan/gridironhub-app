import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CustomText } from '@/components/CustomText';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { TabRoutes } from '@/types/navigation/routes';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const getIconName = (routeName: string, isFocused: boolean) => {
    // Use original route names instead of translated ones
    switch (routeName) {
      case TabRoutes.DASHBOARD:
        return isFocused ? 'grid' : 'grid-outline';
      case TabRoutes.ROSTER:
        return isFocused ? 'people' : 'people-outline';
      case TabRoutes.WORKOUTS:
        return isFocused ? 'barbell' : 'barbell-outline';
      case TabRoutes.PROFILE:
        return isFocused ? 'person' : 'person-outline';
      // Coach Routes
      case TabRoutes.COACH_DASHBOARD:
        return isFocused ? 'grid' : 'grid-outline';
      case TabRoutes.COACH_ROSTER:
        return isFocused ? 'people' : 'people-outline';
      case TabRoutes.COACH_STATS:
        return isFocused ? 'stats-chart' : 'stats-chart-outline';
      case TabRoutes.COACH_SCHEDULE:
        return isFocused ? 'calendar' : 'calendar-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.tabBarBackground }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = getIconName(route.name, isFocused);

        // Map coach routes to generic keys for translation reuse
        let translationKey = route.name.toLowerCase();
        if (route.name === TabRoutes.COACH_DASHBOARD) translationKey = 'dashboardtab';
        if (route.name === TabRoutes.COACH_ROSTER) translationKey = 'roster';
        // For new ones, we might need new keys or reuse similar ones
        if (route.name === TabRoutes.COACH_STATS) translationKey = 'stats';
        if (route.name === TabRoutes.COACH_SCHEDULE) translationKey = 'schedule';

        // Translate the tab name for display
        const translatedName = t(`tabs.${translationKey}`) || route.name;

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={[styles.tabButton, { borderTopColor: colors.border }]}
            activeOpacity={0.7}>
            <View style={styles.tabContent}>
              <Ionicons name={iconName as any} size={24} color={colors.text} />
              <CustomText style={[styles.tabLabel, { color: colors.text }]}>
                {translatedName?.toLocaleUpperCase()}
              </CustomText>
              {isFocused && (
                <View style={[styles.activeDot, { backgroundColor: colors.tabBarDot }]} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: verticalScale(76),
    paddingBottom: verticalScale(12),
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: scale(8),
    marginTop: verticalScale(4),
    fontWeight: 'semibold',
  },
  activeDot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    marginTop: verticalScale(4),
  },
});

export default CustomTabBar;
