import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StackNavigator />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
