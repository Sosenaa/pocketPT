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

type Ingredients = {
  name: string;
  amount: string;
};

type Meals = {
  meal_name: string;
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

export default function DietPlan() {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const API_BASE_URL = "http://192.168.0.46:5000";

  const cardCollapse = (index: number) => {
    setCardIndex((prev) => (prev === index ? null : index));
  };
  useEffect(() => {
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
        console.log(data);
        setDiet(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchDiet();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.containerScroll}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Diet Plan</Text>
          <View style={styles.planDivider} />
        </View>

        {diet?.diet_days.map((day, index) => (
          <View key={index} style={styles.dietDayContainer}>
            <TouchableOpacity onPress={() => cardCollapse(index)}>
              <View
                style={[
                  styles.dayHeader,
                  cardIndex === index && { backgroundColor: PRIMARY },
                ]}
              >
                <View>
                  <Text style={styles.dayText}>{day.diet_day}</Text>
                  <Text style={styles.mealsText}>{day.total_meals}</Text>
                </View>
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
              <>
                {day.meal.map((m, mIndex) => (
                  <View key={mIndex} style={styles.mealContainer}>
                    <View style={styles.mealHeader}>
                      <Text
                        style={[
                          styles.placeHolder,
                          { color: MUTED, fontSize: 15, fontWeight: 600 },
                        ]}
                      >
                        {m.meal_name}
                      </Text>
                      <Text
                        style={[
                          styles.ingTextName,
                          { color: MUTED, fontSize: 15, fontWeight: 600 },
                        ]}
                      >
                        Ingredient
                      </Text>
                      <Text
                        style={[
                          styles.ingTextAmount,
                          { color: MUTED, fontSize: 15, fontWeight: 600 },
                        ]}
                      >
                        Amount
                      </Text>
                    </View>

                    {m.ingredients.map((ing, ingIndex) => (
                      <View key={ingIndex} style={styles.ingContainer}>
                        <Text
                          style={[styles.placeHolder, { color: TEXT }]}
                        ></Text>
                        <Text style={[styles.ingTextName, { color: TEXT }]}>
                          {ing.name}
                        </Text>
                        <Text style={[styles.ingTextAmount, { color: TEXT }]}>
                          {ing.amount}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </>
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

  headerText: {
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

  dietDayContainer: {
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: SURFACE,
    marginVertical: 5,
  },

  dayHeader: {
    paddingHorizontal: 25,
    flexDirection: "row",
    backgroundColor: SURFACE,
    paddingVertical: 10,
    justifyContent: "space-between",
  },

  dayText: {
    padding: 2,
    color: TEXT,
    fontSize: 18,
    fontWeight: 600,
  },
  mealsText: {
    padding: 2,
    color: MUTED,
  },

  mealContainer: {
    borderWidth: 1,
    marginBottom: 10,
    borderColor: BORDER,
  },

  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: BORDER,
    padding: 15,
  },

  ingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginVertical: 5,
  },

  placeHolder: {
    width: "30%",
  },

  ingTextName: {
    width: "40%",
    textAlign: "center",
  },
  ingTextAmount: {
    width: "30%",
    textAlign: "right",
  },
  chevron: {
    color: "white",
    fontSize: 22,
    fontWeight: "300",
    transform: [{ rotate: "90deg" }],
  },
  chevronOpen: {
    color: "white",
    transform: [{ rotate: "-90deg" }],
  },
});
