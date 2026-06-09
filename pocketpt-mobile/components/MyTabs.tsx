import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, NavigationContainer } from "@react-navigation/native";
import { Button, HeaderShownContext } from "@react-navigation/elements";
import {
  BottomTabBar,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import TrainingPlan from "../screens/TrainingPlan";
import Login from "../screens/Login";
import Register from "../screens/Register";
import UserForm from "../screens/UserForm";
import Dashboard from "../screens/Dashboard";
import DietPlan from "../screens/DietPlan";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "black",

          height: 50,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          flex: 1,

          bottom: 20,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          color: PRIMARY,
          margin: 0,
          padding: 0,
        },
      }}
    >
      <Tab.Screen name="TrainingPlan" component={TrainingPlan} />
      <Tab.Screen name="DietPlan" component={DietPlan} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="UserForm" component={UserForm} />
    </Tab.Navigator>
  );
}

const PRIMARY = "#C8FF00";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const SURFACE2 = "#1A1A1A";
const BORDER = "#222";
const TEXT = "#FFFFFF";
const MUTED = "#666";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
