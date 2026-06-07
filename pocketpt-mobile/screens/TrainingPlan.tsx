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
          navigation.navigate("UserForm");

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
        <View style={styles.header}>
          <Text style={styles.planLabel}>YOUR PLAN</Text>
          <Text style={styles.planName}>{plan?.plan_name}</Text>
          <View style={styles.planDivider} />
        </View>

        {plan?.workouts.map((workout, index) => (
          <View key={index} style={styles.workoutCard}>
            {/* Card Header / Tap to expand */}
            <TouchableOpacity
              style={[
                styles.workoutTitle,
                cardIndex === index && styles.workoutTitleActive,
              ]}
              onPress={() => cardCollapse(index)}
              activeOpacity={0.85}
            >
              <View style={styles.workoutTitleLeft}>
                <Text style={styles.dayText}>{workout?.day_name}</Text>
                <Text style={styles.focusText}>{workout?.focus}</Text>
              </View>
              <View style={styles.workoutTitleRight}>
                <Text style={styles.durationText}>
                  {workout?.exercise_duration}
                </Text>
                <Text
                  style={[
                    styles.chevron,
                    cardIndex === index && styles.chevronOpen,
                  ]}
                >
                  ›
                </Text>
              </View>
            </TouchableOpacity>

            {cardIndex === index && (
              <View style={styles.exerciseContainer}>
                {/* Table Header */}
                <View style={styles.exerciseHeader}>
                  <Text
                    style={[styles.exerciseHeaderText, styles.exerciseColName]}
                  >
                    EXERCISE
                  </Text>
                  <Text
                    style={[styles.exerciseHeaderText, styles.exerciseColStat]}
                  >
                    SETS
                  </Text>
                  <Text
                    style={[styles.exerciseHeaderText, styles.exerciseColStat]}
                  >
                    REPS
                  </Text>
                </View>

                {workout?.exercises.map((exercise, exerciseIndex) => (
                  <View
                    key={exerciseIndex}
                    style={[
                      styles.exerciseRow,
                      exerciseIndex % 2 === 0 && styles.exerciseRowAlt,
                    ]}
                  >
                    <Text style={[styles.exerciseText, styles.exerciseColName]}>
                      {exercise?.name}
                    </Text>
                    <Text
                      style={[styles.exerciseStatText, styles.exerciseColStat]}
                    >
                      {exercise?.sets}
                    </Text>
                    <Text
                      style={[styles.exerciseStatText, styles.exerciseColStat]}
                    >
                      {exercise?.reps}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
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

  header: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  planLabel: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 6,
  },
  planName: {
    color: TEXT,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  planDivider: {
    height: 1,
    backgroundColor: BORDER,
  },

  workoutCard: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
  },

  workoutTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  workoutTitleActive: {
    backgroundColor: PRIMARY,
  },
  workoutTitleLeft: {
    flex: 1,
    gap: 3,
  },
  workoutTitleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },
  focusText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "500",
  },
  durationText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "500",
  },
  chevron: {
    color: MUTED,
    fontSize: 22,
    fontWeight: "300",
    transform: [{ rotate: "90deg" }],
  },
  chevronOpen: {
    color: "#000",
    transform: [{ rotate: "-90deg" }],
  },

  workoutTitleActive_dayText: {
    color: "#000",
  },

  exerciseContainer: {
    backgroundColor: SURFACE2,
    paddingHorizontal: 18,
    paddingBottom: 12,
    paddingTop: 4,
  },
  exerciseHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 4,
  },
  exerciseHeaderText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  exerciseRowAlt: {
    backgroundColor: "#181818",
  },
  exerciseColName: {
    flex: 1,
  },
  exerciseColStat: {
    width: 52,
    textAlign: "center",
  },
  exerciseText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "400",
  },
  exerciseStatText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "700",
  },

  navbar: {
    position: "static",
  },
});
