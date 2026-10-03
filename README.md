# Health Coach

A personal, mobile-friendly health coach for a vegetarian (eats eggs) with hypothyroidism working on weight loss, built around anti-inflammatory eating.

**Tabs**
1. **Today** — meals and workout first (each shows today's plan with a one-tap "ate this" / "log it"), then the daily checklist: thyroid-pill timing, water, mood/energy/sleep, workout, meals (with ready-to-eat ideas), anti-inflammatory plate, "kept it clean", meal-prep tasks, weight and notes.
2. **Trends** — 7/30/90-day stats, charts (score, water, workout, plate, mood, energy, sleep, weight), habit consistency, 12-week heatmap, data table, goals and backup.
3. **Plan & food** — **Plan**: today's meals (swap / pick / see recipe / mark eaten) and today's workout (a weekly rotation of low-impact routines with exercise checkboxes). **Foods**: searchable foods/snacks/drinks/ready-to-eat list with tags and favourites, recipes (starter set + favourite sites), and foods to limit or time around the thyroid pill.

## Run
No build step. Open `index.html` in a browser, or serve the folder (e.g. `python3 -m http.server`) and add it to your phone's home screen. You can also host it on GitHub Pages.

Data is stored in your browser only (`localStorage`). Use **Trends → Goals & backup → Export** to keep a backup.

## Editing content
- Checklist items, foods, limits and tips: `js/data.js`
- Recipes and recipe sources: `js/recipes.js`
- Workout routines and weekly rotation: `WORKOUTS` / `WEEKLY_WORKOUT` in `js/data.js`

*General guidance, not medical advice.*
