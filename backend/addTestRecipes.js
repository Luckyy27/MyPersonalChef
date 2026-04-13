const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");

mongoose
  .connect("mongodb://127.0.0.1:27017/my_personal_chef")
  .then(() => console.log("MongoDB connected"))
  .catch(() => console.log("DB error"));

const testRecipes = [
  {
    title: "Tomato Rice",
    ingredients: ["rice", "tomatoes", "onions", "oil", "salt", "turmeric"],
    steps: [
      "Cook rice until 70% done",
      "Sauté onions in oil until golden",
      "Add chopped tomatoes and cook until soft",
      "Mix in cooked rice and spices",
      "Simmer for 10 minutes"
    ],
    image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=500",
    rating: 4.5,
    cookingTime: "30 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Spanish Rice",
    ingredients: ["rice", "tomatoes", "onions", "bell peppers", "garlic", "chicken broth"],
    steps: [
      "Sauté onions and garlic",
      "Add rice and toast for 2 minutes",
      "Add tomatoes and broth",
      "Simmer until rice is cooked",
      "Fluff with fork and serve"
    ],
    image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500",
    rating: 4.6,
    cookingTime: "35 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "6 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Tomato Onion Curry",
    ingredients: ["tomatoes", "onions", "ginger", "garlic", "spices", "oil", "cilantro"],
    steps: [
      "Sauté onions until caramelized",
      "Add ginger-garlic paste",
      "Add chopped tomatoes and spices",
      "Cook until oil separates",
      "Garnish with cilantro"
    ],
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
    rating: 4.4,
    cookingTime: "25 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Medium Heat"
  },
  {
    title: "Fried Rice",
    ingredients: ["rice", "onions", "vegetables", "soy sauce", "eggs", "oil"],
    steps: [
      "Use day-old cooked rice",
      "Scramble eggs and set aside",
      "Stir-fry onions and vegetables",
      "Add rice and soy sauce",
      "Mix in eggs and serve hot"
    ],
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
    rating: 4.7,
    cookingTime: "20 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "3 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Tomato Soup",
    ingredients: ["tomatoes", "onions", "garlic", "cream", "basil", "vegetable stock"],
    steps: [
      "Roast tomatoes and onions",
      "Blend with stock until smooth",
      "Simmer for 15 minutes",
      "Add cream and basil",
      "Season and serve hot"
    ],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500",
    rating: 4.8,
    cookingTime: "30 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  }
];

async function addRecipes() {
  try {
    await Recipe.insertMany(testRecipes);
    console.log("✅ Successfully added 5 test recipes with tomatoes, rice, and onions!");
    console.log("These recipes will now match your pantry ingredients.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding recipes:", error);
    process.exit(1);
  }
}

addRecipes();
