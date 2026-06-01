import { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

import Navbar from "../components/Navbar";

type Exercise = {
  exercise_id: number;
  name: string;
  sets: string;
  reps: string;
};

type Workout = {
  id: number;
  day_name: string;
  focus: string;
  exercise_duration: string;
  exercises: Exercise[];
};

type TrainingPlanData = {
  plan_name: string;
  workouts: Workout[];
};

export default function Dashboard({ navigation }: any) {
  const [plan, setPlan] = useState<TrainingPlanData | null>(null);
  const API_BASE_URL = "http://192.168.0.46:5000";
  useEffect(() => {
    /* Fetching training plan from database*/
    fetch(`${API_BASE_URL}/api/getTrainingPlan`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          navigation.navigate("Login");
          return;
        }
        if (res.status === 404) {
          navigation.navigate("UserForm");
          alert("Complete the form to create training plan");
        }
        return res.json();
      })
      .then((data) => {
        setPlan(data);
      })
      .catch(console.error);
  }, [navigation.navigate]);

  return (
    <ScrollView>
      <Text>This is a dashboard</Text>
      <Navbar navigation={navigation} />
    </ScrollView>
  );
}

const PRIMARY = "#C8FF00";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const BORDER = "#222";
const TEXT = "#FFFFFF";
const MUTED = "#666";
