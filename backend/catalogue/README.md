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

The app now offers an explicitly labelled **preview week** using breakfast-021,
lunch-001 and dinner-021, repeated Monday to Sunday. These sample entries have
source-checked nutrition and provisional test portion limits; they remain drafts,
not approved meals for dietary/allergen exclusions. The other catalogue entries
are not automatically selected. No claim of full catalogue approval is made.

`catalog_loader.generate_catalogue_week(targets)` adjusts one meal at a time,
retaining the other meals' changes, for at most three passes. It is a local search,
not a guarantee of a global optimum or an exact target match. It reports whether
each nutrient is within 10% of the requested daily targets. Targets are explicitly
calculated from the latest saved body details and goal by default; manual values
are an optional override. See `TARGETS.md` for the equation, app policy and limits.

GET/POST `/api/weeklyDietPlan` saves/loads the week and its combined shopping list
as a user-owned JSON snapshot in `weekly_diet_plans`. The diet page, today's diet
card and shopping page use this same saved plan. Old daily-plan records are kept.
Diet generation makes no AI or USDA requests. Existing training generation still
uses its original flow.

An initial review of nine meals is recorded in `review/SAMPLE_REVIEW.md`: six have
complete base-serving totals; three await suitable milk, peanuts-only peanut
butter or canned drained lentil references. Prices and pack counts remain deferred.

Offline integration checks (temporary database, no API calls):

```powershell
backend\.venv\Scripts\python.exe -m unittest discover -s backend -p test_weekly_catalogue.py -v
```
