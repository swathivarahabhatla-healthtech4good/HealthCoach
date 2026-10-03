/* Static reference data for the Health Coach.
 * Profile: vegetarian + eggs, overweight, hypothyroidism.
 * Focus: anti-inflammatory, protein- and fiber-forward, thyroid-aware.
 */

// ---------- Daily checklist definitions ----------
// Each item has a stable id (used as the storage key) — never rename ids,
// only labels, or past history will stop lining up.
const CHECKLIST_GROUPS = [
  {
    id: "thyroid",
    title: "Thyroid & morning",
    icon: "🌅",
    items: [
      { id: "med", label: "Thyroid medication on an empty stomach", hint: "Water only, same time daily" },
      { id: "medGap", label: "Waited 30–60 min before food / coffee", hint: "Keep calcium, iron & soy 4 h away from the pill" },
      { id: "brazilNut", label: "1–2 Brazil nuts (selenium)", hint: "No more than 2 a day" },
    ],
  },
  {
    id: "plate",
    title: "Anti-inflammatory plate",
    icon: "🥗",
    items: [
      { id: "protein", label: "Protein at every meal", hint: "Eggs, paneer, Greek yogurt, dal, chana, tofu (moderate)" },
      { id: "greens", label: "Leafy greens", hint: "Spinach, methi, kale, lettuce — cooked is fine" },
      { id: "colorVeg", label: "3+ colours of vegetables", hint: "Peppers, carrots, beets, tomato, purple cabbage" },
      { id: "berries", label: "Berries or a whole fruit", hint: "Berries, pomegranate, apple, guava, orange" },
      { id: "turmeric", label: "Turmeric + black pepper", hint: "In dal, sabzi, eggs or golden milk" },
      { id: "omega3", label: "Omega-3 seeds / walnuts", hint: "1 tbsp ground flax or chia, or a handful of walnuts" },
      { id: "gingerTea", label: "Ginger, green or herbal tea", hint: "Not with the thyroid pill" },
      { id: "fiber", label: "Whole grains / millets, not refined", hint: "Oats, millets, quinoa, brown rice, whole wheat" },
    ],
  },
  {
    id: "clean",
    title: "Kept it clean",
    icon: "🚫",
    items: [
      { id: "noSugar", label: "No added sugar / sweets", hint: "Fruit is fine" },
      { id: "noFried", label: "No fried or ultra-processed snacks", hint: "Chips, namkeen, pakoras, biscuits" },
      { id: "noSugaryDrinks", label: "No sugary drinks or juice", hint: "Soda, packaged juice, sweetened chai" },
      { id: "earlyDinner", label: "Dinner done 3 h before bed", hint: "" },
    ],
  },
  {
    id: "prep",
    title: "Meal prep & ready-to-eat",
    icon: "🍱",
    items: [
      { id: "prepTomorrow", label: "Tomorrow's lunch is prepped", hint: "Box it the night before" },
      { id: "boiledEggs", label: "Boiled eggs ready in the fridge", hint: "Keep 4–6 eggs; they last 5–7 days" },
      { id: "batchCook", label: "Batch base cooked (dal / chana / quinoa / millet)", hint: "Big prep on Friday & Sunday" },
      { id: "vegChopped", label: "Veg washed & chopped", hint: "Makes stir-fries a 10-minute job" },
      { id: "snackPacked", label: "Healthy snack packed for the day", hint: "Roasted chana, nuts, fruit, yogurt" },
      { id: "dailyPrep", label: "15-min prep for tomorrow done", hint: "See Plan → Prep for today's list" },
    ],
  },
];

const MOODS = [
  { v: 1, e: "😞", l: "Low" },
  { v: 2, e: "😕", l: "Meh" },
  { v: 3, e: "😐", l: "Okay" },
  { v: 4, e: "🙂", l: "Good" },
  { v: 5, e: "😄", l: "Great" },
];

const WORKOUT_TYPES = ["Walk", "Strength", "Yoga", "Cardio", "HIIT", "Cycling", "Swim", "Dance", "Stretch", "Other"];

const MEALS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snacks", label: "Snacks" },
  { id: "dinner", label: "Dinner" },
];

const DEFAULT_SETTINGS = {
  waterGoal: 10,       // glasses
  glassMl: 250,
  workoutGoal: 30,     // minutes
  stepsGoal: 8000,
  sleepGoal: 7.5,      // hours
};

// ---------- Food reference ----------
// tags: ai = anti-inflammatory, protein, fiber, thyroid = supports thyroid (selenium/zinc/iodine),
//       lowcal, ready = ready-to-eat / no cooking, prep = good for batch meal prep, egg, quick
const FOOD_CATEGORIES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "meal", label: "Lunch & dinner" },
  { id: "snack", label: "Snacks" },
  { id: "drink", label: "Drinks" },
  { id: "ready", label: "Ready-to-eat" },
  { id: "staple", label: "Pantry staples" },
];

const TAG_LABELS = {
  ai: "Anti-inflammatory",
  protein: "High protein",
  fiber: "High fiber",
  thyroid: "Thyroid-friendly",
  lowcal: "Low calorie",
  ready: "No cooking",
  prep: "Meal-prep friendly",
  egg: "Egg",
  quick: "≤ 15 min",
};

const FOODS = [
  // Breakfast
  { name: "Veggie egg bhurji", cat: "breakfast", tags: ["protein", "ai", "egg", "quick", "thyroid"], serving: "2 eggs + 1 cup veg", why: "Eggs bring protein, iodine and selenium; add spinach, tomato, turmeric." },
  { name: "Spinach & mushroom omelette", cat: "breakfast", tags: ["protein", "egg", "quick", "lowcal", "thyroid"], serving: "2 eggs", why: "Very filling for few calories. Mushrooms add selenium." },
  { name: "Overnight oats with chia & berries", cat: "breakfast", tags: ["fiber", "ai", "prep", "ready"], serving: "½ cup oats + 1 tbsp chia", why: "Make 3 jars on Sunday. Use Greek yogurt or milk for protein." },
  { name: "Moong dal chilla", cat: "breakfast", tags: ["protein", "fiber", "prep"], serving: "2 chillas", why: "Soak dal overnight; batter keeps 2 days in the fridge." },
  { name: "Besan chilla with veggies", cat: "breakfast", tags: ["protein", "fiber", "quick"], serving: "2 chillas", why: "Chickpea flour is high in protein and fiber." },
  { name: "Vegetable millet upma", cat: "breakfast", tags: ["fiber", "ai"], serving: "1 cup", why: "Foxtail or little millet instead of rava (semolina)." },
  { name: "Greek yogurt parfait", cat: "breakfast", tags: ["protein", "ai", "ready", "quick"], serving: "¾ cup yogurt + berries + seeds", why: "High protein; add ground flax. Not within 4 h of the thyroid pill (calcium)." },
  { name: "Egg muffins (baked)", cat: "breakfast", tags: ["protein", "egg", "prep", "thyroid"], serving: "2–3 muffins", why: "Bake 12 with veg on Sunday; reheat in a minute." },
  { name: "Ragi dosa / ragi porridge", cat: "breakfast", tags: ["fiber", "ai"], serving: "2 dosas or 1 bowl", why: "Finger millet is rich in fiber and minerals." },
  { name: "Paneer & veg sandwich on whole grain", cat: "breakfast", tags: ["protein", "quick"], serving: "1 sandwich", why: "Use 50–75 g paneer and plenty of veg." },

  // Lunch & dinner
  { name: "Dal + sabzi + millet roti", cat: "meal", tags: ["protein", "fiber", "ai", "prep"], serving: "1 cup dal, 1 cup sabzi, 1–2 roti", why: "Classic balanced plate; tadka with turmeric, cumin, ginger." },
  { name: "Rajma / chole bowl with brown rice", cat: "meal", tags: ["protein", "fiber", "prep"], serving: "1 cup beans + ½ cup rice", why: "Batch-cook beans; freezes well. Keep rice to ½ cup." },
  { name: "Quinoa chickpea salad", cat: "meal", tags: ["protein", "fiber", "ai", "prep", "ready"], serving: "1½ cups", why: "Lemon-olive oil dressing; keeps 3–4 days." },
  { name: "Palak paneer (light)", cat: "meal", tags: ["protein", "ai", "thyroid"], serving: "1 cup", why: "Use less cream; spinach is anti-inflammatory." },
  { name: "Egg curry with lots of veg", cat: "meal", tags: ["protein", "egg", "thyroid", "ai"], serving: "2 eggs", why: "Tomato-onion-turmeric base; pair with millet roti." },
  { name: "Vegetable khichdi (moong + millet)", cat: "meal", tags: ["protein", "fiber", "ai", "prep"], serving: "1½ cups", why: "Easy on digestion; add lots of vegetables." },
  { name: "Lentil soup (masoor)", cat: "meal", tags: ["protein", "fiber", "lowcal", "prep", "ai"], serving: "1½ cups", why: "Freezes well — portion into jars." },
  { name: "Stir-fried veg with paneer / tofu", cat: "meal", tags: ["protein", "quick", "ai"], serving: "100 g paneer or tofu", why: "Ginger-garlic base. Keep soy to a few times a week, 4 h from the pill." },
  { name: "Buddha bowl", cat: "meal", tags: ["protein", "fiber", "ai", "prep"], serving: "1 bowl", why: "Grain + beans + roasted veg + greens + tahini or yogurt dressing." },
  { name: "Sambar with vegetables", cat: "meal", tags: ["protein", "fiber", "ai", "prep"], serving: "1½ cups", why: "Toor dal + drumstick, pumpkin, okra." },
  { name: "Shakshuka", cat: "meal", tags: ["protein", "egg", "ai", "thyroid"], serving: "2 eggs", why: "Eggs in spiced tomato-pepper sauce. One pan." },

  // Snacks
  { name: "Boiled eggs", cat: "snack", tags: ["protein", "egg", "ready", "thyroid", "prep"], serving: "1–2 eggs", why: "~70 kcal each, very filling." },
  { name: "Roasted chana", cat: "snack", tags: ["protein", "fiber", "ready"], serving: "¼ cup (30 g)", why: "Crunchy swap for namkeen." },
  { name: "Pumpkin seeds", cat: "snack", tags: ["thyroid", "ai", "ready"], serving: "1 tbsp (10 g)", why: "Zinc supports thyroid hormone production." },
  { name: "Walnuts or almonds", cat: "snack", tags: ["ai", "ready"], serving: "8–10 pieces", why: "Omega-3s (walnut). Measure — easy to overeat." },
  { name: "Brazil nuts", cat: "snack", tags: ["thyroid", "ready"], serving: "1–2 nuts only", why: "Very high in selenium; more than 2 a day can be too much." },
  { name: "Hummus with veg sticks", cat: "snack", tags: ["protein", "fiber", "ai", "ready", "prep"], serving: "3 tbsp + 1 cup veg", why: "Carrot, cucumber, peppers." },
  { name: "Sprouts chaat", cat: "snack", tags: ["protein", "fiber", "lowcal", "prep"], serving: "1 cup", why: "Moong sprouts, onion, tomato, lemon, chaat masala." },
  { name: "Greek yogurt with cinnamon", cat: "snack", tags: ["protein", "quick", "ready"], serving: "½ cup", why: "Cinnamon helps with sweet cravings." },
  { name: "Apple with peanut butter", cat: "snack", tags: ["fiber", "quick", "ready"], serving: "1 apple + 1 tbsp PB", why: "Pick unsweetened peanut butter." },
  { name: "Makhana (roasted fox nuts)", cat: "snack", tags: ["lowcal", "ready"], serving: "1 cup", why: "Dry roast with a little ghee, turmeric and pepper." },
  { name: "Cottage cheese / paneer cubes", cat: "snack", tags: ["protein", "ready"], serving: "50 g", why: "Sprinkle black pepper and chaat masala." },
  { name: "Berries or pomegranate", cat: "snack", tags: ["ai", "lowcal", "ready"], serving: "1 cup", why: "Rich in antioxidants." },
  { name: "Cucumber raita", cat: "snack", tags: ["protein", "lowcal", "quick"], serving: "¾ cup", why: "Cooling, hydrating, probiotic." },

  // Drinks
  { name: "Water (plain or infused)", cat: "drink", tags: ["lowcal", "ready"], serving: "8–10 glasses/day", why: "Add cucumber, lemon, mint. Aim for pale yellow urine." },
  { name: "Golden milk (turmeric latte)", cat: "drink", tags: ["ai"], serving: "1 cup", why: "Turmeric + pepper + ginger; unsweetened milk. Evening, away from the pill." },
  { name: "Green tea", cat: "drink", tags: ["ai", "lowcal"], serving: "2–3 cups", why: "Catechins are anti-inflammatory. Not with the pill." },
  { name: "Ginger-lemon tea", cat: "drink", tags: ["ai", "lowcal"], serving: "1–2 cups", why: "Helps digestion; no sugar." },
  { name: "Chaas (spiced buttermilk)", cat: "drink", tags: ["lowcal", "protein"], serving: "1 glass", why: "Probiotic, cooling, low calorie." },
  { name: "Jeera / ajwain water", cat: "drink", tags: ["lowcal"], serving: "1 glass", why: "Good after meals for bloating." },
  { name: "Coconut water", cat: "drink", tags: ["lowcal"], serving: "1 glass", why: "After a workout; it has natural sugar, so one glass." },
  { name: "Protein smoothie (no added sugar)", cat: "drink", tags: ["protein", "ai", "quick"], serving: "1 glass", why: "Yogurt + berries + spinach + flax. Counts as a meal or snack." },
  { name: "Black coffee", cat: "drink", tags: ["lowcal"], serving: "1–2 cups", why: "Wait at least 30–60 min after the thyroid pill." },

  // Ready-to-eat / store-bought
  { name: "Plain Greek yogurt (cups)", cat: "ready", tags: ["protein", "ready"], serving: "1 cup", why: "Choose unsweetened; check protein is 8 g+ per 100 g." },
  { name: "Pre-boiled / packaged eggs", cat: "ready", tags: ["protein", "egg", "ready", "thyroid"], serving: "2 eggs", why: "Shelf-ready protein for busy days." },
  { name: "Microwave quinoa / brown rice pouches", cat: "ready", tags: ["fiber", "ready", "quick"], serving: "½ pouch", why: "Base for a 5-minute bowl." },
  { name: "Canned chickpeas / beans (rinsed)", cat: "ready", tags: ["protein", "fiber", "ready"], serving: "½–1 cup", why: "Rinse to cut sodium; toss into salads." },
  { name: "Ready hummus", cat: "ready", tags: ["protein", "fiber", "ready"], serving: "3 tbsp", why: "Look for olive oil, no preservatives." },
  { name: "Pre-washed salad greens", cat: "ready", tags: ["ai", "lowcal", "ready"], serving: "2 cups", why: "Removes the friction from 'eat greens'." },
  { name: "Frozen mixed vegetables", cat: "ready", tags: ["ai", "fiber", "ready", "quick"], serving: "1 cup", why: "As nutritious as fresh; stir-fry in 7 minutes." },
  { name: "Frozen berries", cat: "ready", tags: ["ai", "ready"], serving: "1 cup", why: "Cheaper than fresh; great in oats and smoothies." },
  { name: "Roasted unsalted nuts & seeds mix", cat: "ready", tags: ["ai", "thyroid", "ready"], serving: "30 g", why: "Pre-portion into small boxes." },
  { name: "Low-sugar protein bar", cat: "ready", tags: ["protein", "ready"], serving: "1 bar", why: "Emergency only: < 5 g sugar, 10 g+ protein." },
  { name: "Tofu (firm, pre-pressed)", cat: "ready", tags: ["protein", "ready"], serving: "100 g", why: "Soy: a few times a week, 4 h away from the thyroid pill." },

  // Pantry staples
  { name: "Turmeric + black pepper", cat: "staple", tags: ["ai"], serving: "½–1 tsp/day", why: "Pepper greatly boosts curcumin absorption." },
  { name: "Ground flaxseed", cat: "staple", tags: ["ai", "fiber"], serving: "1 tbsp/day", why: "Plant omega-3. Grind fresh; store in the fridge." },
  { name: "Chia seeds", cat: "staple", tags: ["ai", "fiber"], serving: "1 tbsp/day", why: "Omega-3 + fiber; soak before eating." },
  { name: "Extra-virgin olive oil", cat: "staple", tags: ["ai"], serving: "1–2 tbsp/day", why: "For salads and low-heat cooking." },
  { name: "Iodized salt", cat: "staple", tags: ["thyroid"], serving: "In cooking, moderately", why: "Main iodine source for vegetarians — don't switch fully to rock/pink salt." },
  { name: "Millets (ragi, jowar, bajra, foxtail)", cat: "staple", tags: ["fiber", "ai", "prep"], serving: "½ cup cooked", why: "Lower glycemic swap for white rice." },
  { name: "Ginger & garlic", cat: "staple", tags: ["ai"], serving: "Daily in cooking", why: "Natural anti-inflammatories." },
  { name: "Cinnamon", cat: "staple", tags: ["ai"], serving: "½ tsp", why: "Helps blood sugar; sprinkle on oats and yogurt." },
];

// Foods to limit or time carefully — with the reason why.
const LIMIT_FOODS = [
  { name: "Soy (tofu, soy milk, soy chunks)", level: "time", why: "Can reduce absorption of thyroid medication. Fine a few times a week — keep 4 h from the pill." },
  { name: "Calcium & iron (supplements, dairy)", level: "time", why: "Block levothyroxine absorption. Take 4 h apart from the pill." },
  { name: "Coffee & tea", level: "time", why: "Wait 30–60 min after the pill." },
  { name: "High-fiber meal right after the pill", level: "time", why: "Fiber can bind the medication — wait 30–60 min, then eat normally." },
  { name: "Raw cruciferous veg in large amounts", level: "moderate", why: "Cabbage, cauliflower, broccoli, kale: cooking them makes them fine. Normal portions are OK." },
  { name: "Millet in very large daily amounts", level: "moderate", why: "Some millets (esp. pearl millet) are mildly goitrogenic; rotate grains rather than eating one every meal." },
  { name: "Refined sugar & sweets", level: "avoid", why: "Drives inflammation and weight gain." },
  { name: "Fried snacks (samosa, pakora, chips, namkeen)", level: "avoid", why: "Inflammatory oils and calorie dense." },
  { name: "Maida (white flour) — naan, white bread, biscuits", level: "avoid", why: "Spikes blood sugar; low fiber." },
  { name: "Sugary drinks & packaged juice", level: "avoid", why: "Liquid sugar with no fullness." },
  { name: "Ultra-processed foods", level: "avoid", why: "Instant noodles, ready meals with long ingredient lists." },
  { name: "Excess alcohol", level: "avoid", why: "Empty calories; stresses the liver which converts thyroid hormone." },
  { name: "Gluten (optional trial)", level: "moderate", why: "Some people with Hashimoto's feel better reducing gluten. Talk to your doctor before cutting it out." },
];


// ---------- Workout routines ----------
// Low-impact, beginner-friendly and fatigue-aware: steady daily movement plus
// 2× strength a week. `type` must match an entry in WORKOUT_TYPES.
const WORKOUTS = [
  {
    id: "strengthLower", title: "Strength A — legs & glutes", type: "Strength", minutes: 30, intensity: "Moderate",
    items: [
      { name: "Warm-up march + arm circles", detail: "3 min" },
      { name: "Chair squats", detail: "3 × 10–12" },
      { name: "Glute bridges", detail: "3 × 12" },
      { name: "Reverse lunges (hold a chair)", detail: "2 × 8 each leg" },
      { name: "Calf raises", detail: "2 × 15" },
      { name: "Side-lying leg lifts", detail: "2 × 12 each side" },
      { name: "Stretch: hamstrings, quads, hips", detail: "5 min" },
    ],
    note: "Rest 45–60 s between sets. Stop 2 reps before failure.",
  },
  {
    id: "walkStretch", title: "Brisk walk + stretch", type: "Walk", minutes: 35, intensity: "Easy–moderate",
    items: [
      { name: "Easy walk", detail: "5 min" },
      { name: "Brisk walk (can talk, can't sing)", detail: "25 min" },
      { name: "Cool-down stretch", detail: "5 min" },
    ],
    note: "Try a 10-min walk after lunch or dinner too — great for blood sugar.",
  },
  {
    id: "yogaFlow", title: "Gentle yoga flow", type: "Yoga", minutes: 25, intensity: "Easy",
    items: [
      { name: "Deep breathing (anulom vilom)", detail: "3 min" },
      { name: "Cat–cow", detail: "10 rounds" },
      { name: "Sun salutations (slow)", detail: "4 rounds" },
      { name: "Cobra (bhujangasana)", detail: "3 × 20 s" },
      { name: "Bridge pose (setu bandhasana)", detail: "3 × 20 s" },
      { name: "Fish pose (matsyasana), supported", detail: "2 × 20 s" },
      { name: "Legs up the wall", detail: "3 min" },
      { name: "Shavasana", detail: "3 min" },
    ],
    note: "Skip any neck-loading pose if it feels uncomfortable.",
  },
  {
    id: "strengthUpper", title: "Strength B — upper body & core", type: "Strength", minutes: 30, intensity: "Moderate",
    items: [
      { name: "Warm-up: arm swings, torso twists", detail: "3 min" },
      { name: "Wall or incline push-ups", detail: "3 × 8–12" },
      { name: "Band or water-bottle rows", detail: "3 × 12" },
      { name: "Overhead press (light weights)", detail: "2 × 10" },
      { name: "Dead bug", detail: "3 × 8 each side" },
      { name: "Forearm plank (knees ok)", detail: "3 × 20–30 s" },
      { name: "Stretch: chest, shoulders, back", detail: "5 min" },
    ],
    note: "Bottles or a backpack with books work as weights.",
  },
  {
    id: "walkIntervals", title: "Walking intervals", type: "Cardio", minutes: 30, intensity: "Moderate",
    items: [
      { name: "Easy walk warm-up", detail: "5 min" },
      { name: "6 rounds: 1 min fast + 2 min easy", detail: "18 min" },
      { name: "Easy walk cool-down", detail: "5 min" },
      { name: "Stretch", detail: "2 min" },
    ],
    note: "Fast = breathing hard but in control. Stairs or a slope add challenge.",
  },
  {
    id: "longActive", title: "Long fun session", type: "Walk", minutes: 45, intensity: "Easy–moderate",
    items: [
      { name: "Long walk, cycle, swim or dance", detail: "40 min" },
      { name: "Stretch", detail: "5 min" },
    ],
    note: "Pick what you enjoy — consistency beats intensity.",
  },
  {
    id: "restMobility", title: "Rest + mobility", type: "Stretch", minutes: 15, intensity: "Very easy",
    items: [
      { name: "Neck & shoulder rolls", detail: "2 min" },
      { name: "Hip circles + cat–cow", detail: "3 min" },
      { name: "Child's pose + gentle twists", detail: "5 min" },
      { name: "Relaxed stroll (optional)", detail: "5 min+" },
    ],
    note: "Recovery day. Low energy? This is the whole workout — and that's fine.",
  },
];

// ---------- Meal prep ----------
// Big batch-prep days (0 = Sunday … 6 = Saturday). Each session covers its own
// day through the day before the next session: Sun → Sun–Thu, Fri → Fri–Sat.
const PREP_DAYS = [0, 5];
const DAILY_PREP_MINUTES = 15;

// Batch tasks for a big prep session, triggered when a planned meal in the
// covered days matches `match`. `soak` adds a 5-min soak task the night before.
const PREP_RULES = [
  { id: "pulses", match: /rajma|chole|chickpea|chana|hummus/i, task: "Pressure-cook chickpeas / rajma", mins: 30, soak: "Soak chickpeas / rajma tonight for tomorrow's big prep", detail: "Cook a big batch; portion into boxes or freeze" },
  { id: "dal", match: /dal|lentil|khichdi|sambar|masoor/i, task: "Cook a pot of dal / lentil soup", mins: 30, detail: "Portions keep 3–4 days; freeze the rest" },
  { id: "grains", match: /quinoa|millet|upma|rice|ragi|bowl|khichdi|roti/i, task: "Cook a batch of quinoa / millet", mins: 20, detail: "Cool fast, refrigerate up to 4 days" },
  { id: "eggs", match: /egg|bhurji|omelette|shakshuka/i, task: "Boil eggs for the fridge", mins: 15, detail: "Keep 6 peeled eggs ready; 5–7 days in the fridge" },
  { id: "muffins", match: /muffin/i, task: "Bake egg muffins", mins: 30, detail: "12 muffins = 6 breakfasts" },
  { id: "veg", match: /veg|sabzi|salad|bowl|stir|palak|spinach|curry|soup|hummus|shakshuka|upma/i, task: "Wash & chop vegetables", mins: 20, detail: "Store in boxes lined with paper towel" },
  { id: "paneer", match: /paneer|tofu/i, task: "Cube paneer / press tofu", mins: 5, detail: "Keeps 3 days in water in the fridge" },
  { id: "dressing", match: /salad|bowl|quinoa/i, task: "Shake up a jar of dressing", mins: 5, detail: "Lemon + olive oil + cumin; 1 week" },
  { id: "snacks", match: /makhana|nuts|seeds|roasted chana|walnut|almond|pumpkin/i, task: "Portion snack boxes", mins: 10, detail: "One small box per day — no eating from the bag" },
];

// Key pantry ingredients for the Thursday stock check, matched against the
// planned meals. `note` is shown next to the item (e.g. soak timing).
const PANTRY_DAY = 4; // Thursday
const KEY_INGREDIENTS = [
  { name: "Chickpeas (kabuli chana)", match: /chole|chickpea|hummus/i, note: "dry: soak the night before" },
  { name: "Rajma", match: /rajma/i, note: "dry: soak the night before" },
  { name: "Moong dal", match: /moong|chilla|khichdi/i, note: "" },
  { name: "Whole moong (for sprouts)", match: /sprouts/i, note: "start 2 days ahead" },
  { name: "Masoor dal", match: /masoor|lentil/i, note: "" },
  { name: "Toor dal", match: /sambar|dal \+ sabzi/i, note: "" },
  { name: "Besan", match: /besan/i, note: "" },
  { name: "Roasted chana", match: /roasted chana/i, note: "" },
  { name: "Quinoa", match: /quinoa|buddha/i, note: "" },
  { name: "Millets (foxtail / little / jowar)", match: /millet|upma|khichdi/i, note: "" },
  { name: "Ragi flour", match: /ragi/i, note: "" },
  { name: "Brown rice", match: /rice/i, note: "" },
  { name: "Rolled oats", match: /oats/i, note: "" },
  { name: "Chia / ground flax", match: /oats|chia|parfait|smoothie/i, note: "" },
  { name: "Eggs", match: /egg|bhurji|omelette|shakshuka|muffin/i, note: "" },
  { name: "Paneer", match: /paneer/i, note: "" },
  { name: "Tofu", match: /tofu/i, note: "" },
  { name: "Greek yogurt / curd", match: /yogurt|parfait|raita|chaas|oats|smoothie/i, note: "" },
  { name: "Spinach / leafy greens", match: /spinach|palak|bhurji|omelette|soup|bowl|muffin/i, note: "" },
  { name: "Tahini", match: /hummus|buddha/i, note: "" },
  { name: "Makhana", match: /makhana/i, note: "" },
  { name: "Mixed nuts & seeds", match: /nuts|walnut|almond|pumpkin|seeds/i, note: "" },
  { name: "Berries (fresh or frozen)", match: /berr|parfait|smoothie/i, note: "" },
  { name: "Whole-grain bread / millet atta", match: /sandwich|roti/i, note: "" },
  { name: "Peanut butter (unsweetened)", match: /peanut/i, note: "" },
];

// 15-minute daily prep: small jobs done today for TOMORROW's planned meals.
const DAILY_PREP_RULES = [
  { id: "chilla", match: /chilla/i, task: "Soak moong dal for tomorrow's chilla", mins: 3, detail: "Grind in the morning; batter keeps 2 days" },
  { id: "oats", match: /oats/i, task: "Set a jar of overnight oats", mins: 5, detail: "Oats + chia + flax + milk/yogurt" },
  { id: "sprouts", match: /sprouts/i, task: "Soak / rinse moong for sprouts", mins: 2, detail: "Soak 8 h, drain, keep covered; ready in 1–2 days" },
  { id: "chop", match: /veg|sabzi|salad|bowl|stir|curry|shakshuka|upma|khichdi|chaat/i, task: "Chop veg for tomorrow's meals", mins: 6, detail: "Top up the batch-chopped veg" },
  { id: "thaw", match: /rajma|chole|dal|soup|sambar/i, task: "Move tomorrow's dal / beans to the fridge to thaw", mins: 1, detail: "If you froze portions" },
  { id: "pack", match: /.*/, task: "Portion tomorrow's lunch & snack", mins: 3, detail: "Boxes ready = no impulse eating" },
];

// Default routine per weekday (0 = Sunday).
const WEEKLY_WORKOUT = ["restMobility", "strengthLower", "walkStretch", "yogaFlow", "strengthUpper", "walkIntervals", "longActive"];

// Always-on shopping list for this profile.
const WEEKLY_STAPLES = [
  "Eggs (12–18)",
  "Plain Greek yogurt / curd",
  "Spinach or other leafy greens",
  "Mixed vegetables (peppers, carrots, tomato, cucumber, onion)",
  "Berries (fresh or frozen) + 1 other fruit",
  "Lemons, ginger, garlic",
  "Paneer (200 g)",
  "Ground flax / chia, walnuts, pumpkin seeds",
  "Brazil nuts (small pack)",
  "Green tea / herbal tea",
];
