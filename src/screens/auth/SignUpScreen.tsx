import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { signUpUser } from '../../store/slices/authSlice';
import { useTheme } from '../../theme/ThemeContext';
import { AppDispatch, RootState } from '../../store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();

  const handleSignUp = async () => {
    if (email && password) {
      const result = await dispatch(signUpUser({ email, password, displayName }));
      if (signUpUser.fulfilled.match(result)) {
        navigation.navigate('Login');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>

          {error ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text> : null}

          <Input placeholder="Display Name" value={displayName} onChangeText={setDisplayName} />
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

          <Button title="Sign Up" onPress={handleSignUp} loading={isLoading} />
          <Button title="Back to Login" onPress={() => navigation.navigate('Login')} variant="outline" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default SignUpScreen;