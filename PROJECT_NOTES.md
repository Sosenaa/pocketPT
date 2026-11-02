# PocketPT project notes

Updated: 2 November 2026

## Working preference

The user writes the implementation. Provide small, explained steps and inspect
their saved code when requested. Do not edit application code unless asked.

## Product requirement: planning and flexible macro tracking

Support both guided meal plans and eating freely within daily macro targets.
Users must not need a generated diet plan to track their intake.

Future food-entry options:

- Search for a food and enter the amount consumed.
- Scan a packaged food's barcode, retrieve its nutrition, and enter the amount
  consumed. The barcode identifies the product, not the amount eaten.
- Add a custom food manually when no suitable database product exists.
- Log a planned meal, adjusting ingredient quantities if necessary.

Show daily targets, consumed protein/carbohydrates/fat/energy, and remaining
amounts or excess. Generating a meal plan must not mark it as eaten: planned
meals and actual intake are separate.

## Architecture to preserve

- Use common food records and nutrition calculations across planning and logging.
- Allow multiple food sources: USDA, a future barcode provider, and user-created
  foods. A USDA ID must not be required for every food; retain source and external
  ID where applicable, and scope custom foods to their owner.
- Retain the nutrition basis (for example per 100 g, per 100 ml, or per serving)
  and quantity units. Do not treat millilitres as grams without a valid conversion.
- Calculate portions and totals in backend code from source nutrition values.
- Preserve missing nutrient values as unknown, rather than replacing them with zero.
- Food-diary entries should retain the consumed quantity, date, and nutrition
  snapshot used, so later food-record updates do not alter historical totals.
- Keep full USDA search available. Persistent caching was deliberately deferred
  while prototyping; it is not a prerequisite for testing the planner.

## Current checkpoint and deferred work

The user tested AI meal proposals, USDA searches and record selection, portion
calculations, and meal totals. Lookup retries are bounded; matching distinguishes
raw/cooked and rice grains/flour while allowing simple chopping descriptions.

Next agreed direction: full-day meal generation, daily nutrition totals, and
comparison against user targets.

Barcode scanning, custom-food entry, and food-diary UI are future work. Sodium
checks and broader quantity validation were explicitly deferred and should be
revisited before releasing generated plans to real users.
