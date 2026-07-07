import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
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
  meal_name: string;
  ingredients: Ingredient[];
};

type DietDay = {
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

  const today = new Date();

  const todayLabel = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const weekday = today.toLocaleDateString("en-GB", {
    weekday: "long",
  });

  const todayIndex = today.getDay() === 0 ? 7 : today.getDay();

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
      return {
        exercises: 0,
        sets: 0,
        reps: 0,
      };
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

    fetchTrainingPlan();
  }, [navigation]);

  useEffect(() => {
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

    fetchDietPlan();
  }, [navigation]);

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
      <View style={styles.header}>
        <Text style={styles.kicker}>Today</Text>
        <Text style={styles.title}>{todayLabel}</Text>
        <Text style={styles.subtitle}>
          Your training and diet plan for today.
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Exercises" value={trainingStats.exercises} />
        <StatCard label="Sets" value={trainingStats.sets} />
        <StatCard label="Est. reps" value={trainingStats.reps} />
        <StatCard
          label="Meals"
          value={dietLoading ? "..." : dietStats.meals || "-"}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardKicker}>Today's workout</Text>
        <Text style={styles.cardTitle}>
          {todayWorkout?.focus || "No workout found"}
        </Text>

        {todayWorkout && (
          <Text style={styles.cardSubtitle}>
            {todayWorkout.day_name}
            {todayWorkout.exercise_duration
              ? ` - ${todayWorkout.exercise_duration}`
              : ""}
          </Text>
        )}

        {todayWorkout ? (
          <View style={styles.list}>
            {todayWorkout.exercises.map((exercise, index) => (
              <View key={exercise.exercise_id} style={styles.exerciseCard}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>

                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets} sets - {exercise.reps} reps
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyCard text="Generate a training plan to see today's workout here." />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardKicker}>Today's diet</Text>

        {dietLoading ? (
          <Text style={styles.mutedText}>Loading diet...</Text>
        ) : todayDietDay ? (
          <>
            <Text style={styles.cardTitle}>{todayDietDay.diet_day}</Text>
            <Text style={styles.cardSubtitle}>{todayDietDay.total_meals}</Text>

            <View style={styles.miniStatsGrid}>
              <MiniStat label="Meals" value={dietStats.meals} />
              <MiniStat label="Ingredients" value={dietStats.ingredients} />
            </View>

            <View style={styles.list}>
              {todayDietDay.meal.map((meal, index) => (
                <View
                  key={`${meal.meal_name}-${index}`}
                  style={styles.mealCard}
                >
                  <Text style={styles.mealName}>{meal.meal_name}</Text>

                  <View style={styles.ingredients}>
                    {meal.ingredients.map((ingredient, ingredientIndex) => (
                      <Text
                        key={`${ingredient.name}-${ingredientIndex}`}
                        style={styles.ingredientText}
                      >
                        {ingredient.name} - {ingredient.amount}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <EmptyCard text="No diet plan found for today. Generate a full plan first." />
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

const MiniStat = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.miniStat}>
    <Text style={styles.miniStatLabel}>{label}</Text>
    <Text style={styles.miniStatValue}>{value}</Text>
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
  header: {
    marginBottom: 20,
  },
  kicker: {
    color: "#C8FF00",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    width: "48%",
    borderWidth: 2,
    borderColor: "#2a2a2e",
    backgroundColor: "#111111",
    padding: 14,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 8,
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "800",
  },
  card: {
    borderWidth: 2,
    borderColor: "#2a2a2e",
    backgroundColor: "#111111",
    padding: 16,
    marginBottom: 18,
  },
  cardKicker: {
    color: "#C8FF00",
    fontSize: 13,
    fontWeight: "700",
  },
  cardTitle: {
    marginTop: 6,
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
  },
  cardSubtitle: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 14,
  },
  list: {
    marginTop: 16,
    gap: 10,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#0E0E0E",
    padding: 12,
  },
  numberBadge: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C8FF00",
    marginRight: 12,
  },
  numberText: {
    color: "#080808",
    fontWeight: "800",
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  exerciseMeta: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 13,
  },
  miniStatsGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  miniStat: {
    flex: 1,
    backgroundColor: "#0E0E0E",
    padding: 12,
  },
  miniStatLabel: {
    color: "#64748B",
    fontSize: 12,
  },
  miniStatValue: {
    marginTop: 4,
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
  },
  mealCard: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#0E0E0E",
    padding: 12,
  },
  mealName: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  ingredients: {
    marginTop: 8,
    gap: 4,
  },
  ingredientText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  mutedText: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 14,
  },
  emptyCard: {
    marginTop: 14,
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
