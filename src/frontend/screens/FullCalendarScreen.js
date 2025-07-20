import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { globalStyles, colors } from "../styles/theme";
import { format } from "date-fns";

export default function FullCalendarScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(route.params?.selectedDate || null);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchLogDates = async () => {
      const logsRef = collection(db, "users", user.uid, "logs");
      const snapshot = await getDocs(logsRef);
      const marks = {};
      const todayStr = format(new Date(), "yyyy-MM-dd");

      snapshot.forEach((doc) => {
        const date = doc.id;
        const data = doc.data();
        if (date <= todayStr) {
          // only show dot if symptoms exist and length > 0
          const hasSymptoms = Array.isArray(data.symptoms) && data.symptoms.length > 0;
          marks[date] = {
            ...(hasSymptoms && {
              marked: true,
              dotColor: colors.brown,
            }),
            ...(date === selectedDate && {
              selected: true,
              selectedColor: colors.sage,
              selectedTextColor: colors.white,
            }),
          };
        }
      });

      // Grey out future days
      const next30 = Array.from({ length: 30 }, (_, i) => {
        const date = format(new Date(Date.now() + (i + 1) * 86400000), "yyyy-MM-dd");
        return date;
      });

      next30.forEach((date) => {
        marks[date] = {
          disabled: true,
          disableTouchEvent: true,
        };
      });

      setMarkedDates(marks);
    };

    fetchLogDates();
  }, [user, selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(route.params?.selectedDate || null);
    }, [route.params?.selectedDate])
  );

  const handleDayPress = (day) => {
    const dateStr = day.dateString;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (dateStr > todayStr) return;

    setSelectedDate(dateStr);
    setTimeout(() => {
      navigation.navigate("MainTabs", {
        screen: "Track",
        params: { selectedDate: dateStr },
      });
    }, 100); // 100ms delay to allow highlight to show
  };

  return (
    <View style={globalStyles.calendarScreen}>
      <Text style={styles.title}>Pick a date</Text>
      <Calendar
        current={selectedDate || format(new Date(), "yyyy-MM-dd")}
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: colors.sage,
              selectedTextColor: colors.white,
            },
          }),
        }}
        theme={{
          todayTextColor: colors.sage,
          arrowColor: colors.brown,
          textDayFontFamily: "Lexend_400Regular",
          textMonthFontFamily: "Lexend_700Bold",
        }}
        disableAllTouchEventsForDisabledDays
        maxDate={format(new Date(), "yyyy-MM-dd")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 15,
    textAlign: "center",
  },
});
