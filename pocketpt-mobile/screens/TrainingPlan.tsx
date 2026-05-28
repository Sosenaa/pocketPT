import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
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

export default function Register({ navigation }: any) {
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
          return null;
        }
        if (res.status === 404) {
          alert("Complete the form to create training plan");

          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch training plan");
        }

        return res.json();
      })
      .then((data) => {
        setPlan(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text>{plan?.plan_name}</Text>

      {plan?.workouts.map((workout, index) => (
        <View key={index}>
          <View style={styles.workoutTitle}>
            <Text style={styles.workoutTitleText}>{workout?.day_name}</Text>
            <Text style={styles.workoutTitleText}>
              {workout?.exercise_duration}
            </Text>
            <Text>▼</Text>
            {workout?.exercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex}>
                <Text>{exercise?.name}</Text>
                <Text>{exercise?.reps}</Text>
                <Text>{exercise?.sets}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    color: "white",
  },

  workoutTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",

    backgroundColor: "#C8FF00",
    margin: 1,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  workoutTitleText: {
    color: "black",
    borderWidth: 1,
    width: "auto",
  },
});
