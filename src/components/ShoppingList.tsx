type Ingredient = {
    name: string;
    amount: string;
};

type ShoppingListProps = {
    ingredients: Ingredient[];
};


const ShoppingList = ({ ingredients }: ShoppingListProps) => {
  return (
    <section>
        <h2>Weekly Shopping List</h2>

        <ul>
            {ingredients.map((ingredient, index) => (
                <li key={index}>
                    {ingredient.name} {ingredient.amount}
                </li>
            ))} 
        </ul>
    </section>
  )
}

export default ShoppingList
