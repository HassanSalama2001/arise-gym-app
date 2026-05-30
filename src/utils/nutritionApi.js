import db from '../db/db';

const fallbackSuggestions = [
  {
    id: 101,
    name: "Protein Oatmeal",
    mealType: "breakfast",
    calories: 350,
    protein: 28,
    carbs: 45,
    fat: 6,
    recipe: "Combine 1/2 cup oats and 1 cup water or milk in a bowl. Microwave for 2 minutes. Stir in 1 scoop of whey protein powder until smooth. Top with chia seeds and fresh berries before serving.",
    ingredients: ["1/2 cup rolled oats", "1 scoop whey protein powder", "1 cup water or almond milk", "1 tbsp chia seeds", "Handful of fresh berries"],
    isFromApi: 0
  },
  {
    id: 102,
    name: "Avocado Toast with Eggs",
    mealType: "breakfast",
    calories: 420,
    protein: 18,
    carbs: 32,
    fat: 24,
    recipe: "Toast the whole wheat bread. Mash the avocado with salt and red pepper flakes, then spread it evenly on the toast. Poach or soft-boil the eggs and place them on top of the avocado bed.",
    ingredients: ["2 slices whole wheat bread", "1/2 ripe avocado", "2 large eggs", "Pinch of salt and red pepper flakes"],
    isFromApi: 0
  },
  {
    id: 103,
    name: "Greek Yogurt Parfait",
    mealType: "breakfast",
    calories: 280,
    protein: 20,
    carbs: 38,
    fat: 5,
    recipe: "Layer the Greek yogurt in a glass or bowl. Alternate layers with honey, raw walnuts, and sliced bananas. Serve chilled.",
    ingredients: ["1 cup non-fat Greek yogurt", "1 tbsp honey", "1/4 cup walnuts", "1 medium banana, sliced"],
    isFromApi: 0
  },
  {
    id: 104,
    name: "Grilled Chicken Salad",
    mealType: "lunch",
    calories: 480,
    protein: 42,
    carbs: 18,
    fat: 22,
    recipe: "Sauté or grill the chicken breast until cooked through, then slice it. Combine mixed baby greens, cherry tomatoes, and cucumber in a large bowl. Top with the chicken slices and drizzle vinaigrette.",
    ingredients: ["150g chicken breast", "2 cups mixed baby greens", "1/2 cup cherry tomatoes", "1/2 cucumber, sliced", "1 tbsp olive oil vinaigrette"],
    isFromApi: 0
  },
  {
    id: 105,
    name: "Quinoa and Black Bean Bowl",
    mealType: "lunch",
    calories: 510,
    protein: 16,
    carbs: 78,
    fat: 14,
    recipe: "Cook the quinoa according to package instructions. Warm the black beans and sweet corn. Combine all ingredients in a bowl, top with diced avocado, fresh cilantro, and squeeze with lime juice.",
    ingredients: ["1/2 cup quinoa (dry)", "1/2 cup canned black beans", "1/2 cup sweet corn", "1/2 avocado, diced", "Fresh cilantro and lime juice"],
    isFromApi: 0
  },
  {
    id: 106,
    name: "Tuna Lettuce Wraps",
    mealType: "lunch",
    calories: 320,
    protein: 34,
    carbs: 12,
    fat: 12,
    recipe: "Drain the canned tuna and mix it with Greek yogurt, mustard, and diced celery in a bowl. Spoon the mixture onto romaine lettuce leaves and roll them up into wraps.",
    ingredients: ["1 can tuna in water", "2 tbsp Greek yogurt", "1 tsp Dijon mustard", "1 stalk celery, diced", "4 large romaine lettuce leaves"],
    isFromApi: 0
  },
  {
    id: 107,
    name: "Baked Salmon & Broccoli",
    mealType: "dinner",
    calories: 550,
    protein: 44,
    carbs: 42,
    fat: 21,
    recipe: "Preheat oven to 400°F (200°C). Season salmon with lemon, garlic, and olive oil, then bake for 12-15 minutes. Serve next to cooked brown rice and steamed broccoli florets.",
    ingredients: ["150g salmon fillet", "1 cup broccoli florets", "1/2 cup brown rice (cooked)", "1 tsp olive oil", "Lemon and garlic to taste"],
    isFromApi: 0
  },
  {
    id: 108,
    name: "Tofu Veg Stir Fry",
    mealType: "dinner",
    calories: 410,
    protein: 18,
    carbs: 48,
    fat: 15,
    recipe: "Press tofu to remove excess moisture and cube it. Sauté the tofu in sesame oil until golden. Toss in mixed vegetables and sauté for 5 minutes. Stir in soy sauce, ginger, and garlic.",
    ingredients: ["150g firm tofu, cubed", "1 cup mixed broccoli, bell peppers, and snow peas", "1 tbsp soy sauce", "1 tsp sesame oil", "Fresh ginger and garlic"],
    isFromApi: 0
  },
  {
    id: 109,
    name: "Lean Turkey Cauliflower Rice",
    mealType: "dinner",
    calories: 490,
    protein: 38,
    carbs: 24,
    fat: 26,
    recipe: "Brown the ground turkey in a pan with diced onions and bell peppers. Add the cauliflower rice and spices, and cook for 6-8 minutes until tender.",
    ingredients: ["150g lean ground turkey", "1.5 cups cauliflower rice", "1/2 bell pepper, diced", "1/4 onion, diced", "Sauté spices"],
    isFromApi: 0
  },
  {
    id: 110,
    name: "Mixed Nuts & Apple",
    mealType: "snack",
    calories: 220,
    protein: 5,
    carbs: 25,
    fat: 12,
    recipe: "Rinse and slice the fresh apple. Serve immediately alongside a handful of raw almonds and walnuts.",
    ingredients: ["15g almonds", "15g walnuts", "1 medium crisp apple"],
    isFromApi: 0
  },
  {
    id: 111,
    name: "Rice Cakes with Peanut Butter",
    mealType: "snack",
    calories: 190,
    protein: 6,
    carbs: 22,
    fat: 9,
    recipe: "Spread natural peanut butter evenly on the rice cakes, then sprinkle chia seeds on top for crunch.",
    ingredients: ["2 brown rice cakes", "1.5 tbsp natural peanut butter", "1 tsp chia seeds"],
    isFromApi: 0
  },
  {
    id: 112,
    name: "Cottage Cheese & Pineapple",
    mealType: "snack",
    calories: 150,
    protein: 14,
    carbs: 18,
    fat: 2,
    recipe: "Spoon cottage cheese into a bowl and top with fresh diced pineapple chunks or pineapple slices.",
    ingredients: ["1/2 cup low-fat cottage cheese", "1/2 cup fresh pineapple chunks"],
    isFromApi: 0
  }
];

// Helper to seed fallbacks if empty
export async function seedFallbackSuggestions() {
  const count = await db.mealSuggestions.count();
  let needsReset = false;
  if (count > 0) {
    const first = await db.mealSuggestions.limit(1).toArray();
    if (first.length > 0 && (first[0].protein === undefined || first[0].protein === null)) {
      needsReset = true;
    }
  }
  if (count === 0 || needsReset) {
    if (needsReset) {
      await db.mealSuggestions.clear();
    }
    await db.mealSuggestions.bulkPut(fallbackSuggestions);
  }
}

// Fetch details for a specific meal ID from TheMealDB
async function fetchMealDetails(mealId, mealType) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const data = await res.json();
    if (data && data.meals && data.meals.length > 0) {
      const meal = data.meals[0];
      const instructions = meal.strInstructions || '';
      
      // Approximate calories based on type
      const calMap = { breakfast: 350, lunch: 480, dinner: 550, snack: 200 };
      const calories = calMap[mealType] + Math.floor(Math.random() * 100) - 50;

      // Approximate macro breakdown based on type and calories
      let protein, carbs, fat;
      if (mealType === 'breakfast') {
        protein = Math.round((calories * 0.25) / 4);
        fat = Math.round((calories * 0.25) / 9);
        carbs = Math.round((calories * 0.50) / 4);
      } else if (mealType === 'lunch') {
        protein = Math.round((calories * 0.35) / 4);
        fat = Math.round((calories * 0.20) / 9);
        carbs = Math.round((calories * 0.45) / 4);
      } else if (mealType === 'dinner') {
        protein = Math.round((calories * 0.40) / 4);
        fat = Math.round((calories * 0.25) / 9);
        carbs = Math.round((calories * 0.35) / 4);
      } else { // snack
        protein = Math.round((calories * 0.20) / 4);
        fat = Math.round((calories * 0.30) / 9);
        carbs = Math.round((calories * 0.50) / 4);
      }

      // Parse ingredients and measures
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const meas = meal[`strMeasure${i}`];
        if (ing && ing.trim()) {
          ingredients.push(`${meas ? meas.trim() + ' ' : ''}${ing.trim()}`);
        }
      }

      return {
        name: meal.strMeal,
        mealType,
        calories,
        protein,
        carbs,
        fat,
        recipe: instructions, // store the FULL recipe instructions
        ingredients,
        image: meal.strMealThumb,
        isFromApi: 1
      };
    }
  } catch (err) {
    console.error(`Error fetching details for meal ${mealId}:`, err);
  }
  return null;
}

// Sync function to pull meal suggestions from TheMealDB
export async function syncMealSuggestions() {
  // Check if we need to reset suggestions that lack macros
  const count = await db.mealSuggestions.count();
  let needsReset = false;
  if (count > 0) {
    const first = await db.mealSuggestions.limit(1).toArray();
    if (first.length > 0 && (first[0].protein === undefined || first[0].protein === null)) {
      needsReset = true;
    }
  }
  if (needsReset) {
    await db.mealSuggestions.clear();
  }

  if (!navigator.onLine) {
    await seedFallbackSuggestions();
    return;
  }

  try {
    const categoriesMap = [
      { category: 'Breakfast', mealType: 'breakfast' },
      { category: 'Vegetarian', mealType: 'lunch' },
      { category: 'Seafood', mealType: 'dinner' },
      { category: 'Starter', mealType: 'snack' }
    ];

    const apiSuggestions = [];

    for (const item of categoriesMap) {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${item.category}`);
      const data = await res.json();
      if (data && data.meals && data.meals.length > 0) {
        // Take the first 3 meals from each category to fetch detailed instructions
        const targetMeals = data.meals.slice(0, 3);
        for (const m of targetMeals) {
          const detail = await fetchMealDetails(m.idMeal, item.mealType);
          if (detail) {
            apiSuggestions.push(detail);
          }
        }
      }
    }

    if (apiSuggestions.length > 0) {
      await db.mealSuggestions.clear();
      await db.mealSuggestions.bulkPut([...apiSuggestions, ...fallbackSuggestions]);
      console.log('Meal suggestions synced successfully from TheMealDB with ingredients and macros!');
    } else {
      await seedFallbackSuggestions();
    }
  } catch (err) {
    console.error('Failed to sync meal suggestions from API:', err);
    await seedFallbackSuggestions();
  }
}
