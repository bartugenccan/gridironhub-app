import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
  TextInput,
  Image,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, DarkColors } from '@/constants/Colors';
import { registerSchema } from '@/validations/auth.schema';
import { getFieldErrors } from '@/utils/validation';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppRoutes, AuthStackParamList } from '@/types/navigation';
import { UserRole } from '@/api/types/auth';
import { teamService, Team } from '@/api/services/team.service';

type NavigationProp = StackNavigationProp<AuthStackParamList, AppRoutes.SIGN_UP>;

export const SignUp = () => {
  const navigation = useNavigation<NavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamId, setTeamId] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const { register, isLoading } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const data = await teamService.getTeams();
      setTeams(data);
      // Optional: Pre-select if only one team
      if (data.length === 1) {
        setTeamId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      Alert.alert('Error', 'Failed to load teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleRegister = async () => {
    // Reset errors
    setErrors({});

    // Validate with Zod
    const result = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      teamId,
      role,
    });

    if (!result.success) {
      const fieldErrors = getFieldErrors(result.error);
      setErrors(fieldErrors);

      const firstError = result.error.issues[0]?.message;
      if (firstError) {
        Alert.alert('Validation Error', firstError);
      }
      return;
    }

    try {
      await register(result.data);
      // Navigation to PendingApprovalScreen on success
      navigation.navigate(AppRoutes.PENDING_APPROVAL);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors = getFieldErrors(error);
        setErrors(fieldErrors);
        Alert.alert('Validation Error', error.issues[0]?.message || 'Invalid data');
        return;
      }

      const errorMessage =
        error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Error', errorMessage);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/login.png')}
      style={styles.backgroundImage}
      resizeMode="cover">
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        <SafeAreaView style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Gridiron Hub</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.roleContainer}>
              <Text style={styles.inputLabel}>I am a...</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'player' && styles.roleButtonActive]}
                  onPress={() => setRole('player')}
                >
                  <Ionicons name="person" size={20} color={role === 'player' ? 'white' : 'rgba(255,255,255,0.6)'} />
                  <Text style={[styles.roleButtonText, role === 'player' && styles.roleButtonTextActive]}>Player</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'coach' && styles.roleButtonActive]}
                  onPress={() => setRole('coach')}
                >
                  <Ionicons name="american-football" size={20} color={role === 'coach' ? 'white' : 'rgba(255,255,255,0.6)'} />
                  <Text style={[styles.roleButtonText, role === 'coach' && styles.roleButtonTextActive]}>Coach</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={[styles.input, errors.firstName && styles.inputError]}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={lastName}
                  onChangeText={setLastName}
                  style={[styles.input, errors.lastName && styles.inputError]}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Select Team</Text>
              {loadingTeams ? (
                <ActivityIndicator color={DarkColors.primary} />
              ) : (
                <View style={styles.teamContainer}>
                  {teams.map((team) => (
                    <TouchableOpacity
                      key={team.id}
                      style={[
                        styles.teamCard,
                        teamId === team.id && styles.teamCardActive,
                        errors.teamId && styles.inputError
                      ]}
                      onPress={() => setTeamId(team.id)}
                    >
                      {/* Fallback to asset if ID matches, else try URI or placeholder */}
                      <Image
                        source={
                          // Check for ID or Name to assign the local asset
                          (team.id === 'eb118c2c-77bf-419f-9c81-42f6dc6b6e81' || team.name === 'Sakarya Tatankaları')
                            ? require('@/assets/images/sakarya-logo.png')
                            : (team.logoUrl ? { uri: team.logoUrl } : require('@/assets/images/icon.png'))
                        }
                        style={styles.teamLogo}
                        resizeMode="contain"
                      />
                      <Text style={[styles.teamName, teamId === team.id && styles.teamNameActive]}>
                        {team.name}
                      </Text>
                      {teamId === team.id && (
                        <Ionicons name="checkmark-circle" size={24} color={DarkColors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                  {teams.length === 0 && (
                    <Text style={{ color: 'white', textAlign: 'center' }}>No teams found</Text>
                  )}
                </View>
              )}
              {errors.teamId && <Text style={styles.fieldErrorText}>{errors.teamId}</Text>}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, errors.email && styles.inputError]}
              />
              {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder="Create a password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={[styles.input, errors.password && styles.inputError]}
              />
              {errors.password && <Text style={styles.fieldErrorText}>{errors.password}</Text>}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                isLoading && styles.buttonDisabled,
                { backgroundColor: DarkColors.primary },
              ]}
              onPress={handleRegister}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Request Account</Text>
              )}
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  header: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    width: '100%',
    padding: 20,
    rowGap: 15,
  },
  roleContainer: {
    width: '100%',
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: DarkColors.primary,
    borderColor: DarkColors.primary,
  },
  roleButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    fontSize: 16,
  },
  roleButtonTextActive: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
  },
  inputLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 16,
    color: 'white',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  fieldErrorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    width: '100%',
    padding: 20,
    marginTop: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: DarkColors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  loginLinkText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loginLink: {
    color: DarkColors.primary,
    fontWeight: 'bold',
  },
  teamContainer: {
    gap: 10,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 12,
  },
  teamCardActive: {
    borderColor: DarkColors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  teamLogo: {
    width: 40,
    height: 40,
  },
  teamName: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  teamNameActive: {
    color: 'white',
  },
});
