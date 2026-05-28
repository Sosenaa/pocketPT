import {
  createStaticNavigation,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import Register from "../screens/Register";
import TrainingPlan from "../screens/TrainingPlan";

const Navigation = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Navigation.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Navigation.Screen name="Register" component={Register} />
        <Navigation.Screen name="Login" component={Login} />
        <Navigation.Screen name="TrainingPlan" component={TrainingPlan} />
      </Navigation.Navigator>
    </NavigationContainer>
  );
}
