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

  const date = new Date();
  const todayIndex = date.getDay();

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

  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  {
    /* + 1 only for debugging purposes */
  }
  const todayDay = weekday[todayIndex + 1];

  const todayWorkout: Workout | undefined = plan?.workouts.find(
    (w) => w.day_name === todayDay,
  );

  return (
    <ScrollView contentContainerStyle={styles.containerScroll}>
      <View style={styles.container}>
        <Text style={styles.text}>{todayDay}</Text>
        <Text style={styles.text}>{todayWorkout?.focus}</Text>
        <View style={styles.workoutCard}>
          <Text style={styles.text}>{todayWorkout?.exercise_duration}</Text>
          <Text style={styles.text}>
            {todayWorkout?.exercises.map((exercise, index) => (
              <View key={index}>
                <Text style={styles.text}>{exercise.name}</Text>
                <Text style={styles.text}>{exercise.reps}</Text>
                <Text style={styles.text}>{exercise.sets}</Text>
              </View>
            ))}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const PRIMARY = "#C8FF00";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const BORDER = "#222";
const TEXT = "#FFFFFF";
const MUTED = "#666";

const styles = StyleSheet.create({
  containerScroll: {
    flexGrow: 1,
    backgroundColor: BG,
  },
  container: {
    backgroundColor: BG,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  workoutCard: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
  },

  text: {
    color: "white",
  },
});
