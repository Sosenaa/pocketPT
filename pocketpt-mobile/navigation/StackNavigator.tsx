import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
const Stack = createNativeStackNavigator();
import Login from "../screens/Login";
import Register from "../screens/Register";
import MyTabs from "../components/MyTabs";

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="MainTabs" component={MyTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
