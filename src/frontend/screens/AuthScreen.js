import React, { useState } from 'react';
import { View, TextInput, Text, Alert, Pressable } from 'react-native';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { globalStyles, colors } from '../styles/theme';

export default function AuthScreen({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        // Set displayName in Firebase Auth profile
        await updateProfile(userCred.user, { displayName: name });
        await setDoc(doc(db, "users", userCred.user.uid), {
          name,
          email
        });
        if (onRegister) onRegister(name);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    //   onLogin();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset",
        "A password reset email will be sent shortly. Please check your inbox (it might go to spam)."
      );
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={[globalStyles.screen, { backgroundColor: colors.beige, flex: 1, justifyContent: 'center'}]}>
      <Text style={[globalStyles.title, {textAlign: 'center'}]}>
        {isRegistering ? 'Create Account' : 'Welcome Back!'}
      </Text>
      {isRegistering && (
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={globalStyles.textInput}
          placeholderTextColor="#888"
        />
      )}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={globalStyles.textInput}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={globalStyles.textInput}
        placeholderTextColor="#888"
      />
      <Pressable style={globalStyles.button} onPress={handleAuth}>
        <Text style={globalStyles.buttonText}>
          {isRegistering ? "Sign Up" : "Login"}
        </Text>
      </Pressable>
      {!isRegistering && (
        <Text
          style={[globalStyles.text, { color: colors.red, marginTop: 10, textAlign: "center" }]}
          onPress={handleForgotPassword}
        >
          Forgot Password?
        </Text>
      )}
      <Text
        style={[globalStyles.text, { marginTop: 10, textAlign: "center" }]}
        onPress={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </Text>
    </View>
  );
}
