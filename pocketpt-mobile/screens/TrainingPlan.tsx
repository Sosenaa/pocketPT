import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
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

export default function Register({ navigation }: any) {
  const [plan, setPlan] = useState<TrainingPlanData | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);

  const API_BASE_URL = "http://192.168.0.46:5000";

  const cardCollapse = (index: number) => {
    setCardIndex((prev) => (prev === index ? null : index));
  };

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
    <ScrollView contentContainerStyle={styles.containerScroll}>
      <View style={styles.container}>
        <Text style={styles.planName}>{plan?.plan_name}</Text>

        {plan?.workouts.map((workout, index) => (
          <View key={index}>
            <View style={styles.workout}>
              <View style={styles.workoutTitle}>
                <Text style={styles.workoutTitleTextDay}>
                  {workout?.day_name}
                </Text>
                <Text style={styles.workoutTitleTextDuration}>
                  {workout?.exercise_duration}
                </Text>
                <Text style={styles.workoutTitleTextFocus}>
                  {workout?.focus}
                </Text>
                <TouchableOpacity onPress={() => cardCollapse(index)}>
                  <Text>▼</Text>
                </TouchableOpacity>
              </View>
              {cardIndex === index && (
                <View>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseHeaderTextExercise}>
                      Exercise
                    </Text>
                    <Text style={styles.exerciseHeaderText}>Reps</Text>
                    <Text style={styles.exerciseHeaderText}>Sets</Text>
                  </View>

                  {workout?.exercises.map((exercise, exerciseIndex) => (
                    <View key={exerciseIndex}>
                      <View style={styles.exercises}>
                        <Text style={styles.exerciseTextName}>
                          {exercise?.name}
                        </Text>
                        <Text style={styles.exerciseText}>
                          {exercise?.reps}
                        </Text>
                        <Text style={styles.exerciseText}>
                          {exercise?.sets}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
      <Navbar navigation={navigation} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerScroll: {
    flexGrow: 1,
    justifyContent: "center",

    backgroundColor: "black",
  },

  container: {
    backgroundColor: "black",
    flex: 1,
    justifyContent: "center",
  },

  planName: {
    textAlign: "center",
    color: "white",
    fontSize: 30,
    margin: 10,
  },

  exerciseHeader: {
    flexDirection: "row",
    marginVertical: 8,
    paddingHorizontal: 5,
  },

  exerciseHeaderTextExercise: {
    color: "white",
    width: "50%",
    fontSize: 18,
    fontWeight: "900",
  },

  exerciseHeaderText: {
    color: "white",
    width: "25%",
  },

  workout: {
    marginVertical: 5,
  },

  workoutTitle: {
    flexDirection: "row",
    backgroundColor: "#C8FF00",
    borderRadius: 10,
    justifyContent: "space-evenly",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  workoutTitleTextDay: {
    color: "black",
    width: "25%",
    fontSize: 15,
  },
  workoutTitleTextDuration: {
    color: "black",
    width: "17%",
    fontSize: 15,
  },

  workoutTitleTextFocus: {
    color: "black",
    width: "40%",
    fontSize: 15,
  },

  exercises: {
    borderBottomWidth: 0.2,
    borderBlockColor: "white",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 2,
    margin: 2,
  },

  exerciseTextName: {
    color: "white",
    width: "50%",
  },
  exerciseText: {
    color: "white",
    width: "25%",
  },

  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#C8FF00",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});
