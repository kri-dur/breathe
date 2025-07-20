import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import CalendarScreen from "./screens/CalendarScreen";
import AuthScreen from "./screens/AuthScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import AccountScreen from "./screens/AccountScreen";
import SplashScreen from "./screens/SplashScreen";
import FullCalendarScreen from "./screens/FullCalendarScreen";
import { colors } from "./styles/theme"; // Make sure colors is imported

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Track"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Track") iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "Account") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.sage, 
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Track" component={CalendarScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setCheckingAuth(false);
      if (user) {
        setShowWelcome(true);
      }
    });
    return unsub;
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (showWelcome) {
    return (
      <WelcomeScreen
        displayName={user.displayName || "User"}
        onFinish={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="FullCalendar" component={FullCalendarScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
