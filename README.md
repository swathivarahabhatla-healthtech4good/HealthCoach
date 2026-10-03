# Health Coach

A personal, mobile-friendly health coach for a vegetarian (eats eggs) with hypothyroidism working on weight loss, built around anti-inflammatory eating.

**Tabs**
1. **Today** — meals and workout first (each shows today's plan with a one-tap "ate this" / "log it"), then the daily checklist: thyroid-pill timing, water, mood/energy/sleep, workout, meals (with ready-to-eat ideas), anti-inflammatory plate, "kept it clean", meal-prep tasks, weight and notes.
2. **Trends** — 7/30/90-day stats, charts (score, water, workout, plate, mood, energy, sleep, weight), habit consistency, 12-week heatmap, data table, goals and backup.
3. **Plan & food** — **Plan** → *Today*: today's meals (swap / pick / see recipe / mark eaten) and today's workout (a weekly rotation of low-impact routines with exercise checkboxes); *Week*: Mon–Sun meals + workouts, swap any slot; *Prep & shop*: big batch prep on **Friday & Sunday**, a **15-min daily prep** list for tomorrow's meals, a pantry check and a shopping list — all generated from the plan).  **Foods**: searchable foods/snacks/drinks/ready-to-eat list with tags and favourites, recipes (starter set + favourite sites), and foods to limit or time around the thyroid pill.

**Thursday pantry check** — every Thursday the Today tab shows the key ingredients (chickpeas, rajma, dals, millets, paneer, eggs…) needed for the coming Friday/Sunday prep. Tick what you have; copy the rest as a to-buy list.

## Run
**On claude.ai (recommended):** the app is published as a private artifact at https://claude.ai/artifact/WJigqkJXKkyDrCet3Tpj6h. Data syncs to your private space in the artifact's database, so it follows you across phone and laptop. To republish after changes, run `python3 tools/build-artifact.py` and publish `dist/health-coach.html` to the same artifact.

**Locally:** No build step. Open `index.html` in a browser, or serve the folder (e.g. `python3 -m http.server`) and add it to your phone's home screen. You can also host it on GitHub Pages.

Opened locally, data is stored in your browser only (`localStorage`). Use **Trends → Goals & backup → Export** to keep a backup.

## Editing content
- Checklist items, foods, limits and tips: `js/data.js`
- Recipes and recipe sources: `js/recipes.js`
- Prep days, daily prep budget, prep rules and pantry items: `PREP_DAYS`, `DAILY_PREP_MINUTES`, `PREP_RULES`, `DAILY_PREP_RULES`, `KEY_INGREDIENTS` in `js/data.js`
- Workout routines and weekly rotation: `WORKOUTS` / `WEEKLY_WORKOUT` in `js/data.js`

*General guidance, not medical advice.*
