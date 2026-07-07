import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type Ingredients = {
  name: string;
  amount: string;
};

type Meals = {
  meal_id: number;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: Ingredients[];
};

type DietDay = {
  diet_day: string;
  total_meals: string;
  meal: Meals[];
};

type Diet = {
  diet_name: string;
  diet_days: DietDay[];
};

const API_BASE_URL = "http://192.168.0.46:5000";

export default function DietPlan() {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const [refreshingMealId, setRefreshingMealId] = useState<number | null>(null);

  const cardCollapse = (index: number) => {
    setCardIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    fetchDiet();
  }, []);

  const fetchDiet = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/getDietPlan`, {
        credentials: "include",
        method: "GET",
      });

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch diet plan");
      }

      const data = await response.json();
      setDiet(data);
    } catch (err) {
      console.log(err);
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

      setDiet((currentDiet) => {
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
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setRefreshingMealId(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Nutrition</Text>
        <Text style={styles.headerText}>Diet Plan</Text>
        <Text style={styles.subtitle}>
          Open a day and refresh any meal you do not like.
        </Text>
      </View>

      {diet?.diet_days.map((day, index) => {
        const isOpen = cardIndex === index;
        const dayMacros = day.meal.reduce(
          (total, meal) => ({
            calories: total.calories + Number(meal.calories || 0),
            protein: total.protein + Number(meal.protein || 0),
            carbs: total.carbs + Number(meal.carbs || 0),
            fats: total.fats + Number(meal.fats || 0),
          }),
          {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
          },
        );
        return (
          <View key={`${day.diet_day}-${index}`} style={styles.dayCard}>
            <TouchableOpacity
              onPress={() => cardCollapse(index)}
              activeOpacity={0.8}
              style={[styles.dayHeader, isOpen && styles.dayHeaderOpen]}
            >
              <View style={styles.dayHeaderContent}>
                <View style={styles.dayTitleBlock}>
                  <Text style={[styles.dayText, isOpen && styles.dayTextOpen]}>
                    {day.diet_day}
                  </Text>

                  <Text
                    style={[styles.mealsText, isOpen && styles.mealsTextOpen]}
                  >
                    {day.total_meals}
                  </Text>
                </View>

                <View style={styles.dayMacroInline}>
                  <Text
                    style={[
                      styles.dayMacroText,
                      isOpen && styles.dayMacroTextOpen,
                    ]}
                  >
                    {dayMacros.calories} kcal
                  </Text>

                  <Text
                    style={[
                      styles.dayMacroSubText,
                      isOpen && styles.dayMacroTextOpen,
                    ]}
                  >
                    P {dayMacros.protein}g • C {dayMacros.carbs}g • F{" "}
                    {dayMacros.fats}g
                  </Text>
                </View>
              </View>

              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={22}
                color={isOpen ? BG : TEXT}
              />
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.mealsWrapper}>
                {day.meal.map((meal) => (
                  <View key={meal.meal_id} style={styles.mealCard}>
                    <View style={styles.mealHeader}>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{meal.meal_name}</Text>
                        <Text style={styles.mealMeta}>
                          {meal.ingredients.length} ingredients
                        </Text>
                        <View style={styles.macroRow}>
                          <View style={styles.macroBox}>
                            <Text style={styles.macroValue}>
                              {meal.calories}
                            </Text>
                            <Text style={styles.macroLabel}>kcal</Text>
                          </View>

                          <View style={styles.macroBox}>
                            <Text style={styles.macroValue}>
                              {meal.protein}g
                            </Text>
                            <Text style={styles.macroLabel}>Protein</Text>
                          </View>

                          <View style={styles.macroBox}>
                            <Text style={styles.macroValue}>{meal.carbs}g</Text>
                            <Text style={styles.macroLabel}>Carbs</Text>
                          </View>

                          <View style={styles.macroBox}>
                            <Text style={styles.macroValue}>{meal.fats}g</Text>
                            <Text style={styles.macroLabel}>Fats</Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => substituteMeal(meal.meal_id)}
                        disabled={refreshingMealId === meal.meal_id}
                        activeOpacity={0.8}
                        style={[
                          styles.refreshButton,
                          refreshingMealId === meal.meal_id &&
                            styles.disabledButton,
                        ]}
                      >
                        {refreshingMealId === meal.meal_id ? (
                          <ActivityIndicator size="small" color={BG} />
                        ) : (
                          <Ionicons name="refresh" size={20} color={BG} />
                        )}
                      </TouchableOpacity>
                    </View>

                    <View style={styles.ingredientsHeader}>
                      <Text style={styles.ingredientsHeaderName}>
                        Ingredient
                      </Text>
                      <Text style={styles.ingredientsHeaderAmount}>Amount</Text>
                    </View>

                    {meal.ingredients.map((ingredient, ingredientIndex) => (
                      <View
                        key={`${ingredient.name}-${ingredientIndex}`}
                        style={styles.ingredientRow}
                      >
                        <Text style={styles.ingredientName}>
                          {ingredient.name}
                        </Text>
                        <Text style={styles.ingredientAmount}>
                          {ingredient.amount}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const PRIMARY = "#C8FF00";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const SURFACE2 = "#1A1A1A";
const BORDER = "#262626";
const TEXT = "#FFFFFF";
const MUTED = "#8A8A8A";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 22,
  },
  kicker: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerText: {
    color: TEXT,
    fontSize: 32,
    fontWeight: "900",
    marginTop: 6,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    marginTop: 8,
  },
  dayCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: SURFACE,
    marginBottom: 12,
  },
  dayHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE,
  },
  dayHeaderOpen: {
    backgroundColor: PRIMARY,
  },
  dayText: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
  },
  dayTextOpen: {
    color: BG,
  },
  mealsText: {
    color: MUTED,
    fontSize: 13,
    marginTop: 3,
  },
  mealsTextOpen: {
    color: BG,
    opacity: 0.75,
  },
  mealsWrapper: {
    padding: 12,
  },
  mealCard: {
    backgroundColor: SURFACE2,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  mealInfo: {
    flex: 1,
    paddingRight: 12,
  },
  mealName: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
  },
  mealMeta: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  ingredientsHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    paddingVertical: 8,
    marginBottom: 6,
  },
  ingredientsHeaderName: {
    flex: 1,
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  ingredientsHeaderAmount: {
    width: 90,
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    textTransform: "uppercase",
  },
  ingredientRow: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  ingredientName: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
  },
  ingredientAmount: {
    width: 90,
    color: TEXT,
    fontSize: 14,
    textAlign: "right",
  },
  macroRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  macroBox: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#262626",
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },

  macroValue: {
    color: "#C8FF00",
    fontSize: 14,
    fontWeight: "900",
  },

  macroLabel: {
    color: "#8A8A8A",
    fontSize: 10,
    marginTop: 2,
  },
  dayHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 12,
    gap: 12,
  },

  dayTitleBlock: {
    flex: 1,
  },

  dayMacroInline: {
    alignItems: "flex-end",
    maxWidth: 150,
  },

  dayMacroText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "900",
  },

  dayMacroSubText: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },

  dayMacroTextOpen: {
    color: BG,
  },
});
