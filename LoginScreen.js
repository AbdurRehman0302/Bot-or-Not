import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
  };

  const handleSignup = async () => {
    try {
      const userCredentials = {
        storedEmail: email,
        storedPassword: password,
      };
      await AsyncStorage.setItem(email, JSON.stringify(userCredentials));
      console.log('Sign Up successful');
      Alert.alert('Sign Up', 'Your account has been created successfully.');
      setIsSignup(false);
    } catch (error) {
      console.error('Sign Up error:', error.message);
      Alert.alert('Sign Up Error', 'An error occurred during sign up');
    }
  };

  const handleLogin = async () => {
    try {
      const storedCredentials = await AsyncStorage.getItem(email);
      if (storedCredentials) {
        const { storedEmail, storedPassword } = JSON.parse(storedCredentials);
        if (storedEmail === email && storedPassword === password) {
          console.log('Login successful');
          navigation.navigate('StartChat');
        } else {
          Alert.alert('Login Error', 'Invalid credentials');
        }
      } else {
        Alert.alert('Login Error', 'No account found with this email');
      }
    } catch (error) {
      console.error('Login error:', error.message);
      Alert.alert('Login Error', 'An error occurred during login');
    }
  };

  const handleSubmit = () => {
    if (isSignup) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const isFormFilled = email !== '' && password !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? 'Sign Up' : 'Login'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.buttonContainer} onPress={handleSubmit} disabled={!isFormFilled}>
        <LinearGradient
          colors={['#ba55d3', '#7b68ee']}
          style={[styles.gradient, !isFormFilled && styles.disabledButton]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>{isSignup ? 'Sign Up' : 'Login'}</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonContainer} onPress={handleToggleMode}>
        <LinearGradient
          colors={['#ba55d3', '#7b68ee']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>
            {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    color: '#ba55d3',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 5,
  },
  gradient: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default LoginScreen;
