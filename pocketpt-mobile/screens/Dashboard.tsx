import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

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

type Ingredient = {
  name: string;
  amount: string;
};

type DietMeal = {
  meal_id: number;
  meal_name: string;
  ingredients: Ingredient[];
};

type DietDay = {
  diet_day_id: number;
  diet_day: string;
  total_meals: string;
  meal: DietMeal[];
};

type DietPlanData = {
  diet_name: string;
  diet_days: DietDay[];
};

const Dashboard = () => {
  const navigation = useNavigation<any>();
  const API_BASE_URL = "http://192.168.0.46:5000";
  const [plan, setPlan] = useState<TrainingPlanData | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dietLoading, setDietLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshingExerciseId, setRefreshingExerciseId] = useState<
    number | null
  >(null);
  const [refreshingMealId, setRefreshingMealId] = useState<number | null>(null);

  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 7 : today.getDay();

  const todayLabel = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const weekday = today.toLocaleDateString("en-GB", {
    weekday: "long",
  });

  const todayWorkout = useMemo(() => {
    if (!plan?.workouts?.length) return null;

    return (
      plan.workouts.find(
        (workout) => workout.day_name === `Day ${todayIndex}`,
      ) || plan.workouts[(todayIndex - 1) % plan.workouts.length]
    );
  }, [plan, todayIndex]);

  const todayDietDay = useMemo(() => {
    if (!dietPlan?.diet_days?.length) return null;

    return (
      dietPlan.diet_days.find((day) => day.diet_day === weekday) ||
      dietPlan.diet_days[(todayIndex - 1) % dietPlan.diet_days.length]
    );
  }, [dietPlan, weekday, todayIndex]);

  const trainingStats = useMemo(() => {
    if (!todayWorkout) {
      return { exercises: 0, sets: 0, reps: 0 };
    }

    const sets = todayWorkout.exercises.reduce((total, exercise) => {
      return total + getNumberFromText(exercise.sets);
    }, 0);

    const reps = todayWorkout.exercises.reduce((total, exercise) => {
      return (
        total +
        getNumberFromText(exercise.sets) * getNumberFromText(exercise.reps)
      );
    }, 0);

    return {
      exercises: todayWorkout.exercises.length,
      sets,
      reps,
    };
  }, [todayWorkout]);

  const dietStats = useMemo(() => {
    const meals = todayDietDay?.meal ?? [];

    const ingredients = meals.reduce((total, meal) => {
      return total + meal.ingredients.length;
    }, 0);

    return {
      meals: meals.length,
      ingredients,
    };
  }, [todayDietDay]);

  useEffect(() => {
    fetchTrainingPlan();
    fetchDietPlan();
  }, []);

  const fetchTrainingPlan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/getTrainingPlan`, {
        credentials: "include",
      });

      if (response.status === 401) {
        navigation.navigate("Login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load training plan");
      }

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
      setError("Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDietPlan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/getDietPlan`, {
        credentials: "include",
      });

      if (response.status === 401) {
        navigation.navigate("Login");
        return;
      }

      if (!response.ok) {
        setDietPlan(null);
        return;
      }

      const data = await response.json();
      setDietPlan(data);
    } catch (err) {
      console.error(err);
      setDietPlan(null);
    } finally {
      setDietLoading(false);
    }
  };

  const substituteExercise = async (workoutId: number, exerciseId: number) => {
    setRefreshingExerciseId(exerciseId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/substituteExercise`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workout_id: workoutId,
          exercise_id: exerciseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Could not refresh exercise",
          data.message || "Please try again.",
        );
        return;
      }

      setPlan((currentPlan) => {
        if (!currentPlan) return currentPlan;

        return {
          ...currentPlan,
          workouts: currentPlan.workouts.map((workout) => {
            if (workout.id !== workoutId) return workout;

            return {
              ...workout,
              exercises: workout.exercises.map((exercise) => {
                if (exercise.exercise_id !== exerciseId) return exercise;

                return {
                  ...exercise,
                  name: data.name,
                  sets: data.sets,
                  reps: data.reps,
                };
              }),
            };
          }),
        };
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setRefreshingExerciseId(null);
    }
  };

  const substituteMeal = async (mealId: number) => {
    setRefreshingMealId(mealId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/substituteMeal`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal_id: mealId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Could not refresh meal",
          data.message || "Please try again.",
        );
        return;
      }

      setDietPlan((currentDiet) => {
        if (!currentDiet) return currentDiet;

        return {
          ...currentDiet,
          diet_days: currentDiet.diet_days.map((day) => ({
            ...day,
            meal: day.meal.map((meal) => {
              if (meal.meal_id !== mealId) return meal;

              return {
                ...meal,
                meal_name: data.meal_name,
                ingredients: data.ingredients,
              };
            }),
          })),
        };
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setRefreshingMealId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#C8FF00" />
        <Text style={styles.loadingText}>Loading today's dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.kicker}>Today</Text>
        <Text style={styles.title}>{todayLabel}</Text>
        <Text style={styles.subtitle}>Your training and diet for today.</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Exercises" value={trainingStats.exercises} />
        <StatCard label="Sets" value={trainingStats.sets} />
        <StatCard
          label="Meals"
          value={dietLoading ? "..." : dietStats.meals || "-"}
        />
        <StatCard
          label="Foods"
          value={dietLoading ? "..." : dietStats.ingredients || "-"}
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>Workout</Text>
            <Text style={styles.sectionTitle}>
              {todayWorkout?.focus || "No workout found"}
            </Text>
            {todayWorkout && (
              <Text style={styles.sectionSubtitle}>
                {todayWorkout.day_name} - {todayWorkout.exercise_duration}
              </Text>
            )}
          </View>
        </View>

        {todayWorkout ? (
          <View style={styles.list}>
            {todayWorkout.exercises.map((exercise, index) => (
              <View key={exercise.exercise_id} style={styles.itemCard}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{index + 1}</Text>
                </View>

                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{exercise.name}</Text>
                  <Text style={styles.itemMeta}>
                    {exercise.sets} sets - {exercise.reps} reps
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    substituteExercise(todayWorkout.id, exercise.exercise_id)
                  }
                  disabled={refreshingExerciseId === exercise.exercise_id}
                  style={[
                    styles.refreshButton,
                    refreshingExerciseId === exercise.exercise_id &&
                      styles.disabledButton,
                  ]}
                >
                  <Text style={styles.refreshButtonText}>
                    {refreshingExerciseId === exercise.exercise_id
                      ? "..."
                      : "Refresh"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <EmptyCard text="Generate a training plan to see today's workout." />
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>Diet</Text>
            <Text style={styles.sectionTitle}>
              {todayDietDay?.diet_day || "No diet found"}
            </Text>
            {todayDietDay && (
              <Text style={styles.sectionSubtitle}>
                {todayDietDay.total_meals}
              </Text>
            )}
          </View>
        </View>

        {dietLoading ? (
          <Text style={styles.mutedText}>Loading diet...</Text>
        ) : todayDietDay ? (
          <View style={styles.list}>
            {todayDietDay.meal.map((meal) => (
              <View key={meal.meal_id} style={styles.mealCard}>
                <View style={styles.mealTopRow}>
                  <View style={styles.mealTitleWrap}>
                    <Text style={styles.itemTitle}>{meal.meal_name}</Text>
                    <Text style={styles.itemMeta}>
                      {meal.ingredients.length} ingredients
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => substituteMeal(meal.meal_id)}
                    disabled={refreshingMealId === meal.meal_id}
                    style={[
                      styles.refreshButton,
                      refreshingMealId === meal.meal_id &&
                        styles.disabledButton,
                    ]}
                  >
                    <Text style={styles.refreshButtonText}>
                      {refreshingMealId === meal.meal_id ? "..." : "Refresh"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.ingredientsList}>
                  {meal.ingredients.map((ingredient, index) => (
                    <Text
                      key={`${ingredient.name}-${index}`}
                      style={styles.ingredientText}
                    >
                      {ingredient.name} - {ingredient.amount}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyCard text="Generate a full plan to see today's diet." />
        )}
      </View>
    </ScrollView>
  );
};

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const EmptyCard = ({ text }: { text: string }) => (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const getNumberFromText = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#080808",
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080808",
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    color: "#94A3B8",
    fontSize: 14,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 15,
    textAlign: "center",
  },
  headerCard: {
    backgroundColor: "#111111",
    borderWidth: 2,
    borderColor: "#2a2a2e",
    padding: 18,
    marginBottom: 14,
  },
  kicker: {
    color: "#C8FF00",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 6,
    color: "#94A3B8",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: "48%",
    minHeight: 82,
    backgroundColor: "#111111",
    borderWidth: 2,
    borderColor: "#2a2a2e",
    padding: 14,
    justifyContent: "center",
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 6,
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "900",
  },
  sectionCard: {
    backgroundColor: "#111111",
    borderWidth: 2,
    borderColor: "#2a2a2e",
    padding: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionKicker: {
    color: "#C8FF00",
    fontSize: 13,
    fontWeight: "800",
  },
  sectionTitle: {
    marginTop: 4,
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
  },
  sectionSubtitle: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 13,
  },
  list: {
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E0E0E",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 12,
    minHeight: 74,
  },
  badge: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C8FF00",
    marginRight: 12,
  },
  badgeText: {
    color: "#080808",
    fontWeight: "900",
  },
  itemBody: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "800",
  },
  itemMeta: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 12,
  },
  refreshButton: {
    backgroundColor: "#C8FF00",
    paddingVertical: 9,
    paddingHorizontal: 12,
    minWidth: 74,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#080808",
    fontSize: 12,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.5,
  },
  mealCard: {
    backgroundColor: "#0E0E0E",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 12,
  },
  mealTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  mealTitleWrap: {
    flex: 1,
  },
  ingredientsList: {
    marginTop: 10,
    gap: 4,
  },
  ingredientText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  mutedText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#2a2a2a",
    backgroundColor: "#0E0E0E",
    padding: 14,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 13,
  },
});

export default Dashboard;
