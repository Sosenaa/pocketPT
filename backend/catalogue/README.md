# PocketPT starter catalogue

This is catalogue content, not an application-code or database migration.
It contains **150 draft meals: 50 breakfasts, 50 lunches and 50 dinners**,
referencing 97 reusable draft food records. No cooking instructions are included.

## Files

- `CATALOGUE.md`: human-readable catalogue for reviewing meals and quantities.
- `meals.json`: machine-readable meal templates and ingredient quantities.
- `foods.json`: reusable ingredient identities, measurement states and provisional
  dietary suitability. `food_key` joins these records to meal ingredients.
- `review/SAMPLE_REVIEW.md`: review of three meals per category, including six
  complete base-serving nutrition calculations and three pending samples.
- `review/sources/`: original USDA records used to check 23 food references.

## Meaning of quantities

Each meal has one base serving. Quantities are grams of the ingredient in the
measurement state specified by its food record: raw edible portion, dry, drained,
frozen, cooked, dried or as sold. Meat/fish entries exclude bones and eggs exclude
shells. Fruit quantities exclude inedible parts as described in each record.
Milk and other liquids are also weighed in grams in this initial catalogue;
do not interpret their quantities as millilitres.

These base servings are drafts. They have not been fitted to a person's calorie
or macro targets or reviewed as complete nutritional prescriptions. A full day
or week must be validated separately from an individual meal.

## Approval requirements

All meals and foods remain drafts. Before allowing a meal into the planner:

1. Resolve its food keys to reviewed source records, retaining source IDs and the
   original source descriptions. Verify preparation state, product identity and
   nutritional basis. Select a specific fat content for meat and dairy where
   needed; names alone do not establish that match.
2. Populate actual source nutrition values. `nutrition: null` is unknown, not
   zero. Calculate meal totals from the verified ingredient values.
3. Review dietary suitability against the actual foods/products. Generic flags
   are provisional; no-preference users may use any otherwise eligible meal.
   Some cheeses and packaged foods deliberately remain unknown until their
   formulation/suitability is checked.
4. Review allergens separately. A pending allergen review is not an allergen-free
   claim. None of these draft meals is approved for an exclusion-based plan yet.
5. Review realistic serving sizes. Set ingredient `min_grams`, `max_grams` and
   `step_grams`, including which ingredients may be varied independently. Null
   bounds do not grant unrestricted scaling.
6. Define permitted substitution groups and meal compatibility. A shared food
   group or role alone does not approve every possible substitution.

## Prices, substitutions and saved plans

Retailer prices are not invented or embedded in generic foods. Add product/pack
price records separately with currency, source and checked date. Derive price
per 100g from pack weight and pack price. Unpriced ingredients remain unknown;
whole-pack purchasing and confirmed stock determine the shopping budget.

User substitutions should refer to verified replacement foods and override the
user's saved plan, preserving the shared catalogue template. Recalculate portions,
nutrition and cost after a change. Source-backed serving weights will be needed
for count-based displays such as eggs and bananas.

The current generator has not been switched to these catalogue files. An initial
review of nine meals is recorded in `review/SAMPLE_REVIEW.md`: six have complete
base-serving totals, while three await suitable milk, peanuts-only peanut butter
or canned drained lentil references. Source-checked nutrition is not full meal
approval. Review the results and pending product choices before implementing a
catalogue importer or approving entries for generation.
