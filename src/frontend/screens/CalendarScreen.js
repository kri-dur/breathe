import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import CalendarView from '../components/CalendarView';
import { globalStyles, colors } from '../styles/theme';

export default function CalendarScreen() {
  const navigation = useNavigation(); // ✅ add this line
  const route = useRoute();
  const selectedDate = route.params?.selectedDate;

  return (
    <View style={globalStyles.calendarScreen}>
      <TouchableOpacity
        onPress={() => navigation.navigate('FullCalendar', { selectedDate })}
        style={{ alignSelf: 'flex-end', marginBottom: 10 }}
      >
        <Ionicons name="calendar-outline" size={24} color={colors.black} />
      </TouchableOpacity>
      <CalendarView selectedDate={selectedDate} />
    </View>
  );
}
