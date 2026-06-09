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
      <Text style={{ color: TEXT }}>Today's Plan</Text>
      <View style={styles.container}>
        <View style={styles.workoutContainer}>
          <View style={styles.workoutHeading}>
            <View style={styles.headingLeft}>
              <Text style={styles.headingTextTitle}>{todayDay}</Text>
              <Text style={styles.headingTextFocus}>{todayWorkout?.focus}</Text>
            </View>
            <View style={styles.headingRight}>
              <Text style={styles.headingTextDuration}>
                {todayWorkout?.exercise_duration}
              </Text>
            </View>
          </View>
          <View style={styles.workoutCard}>
            <View style={styles.workoutCardHeader}>
              <Text
                style={[
                  styles.workoutCardHeaderName,
                  styles.workoutCardHeaderText,
                ]}
              >
                Exercise
              </Text>
              <Text
                style={[
                  styles.workoutCardHeaderReps,
                  styles.workoutCardHeaderText,
                ]}
              >
                Reps
              </Text>
              <Text
                style={[
                  styles.workoutCardHeaderSets,
                  styles.workoutCardHeaderText,
                ]}
              >
                Sets
              </Text>
            </View>
            {todayWorkout?.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseRow}>
                <Text
                  style={[styles.workoutCardHeaderName, styles.workoutCardText]}
                >
                  {exercise.name}
                </Text>
                <Text
                  style={[styles.workoutCardHeaderReps, styles.workoutCardText]}
                >
                  {exercise.reps}
                </Text>
                <Text
                  style={[styles.workoutCardHeaderSets, styles.workoutCardText]}
                >
                  {exercise.sets}
                </Text>
              </View>
            ))}
          </View>
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

  workoutContainer: {
    overflow: "hidden",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  workoutHeading: {
    backgroundColor: PRIMARY,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  headingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headingLeft: {
    flex: 1,
    gap: 3,
  },

  workoutCard: {
    backgroundColor: SURFACE,
    padding: 15,
  },
  workoutCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderColor: MUTED,
  },

  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  workoutCardHeaderName: {
    textAlign: "left",
    width: "50%",
  },
  workoutCardHeaderReps: {
    textAlign: "center",
    width: "25%",
  },
  workoutCardHeaderSets: {
    textAlign: "right",
    width: "25%",
  },

  workoutCardHeaderText: {
    color: MUTED,
    marginBottom: 5,
    padding: 2,
  },

  workoutCardText: {
    color: "white",
    fontWeight: 100,
    padding: 2,
    marginVertical: 5,
  },

  headingTextTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: TEXT,
  },
  headingTextFocus: {
    color: MUTED,
  },
  headingTextDuration: {
    color: MUTED,
  },
});
