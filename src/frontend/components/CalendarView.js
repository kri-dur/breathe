import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { format, addDays, parse } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { globalStyles, colors } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import * as Location from "expo-location";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const SPACING = 20;
const SNAP_INTERVAL = CARD_WIDTH + SPACING;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 100;

async function fetchWeather(lat, lon, units = "metric") {
  try {
    const res = await fetch(
      `https://breathe-9l3w.onrender.com/api/weatherToday?lat=${lat}&lon=${lon}&units=${units}`
    );
    if (!res.ok) throw new Error("Weather fetch failed");
    return await res.json();
  } catch (err) {
    console.error("Weather fetch error:", err);
    return null;
  }
}

function SymptomCard({ date, log, onUpdate, isToday, canLogSymptoms }) {
  const [symptoms, setSymptoms] = useState(log.symptoms || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [newSymptomText, setNewSymptomText] = useState("");
  const [loading, setLoading] = useState(false); // <-- Add this line

  const saveSymptoms = async (updated) => {
    await onUpdate(date, updated);
    setSymptoms(updated);
  };

  const deleteSymptom = async (index) => {
    const updated = symptoms.filter((_, i) => i !== index);
    await saveSymptoms(updated);
  };

  const updateSymptom = async (index, text) => {
    const updated = [...symptoms];
    updated[index] = text.trim();
    await saveSymptoms(updated);
    setEditingIndex(null);
  };

  const addSymptom = async () => {
    if (!newSymptomText.trim()) return;
    setLoading(true); // <-- Show loading indicator
    try {
      // Call onUpdate, which should fetch weather if needed
      await onUpdate(date, [...symptoms, newSymptomText.trim()]);
      setSymptoms([...symptoms, newSymptomText.trim()]);
      setNewSymptomText("");
    } finally {
      setLoading(false); // <-- Hide loading indicator
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.dateText}>
        {format(parse(date, "yyyy-MM-dd", new Date()), "MMMM d, yyyy")}
      </Text>
      <Text style={styles.sectionTitle}>Symptoms:</Text>
      {symptoms.length === 0 ? (
        <Text style={styles.none}>No symptoms logged</Text>
      ) : (
        symptoms.map((s, i) => (
          <View key={i} style={styles.symptomRow}>
            {editingIndex === i && isToday ? (
              <>
                <TextInput
                  value={editedText}
                  onChangeText={setEditedText}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => updateSymptom(i, editedText)}>
                  <Text style={styles.smallBtn}>✅</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingIndex(null)}>
                  <Text style={styles.smallBtn}>❌</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.bullet}>• {s}</Text>
                {isToday && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingIndex(i);
                        setEditedText(s);
                      }}
                    >
                      <Text style={styles.smallBtn}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSymptom(i)}>
                      <Text style={styles.smallBtn}>🗑</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        ))
      )}

      {canLogSymptoms && isToday && (
        <View style={styles.addRow}>
          <TextInput
            value={newSymptomText}
            onChangeText={setNewSymptomText}
            placeholder="Add symptom"
            style={styles.input}
          />
          <TouchableOpacity onPress={addSymptom}>
            <Text style={styles.smallBtn}>➕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading indicator when adding symptom */}
      {loading && (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <ActivityIndicator size="small" color={colors.sage} />
          <Text style={{ marginTop: 5, color: colors.sage }}>
            Adding Symptom...
          </Text>
        </View>
      )}

      {(isToday
        ? log.weather // for today, show weather if present
        : log.weather && log.symptoms && log.symptoms.length > 0) && ( // for past days, only if symptoms exist
        <>
          <Text style={styles.sectionTitle}>Weather:</Text>
          <Text style={styles.text}>Air Quality: {log.weather.category}</Text>
          <Text style={styles.text}>Humidity: {log.weather.humidity}%</Text>
          <Text style={styles.text}>
            Temp: {log.weather.temp}
            {log.weather.units === "imperial" ? "°F" : "°C"}
            {(log.weather.units === "imperial" &&
              (log.weather.temp > 90 || log.weather.temp < 41)) ||
            (log.weather.units !== "imperial" &&
              (log.weather.temp > 32 || log.weather.temp < 10))
              ? " (Extreme)"
              : ""}
          </Text>
          <Text style={styles.text}>Rain: {log.weather.rain}</Text>

          {/* Dynamic weather message */}
          {(() => {
            const extremeMessages = [];
            // AQI: 3-5 is extreme
            if (log.weather.AQI >= 3) {
              extremeMessages.push("low air quality");
            }
            // Humidity: >60% or <30% is extreme
            if (log.weather.humidity > 60) {
              extremeMessages.push("high humidity");
            }
            if (log.weather.humidity < 30) {
              extremeMessages.push("low humidity");
            }
            // Temp: >30°C or <10°C is extreme (or >86°F or <50°F)
            if (
              (log.weather.units === "imperial" && log.weather.temp > 86) ||
              (log.weather.units !== "imperial" && log.weather.temp > 30)
            ) {
              extremeMessages.push("high temperatures");
            }
            if (
              (log.weather.units === "imperial" && log.weather.temp < 50) ||
              (log.weather.units !== "imperial" && log.weather.temp < 10)
            ) {
              extremeMessages.push("low temperatures");
            }
            // Rain present
            if (log.weather.rain === "Yes") {
              extremeMessages.push("chances of rain");
            }

            if (extremeMessages.length === 0) {
              return (
                <Text style={styles.normalWeather}>
                  Weather conditions are normal today.
                  {"\n"}
                  Enjoy your day!
                </Text>
              );
            } else {
              return (
                <Text style={styles.extremeWeather}>
                  {`${extremeMessages
                    .map((msg) => {
                      if (msg === "low air quality") return "Low air quality";
                      if (msg === "high humidity") return "High humidity";
                      if (msg === "low humidity") return "Low humidity";
                      if (msg === "high temperatures")
                        return "High temperatures";
                      if (msg === "low temperatures") return "Low temperatures";
                      if (msg === "chances of rain") return "Chances of rain";
                      return msg;
                    })
                    .join(
                      ", "
                    )} may cause symptoms to flare up today.\nBe cautious!`}
                </Text>
              );
            }
          })()}
        </>
      )}
    </View>
  );
}

// main calendar view component
export default function CalendarView({ selectedDate }) {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState({});
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true); // <-- Add loading state
  const listRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true); // Start loading
    const generateDaysAndFetchLogs = async () => {
      const list = [];
      const newLogs = {};
      const centerDate = selectedDate ? new Date(selectedDate) : new Date();
      centerDate.setHours(0, 0, 0, 0);

      const allDates = [];
      for (let i = -5; i <= 5; i++) {
        const date = format(addDays(centerDate, i), "yyyy-MM-dd");
        allDates.push(date);
      }

      const todayStr = format(new Date(), "yyyy-MM-dd");
      const validDates = allDates.filter((date) => date <= todayStr);

      for (const date of validDates) {
        list.push({ date });

        const ref = doc(db, "users", user.uid, "logs", date);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          newLogs[date] = snap.data();
        }
      }

      setDays(list);
      setLogs(newLogs);
      setLoading(false); // End loading

      setTimeout(() => {
        const index = list.findIndex(
          (d) => d.date === (selectedDate || format(centerDate, "yyyy-MM-dd"))
        );
        if (index !== -1) {
          listRef.current?.scrollToIndex({ index, animated: false });
          setCurrentIndex(index);
        }
      }, 0);
    };

    generateDaysAndFetchLogs();
  }, [selectedDate, user]);

  const updateSymptoms = async (date, symptoms) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const ref = doc(db, "users", user.uid, "logs", date);
    const prev = logs[date] || { weather: null };

    // Only allow logging symptoms for today or for days that already have symptoms
    if (date !== todayStr && (!prev.symptoms || prev.symptoms.length === 0)) {
      return;
    }

    // Only fetch weather if symptoms are being logged for the first time AND it's today
    if (
      date === todayStr &&
      (!prev.symptoms || prev.symptoms.length === 0) &&
      symptoms.length > 0
    ) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission is required to fetch weather.");
        await setDoc(ref, { ...prev, symptoms });
        setLogs((prevLogs) => ({
          ...prevLogs,
          [date]: { ...prev, symptoms },
        }));
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      // Reverse geocode to get country code
      let units = "metric";
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });
        // Some platforms use 'isoCountryCode', some use 'country' (e.g. 'US')
        const countryCode = geo[0]?.isoCountryCode || geo[0]?.country;
        if (countryCode === "US" || countryCode === "United States") {
          units = "imperial";
        }
      } catch (err) {
        console.warn("Reverse geocode failed, defaulting to metric units.");
      }

      const weather = await fetchWeather(lat, lon, units);

      await setDoc(ref, {
        ...prev,
        symptoms,
        weather,
      });
      setLogs((prevLogs) => ({
        ...prevLogs,
        [date]: { ...prev, symptoms, weather },
      }));
    } else {
      await setDoc(ref, {
        ...prev,
        symptoms,
      });
      setLogs((prevLogs) => ({
        ...prevLogs,
        [date]: { ...prev, symptoms },
      }));
    }
  };

  const scrollToIndex = (newIndex) => {
    if (newIndex < 0 || newIndex >= days.length) return;

    const date = days[newIndex]?.date;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (date > todayStr) return;

    setCurrentIndex(newIndex);
    listRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

  const renderItem = ({ item }) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const log = logs[item.date] || { symptoms: [], weather: null };
    const isToday = item.date === todayStr;
    const canLogSymptoms = isToday || (log.symptoms && log.symptoms.length > 0);

    return (
      <View style={styles.page}>
        <SymptomCard
          date={item.date}
          log={log}
          onUpdate={updateSymptoms}
          isToday={isToday}
          canLogSymptoms={canLogSymptoms}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.beige,
        }}
      >
        <ActivityIndicator size="large" color={colors.sage} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrowLeft}
        onPress={() => scrollToIndex(currentIndex - 1)}
      >
        <Ionicons name="chevron-back" size={28} color={colors.black} />
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        snapToAlignment="start"
        pagingEnabled={false}
        contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
        getItemLayout={(data, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const offset = e.nativeEvent.contentOffset.x;
          const newIndex = Math.round(offset / SNAP_INTERVAL);
          setCurrentIndex(newIndex);
        }}
      />

      <TouchableOpacity
        style={styles.arrowRight}
        onPress={() => scrollToIndex(currentIndex + 1)}
      >
        <Ionicons name="chevron-forward" size={28} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beige,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  page: {
    width: CARD_WIDTH + SPACING,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 15,
    textAlign: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 15,
    color: colors.black,
  },
  bullet: {
    color: colors.black,
    flex: 1,
  },
  text: {
    color: colors.black,
    marginLeft: 10,
    marginTop: 4,
  },
  none: {
    color: "gray",
    fontStyle: "italic",
    marginLeft: 10,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.brown,
    borderRadius: 10,
    padding: 6,
    flex: 1,
    marginRight: 8,
    color: colors.black,
  },
  symptomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  smallBtn: {
    fontSize: 16,
    marginLeft: 4,
  },
  arrowLeft: {
    position: "absolute",
    top: "50%",
    left: -20,
    transform: [{ translateY: -14 }],
    zIndex: 10,
  },
  arrowRight: {
    position: "absolute",
    top: "50%",
    right: -20,
    transform: [{ translateY: -14 }],
    zIndex: 10,
  },
  normalWeather: {
    color: colors.sage,
    fontStyle: "italic",
    marginTop: 20, // Increased margin
    textAlign: "center",
    fontSize: 18, // Larger text
  },
  extremeWeather: {
    color: colors.brown,
    fontWeight: "bold",
    marginTop: 20, // Increased margin
    textAlign: "center",
    fontSize: 18, // Larger
  },
});
