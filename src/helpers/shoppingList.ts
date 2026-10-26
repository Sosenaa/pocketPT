type Ingredient = {
    name: string;
    amount: string;
}

export function combineIngredients(
    ingrediets: Ingredient[],
): Ingredient[] {
    const combined = new Map<string, Ingredient>();

    for (const ingredient of ingrediets) {
        const name = ingredient.name.trim()
        const amount = ingredient.amount.trim() 

        //recognise simple quantities such as 250g, 100ml
        const match = /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l)?$/i.exec(amount);

        if (!match) {
            combined.set(`description-${combined.size}`, {name, amount});
            continue;
        }

        let quantity = Number(match[1]);
        let unit = (match[2] ?? "").toLowerCase();

        if (unit === "kg") {
            quantity *= 1000;
            unit = "g";
        }else if (unit === "l") {
            quantity *= 1000;
            unit = "ml";
        }
        
        const key = `${name.toLowerCase()}|${unit}`;
        const existing = combined.get(key);

        const total = existing 
            ? parseFloat(existing.amount) + quantity
            : quantity;

        combined.set(key,{
            name: existing?.name ?? name, 
            amount: `${Number(total.toFixed(3))}${unit}`,
        });
    }

        return [...combined.values()].sort((a,b) => a.name.localeCompare(b.name),
        );
    }

