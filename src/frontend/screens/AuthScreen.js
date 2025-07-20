import React, { useState } from 'react';
import { View, TextInput, Text, Alert, Pressable } from 'react-native';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { globalStyles, colors } from '../styles/theme';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          name,
          email
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    //   onLogin();
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
      <Text
        style={globalStyles.text}
        onPress={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </Text>
    </View>
  );
}
