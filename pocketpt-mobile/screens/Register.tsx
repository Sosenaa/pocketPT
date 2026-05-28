import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function Register({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassowrd] = useState("");

  const API_BASE_URL = "http://192.168.0.46:5000";

  const handleRegister = async () => {
    if (password == confirmPassword) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            name,
            lastname,
            email,
            password,
            confirmPassword,
          }),
        });
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          alert("Registered successfully");
          navigation.navigate("Login");
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../assets/Logo_with_black_background.png")}
      />

      <Text style={styles.text}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={"#A3A3A3"}
        value={username}
        onChangeText={setUsername}
      ></TextInput>

      <TextInput
        style={styles.input}
        placeholder="First name"
        placeholderTextColor={"#A3A3A3"}
        value={name}
        onChangeText={setName}
      ></TextInput>

      <TextInput
        style={styles.input}
        placeholder="Last name"
        placeholderTextColor={"#A3A3A3"}
        value={lastname}
        onChangeText={setLastname}
      ></TextInput>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={"#A3A3A3"}
        value={email}
        onChangeText={setEmail}
      ></TextInput>

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={"#A3A3A3"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      ></TextInput>

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={"#A3A3A3"}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassowrd}
      ></TextInput>

      <TouchableOpacity style={styles.regButton} onPress={handleRegister}>
        <Text style={styles.regText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.login}>Already have an account? Login here</Text>
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
    width: 220,
    height: 220,
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

  regButton: {
    backgroundColor: "#C8FF00",
    borderRadius: 12,
    width: "100%",
    maxWidth: 120,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    padding: 10,
  },
  regText: {
    fontSize: 20,
  },
  login: {
    color: "#3062FC",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 15,
    textDecorationLine: "underline",
  },
});
