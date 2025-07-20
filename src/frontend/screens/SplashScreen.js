import React, { useEffect } from 'react';
import { View, Text, Animated, Image, StyleSheet } from 'react-native';
import { globalStyles, colors } from '../styles/theme';

export default function SplashScreen({ onFinish }) {
//   const fadeAnim = new Animated.Value(0);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => onFinish(), 1500); // after fade in, wait 1.5s then go to login
    });
  }, []);

  return (
    <Animated.View style={[globalStyles.screen, styles.centered, { opacity: fadeAnim }]}>
      <Image
        source={require('../assets/breathe-icon.png')} 
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={[globalStyles.appTitle, {marginBottom: 30}]}>breathe</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
});
