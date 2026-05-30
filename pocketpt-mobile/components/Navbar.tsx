import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Navbar({ navigation }: any) {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={styles.link}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("TrainingPlan")}>
        <Text style={styles.link}>Training</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("DietPlan")}>
        <Text style={styles.link}>Diet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#C8FF00",
    paddingVertical: 15,
  },
  link: {
    color: "black",
    fontSize: 16,
    fontWeight: "700",
  },
});
