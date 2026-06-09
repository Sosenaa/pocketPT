import { useState } from "react";

import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";

export default function UserForm({ navigation }: any) {
  const API_BASE_URL = "http://192.168.0.46:5000";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const questions = [
    {
      key: "age",
      question: "What is your age?",
      type: "input",
    },
    {
      key: "weight",
      question: "What is your weight in KG?",
      type: "input",
    },
    {
      key: "height",
      question: "What is your height in CM",
      type: "input",
    },
    {
      key: "gender",
      question: "What is your gender",
      type: "choice",
      options: ["Male", "Female"],
    },
    {
      key: "goal",
      question: "What is your goal",
      type: "choice",
      options: [
        "Lose Fat",
        "maintain Weight",
        "Gain Muscle",
        "Increase Strength",
        "Improve Endurance",
      ],
    },
    {
      key: "activity",
      question: "What is you activity level",
      type: "choice",
      options: [
        "Sedentary (Low Activity)",
        "Moderately Active (Medium Activity)",
        "Highly Active (High Activity)",
      ],
    },
    {
      key: "trainingEnvironment",
      question: "Select your environment",
      type: "choice",
      options: [
        "Full gym",
        "Basic gym",
        "Home gym",
        "Home bodyweight",
        "Mixed",
      ],
    },
  ];
  const currentQuestion = questions[currentIndex];

  const saveAnswer = (value: string) => {
    setAnswer({
      ...answer,
      [currentQuestion.key]: value,
    });

    const finalAnswer = {
      ...answer,
      [currentQuestion.key]: value,
    };

    setInputValue("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitUserDetails(finalAnswer);
    }
  };

  const submitUserDetails = async (userData: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/userDetails`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.status === 401) {
        navigation.navigate("Login");
        return;
      }
      if (response.ok) {
        const fullPlan = await fetch(`${API_BASE_URL}/api/generateFullPlan`, {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const trainingData = fullPlan.json();
        if (fullPlan.ok) {
          setLoading(false);
          navigation.navigate("TrainingPlan");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C8FF00" />
        <Text style={styles.loadingText}>Generating your plan...</Text>
        <Text style={styles.loadingSubText}>This may take a moment</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.containerScroll}>
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {currentQuestion.type === "input" && (
          <View style={styles.inputGroup}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Type your answer..."
              placeholderTextColor="#555"
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => saveAnswer(inputValue)}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentQuestion.type === "choice" && (
          <View style={styles.optionsGroup}>
            {currentQuestion.options?.map((option, index) => (
              <TouchableOpacity
                key={option}
                onPress={() => saveAnswer(option)}
                style={styles.optionButton}
                activeOpacity={0.7}
              >
                <View style={styles.optionIndex}>
                  <Text style={styles.optionIndexText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  progressText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1,
    minWidth: 40,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: BORDER,
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 1,
  },

  questionText: {
    color: TEXT,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 40,
    letterSpacing: -0.5,
  },

  inputGroup: {
    gap: 16,
  },
  input: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    color: TEXT,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  nextButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  optionsGroup: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  optionIndexText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
  },
  optionText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    color: TEXT,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
  },
  loadingSubText: {
    color: MUTED,
    fontSize: 14,
    marginTop: 8,
  },
});
