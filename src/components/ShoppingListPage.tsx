import { API_BASE_URL } from "../api";
import ShoppingList from "./ShoppingList";
import { useState, useEffect } from "react";
import {combineIngredients} from "../helpers/shoppingList";

type Ingredient = {
    name: string;
    amount: string; 
};

type Diet = {
  diet_name: string;
  diet_days:{
    diet_day:string;
    meal:{
      meal_name:string;
      ingredients:Ingredient[];
    }[];
  }[];
}

const ShoppingListPage = () => {
const [diet, setDiet] = useState<Diet|null>(null);

useEffect(() => {
  const fetchDietData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/getDietPlan`,{
        credentials: 'include',
      });
      const data: Diet = await response.json();
      setDiet(data);
    } catch (error) {
      console.error('Error fetching diet data:', error);
    }
  };

  void fetchDietData();
}, []);

const ingredients =
  diet?.diet_days.flatMap((day) =>
    day.meal.flatMap((meal) => meal.ingredients),
  ) ?? [];


  return (
    <div>
      <ShoppingList ingredients={combineIngredients(ingredients)} />
    </div>
  )
}

export default ShoppingListPage
