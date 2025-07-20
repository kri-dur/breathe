import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { auth } from "../firebase";
import { updateProfile, updatePassword, signOut } from "firebase/auth";
import { globalStyles, colors } from "../styles/theme";

export default function AccountScreen() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateName = async () => {
    try {
      await updateProfile(user, { displayName });
      Alert.alert("Success", "Name updated successfully.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters.");
      return;
    }
    try {
      await updatePassword(user, newPassword);
      setNewPassword("");
      Alert.alert("Success", "Password updated successfully.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: colors.beige }}>
        <Text style={[globalStyles.title, { textAlign: "center" }]}>Account</Text>

        <Text style={[globalStyles.sectionHeader, { textAlign: "center" }]}>
          Change Display Name
        </Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={globalStyles.textInput}
        />
        <Pressable style={globalStyles.button} onPress={handleUpdateName}>
          <Text style={globalStyles.buttonText}>Update Name</Text>
        </Pressable>
        {/* <Button title="Update Name" onPress={handleUpdateName} /> */}

        <Text style={[globalStyles.sectionHeader, { textAlign: "center", marginTop: 30 }]}>
          Change Password
        </Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="New password"
          style={globalStyles.textInput}
        />
        <Pressable style={globalStyles.button} onPress={handleUpdatePassword}>
          <Text style={globalStyles.buttonText}>Update Password</Text>
        </Pressable>
        {/* <Button style={globalStyles.buttonText} title="Update Password" onPress={handleUpdatePassword} /> */}

        <View style={{ marginTop: 40 }}>
          <Button title="Log Out" color="#d90429" onPress={handleLogout} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: colors.beige },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { marginTop: 10, marginBottom: 5, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
});
