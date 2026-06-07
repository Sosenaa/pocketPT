import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function Login({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const API_BASE_URL = "http://192.168.0.46:5000";

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        alert(`Welcome ${username}`);
        navigation.navigate("MainTabs", {
          screen: "TrainingPlan",
        });
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../assets/Logo_with_black_background.png")}
      />

      <Text style={styles.text}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={"#A3A3A3"}
        value={username}
        onChangeText={setUsername}
      ></TextInput>

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={"#A3A3A3"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      ></TextInput>

      <TouchableOpacity style={styles.loginB} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.login}>No account? Register here...</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },

  logo: {
    alignSelf: "center",
    width: 250,
    height: 250,
    resizeMode: "contain",
  },

  text: {
    color: "white",
    textAlign: "center",
    fontSize: 32,
    marginBottom: 10,
  },

  input: {
    color: "white",
    borderColor: "white",
    borderRadius: 7,
    fontSize: 16,
    borderWidth: 0.5,
    marginVertical: 5,
    marginHorizontal: 5,
    padding: 10,
  },

  loginB: {
    backgroundColor: "#C8FF00",
    borderRadius: 12,
    width: "100%",
    maxWidth: 120,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    padding: 10,
  },
  loginText: {
    fontSize: 20,
  },
  login: {
    color: "#3062FC",
    textAlign: "center",
    marginTop: 15,

    textDecorationLine: "underline",
  },
});
