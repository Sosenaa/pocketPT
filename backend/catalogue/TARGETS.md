# Automatic nutrition targets: adult-fitness-v1

Default diet generation uses the latest saved `user_details` row belonging to
the signed-in user, ordered by its ID. It uses age (years), weight (kg), height
(cm), the existing `gender` field as the equation's male/female sex input,
activity and goal. Unsupported/missing inputs return an actionable error.
Training target calculations and authentication have not been changed.

## Equation and application policy

Resting energy is estimated with the simplified Mifflin–St Jeor equation:

`10 × kg + 6.25 × cm − 5 × age + sex coefficient`

The coefficient is +5 for male and −161 for female. This is an estimate of
resting expenditure, not maintenance calories by itself.

Application defaults, explicitly separate from the published equation:

| Setting | Policy |
| --- | --- |
| Low / medium / high activity | Multiply resting energy by 1.2 / 1.55 / 1.725 |
| Lose weight | Maintenance estimate × 0.85 |
| Maintain weight | Maintenance estimate × 1.0 |
| Gain muscle | Maintenance estimate × 1.10 |
| Increase strength / improve endurance | Maintenance estimate × 1.0; no implicit weight-change goal |
| Protein | 1.6g/kg/day, capped at 35% of target calories |
| Fat | 30% of target calories, converted using 9 kcal/g |
| Carbohydrate | Remaining calories after protein and fat, using 4 kcal/g |

Calories are rounded to whole kcal, macros to 0.1g. The macro energy sum can
differ by less than 1 kcal after rounding. Meal calories still use source USDA
energy; do not replace those values with a forced 4/4/9 sum.

These settings are initial fitness-app policy choices, not a claim that one split
or activity multiplier is optimal for everyone. They are not the NIDDK dynamic
body-weight model. Exercise calories are not added again on top of activity.
Progress-based adjustment and personalised sports/medical nutrition remain future work.

## Supported inputs and limits

Automatic estimates support adult profiles (18–120 years), 20–400kg, 100–250cm,
and the form's existing male/female equation inputs. These numeric ranges are
input validation bounds, not endorsed health ranges. Unknown activity/goal
values are rejected. Loss targets for BMI below 18.5 are not generated.

The automatic planner rejects targets below 1,500 kcal for the male equation or
1,200 kcal for the female equation rather than silently clamping or prescribing
a very low intake. These are application guardrails, not guarantees that every
profile above a cutoff has suitable intake. The UI describes estimates as adult
starting points, not medical prescriptions, and excludes pregnancy/breastfeeding
from their intended use. Special populations need a separately designed workflow.

## API and snapshots

- `GET /api/nutritionTargets`: estimate preview, including calculated targets,
  profile, resting/maintenance estimates, goal adjustment and policy version.
- `POST /api/weeklyDietPlan` with `{ "target_mode": "automatic" }` (or `{}`):
  recalculate from current saved details and generate a week.
- With `{ "target_mode": "manual", "targets": { ... } }`: validate and use
  explicit user targets. Legacy `{ "targets": { ... } }` remains accepted as manual.
- A generated week's `target_calculation` records the method, policy version and
  input snapshot for automatic mode, or the manual mode/targets. Saved plans do
  not change when profile data changes; generate a new plan to apply changes.
- Diet-only, legacy generation aliases and combined workout/diet routes all
  resolve diet targets this way. The workout generator itself is unchanged.

The sample catalogue remains limited to three repeated draft meals. A valid
target estimate does not imply the available meals can meet it: daily totals
outside the existing 10% tolerance remain visibly flagged.

## Sources

- Mifflin et al., 1990, *A new predictive equation for resting energy expenditure
  in healthy individuals*: https://doi.org/10.1093/ajcn/51.2.241
  ([original paper](https://www.carnotdiet.com/Files/BMRMifflin1990.pdf)).
- NIH Office of Dietary Supplements, exercise and athletic performance: the
  1.2–2.0g/kg protein context for athletes, not a prescription of our chosen 1.6:
  https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/
- AHA/ACC/TOS obesity guideline, calorie-restricted adult diet context:
  https://pmc.ncbi.nlm.nih.gov/articles/PMC5819889/
- NHLBI adult BMI classification (18.5 lower boundary for the normal category):
  https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm
- NIDDK Body Weight Planner, adult estimate limitations:
  https://www.niddk.nih.gov/bwp

Consulted 3 November 2026. The policy version is retained so later changes to
defaults do not silently rewrite historical plans.
