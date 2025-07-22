import { StyleSheet } from "react-native";

export const colors = {
  sage: "#B2AC88",
  brown: "#8C6A4D",
  beige: "#f5ebda",
  lightGreen: "#eefae1",
  white: "#FFFFFF",
  black: "#000000",
  lightGray: "#EAEAEA",
  red: "#94262c"
};

export const globalStyles = StyleSheet.create({
  appTitle: {
    fontSize: 50,
    color: colors.black,
    fontFamily: "PassionsConflict_400Regular",
    fontWeight: 400,
  },
  text: {
    marginTop: 10,
    color: colors.brown,
    fontFamily: "LexendExa_400Regular",
  },
  screen: {
    flex: 1,
    padding: 20,
    paddingTop: 60, // buffer at top
    backgroundColor: colors.lightGreen,
  },
  calendarScreen: {
    flex: 1,
    padding: 20,
    paddingTop: 60, // buffer at top
    backgroundColor: colors.beige,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 20,
    fontFamily: "LexendExa_700Bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.brown,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    color: colors.black,
    fontFamily: "LexendExa_400Regular",
  },
  button: {
    backgroundColor: colors.sage,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontFamily: "LexendExa_400Regular",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: colors.black,
    fontFamily: "LexendExa_700Bold",
  },
});
