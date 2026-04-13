const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");

mongoose
  .connect("mongodb://127.0.0.1:27017/my_personal_chef")
  .then(() => console.log("MongoDB connected"))
  .catch(() => console.log("DB error"));

const recipes = [
  {
    title: "Spicy Paneer Tikka",
    ingredients: ["2 cups paneer cubes", "1 cup yogurt", "2 tbsp tikka masala", "1 bell pepper", "1 onion", "2 tbsp oil"],
    steps: ["Step 1: Marinate paneer in yogurt and spices for 30 minutes", "Step 2: Thread paneer and vegetables on skewers", "Step 3: Grill or bake at 400°F for 15-20 minutes", "Step 4: Serve hot with mint chutney"],
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500",
    rating: 4.8,
    cookingTime: "30 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Hot"
  },
  {
    title: "Classic Chicken Biryani",
    ingredients: ["500g chicken", "2 cups basmati rice", "1 cup yogurt", "3 onions", "4 tomatoes", "Biryani masala", "Saffron", "Mint leaves"],
    steps: ["Step 1: Marinate chicken with yogurt and spices", "Step 2: Cook rice until 70% done", "Step 3: Layer rice and chicken in a pot", "Step 4: Cook on low heat for 30 minutes"],
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
    rating: 4.9,
    cookingTime: "60 Mins",
    difficulty: "Medium",
    category: "Non-Veg",
    servings: "6 Servings",
    heatLevel: "Medium Heat"
  },
  {
    title: "Avocado Toast",
    ingredients: ["2 slices whole grain bread", "1 ripe avocado", "1 tbsp lemon juice", "Salt and pepper", "Cherry tomatoes", "Red pepper flakes"],
    steps: ["Step 1: Toast the bread until golden brown", "Step 2: Mash avocado with lemon juice, salt, and pepper", "Step 3: Spread avocado on toast", "Step 4: Top with cherry tomatoes and red pepper flakes"],
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500",
    rating: 4.5,
    cookingTime: "10 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "2 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Chocolate Lava Cake",
    ingredients: ["100g dark chocolate", "100g butter", "2 eggs", "2 egg yolks", "1/4 cup sugar", "2 tbsp flour", "Vanilla extract"],
    steps: ["Step 1: Melt chocolate and butter together", "Step 2: Whisk eggs, yolks, and sugar until thick", "Step 3: Fold in chocolate mixture and flour", "Step 4: Bake at 425°F for 12-14 minutes"],
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500",
    rating: 4.7,
    cookingTime: "25 Mins",
    difficulty: "Medium",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Garden Fresh Salad",
    ingredients: ["Mixed greens", "Cherry tomatoes", "Cucumber", "Bell peppers", "Feta cheese", "Olive oil", "Balsamic vinegar", "Herbs"],
    steps: ["Step 1: Wash and chop all vegetables", "Step 2: Mix greens in a large bowl", "Step 3: Add chopped vegetables and feta", "Step 4: Drizzle with olive oil and balsamic vinegar"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    rating: 4.2,
    cookingTime: "15 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "2 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Ultimate Cheeseburger",
    ingredients: ["500g ground beef", "4 burger buns", "4 cheese slices", "Lettuce", "Tomato", "Onion", "Pickles", "Burger sauce"],
    steps: ["Step 1: Form beef into 4 patties and season well", "Step 2: Grill patties for 4-5 minutes per side", "Step 3: Add cheese in last minute to melt", "Step 4: Assemble burgers with all toppings"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    rating: 4.6,
    cookingTime: "25 Mins",
    difficulty: "Medium",
    category: "Non-Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Margherita Pizza",
    ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Fresh basil", "Olive oil", "Garlic", "Salt"],
    steps: ["Step 1: Roll out pizza dough to desired thickness", "Step 2: Spread tomato sauce evenly", "Step 3: Add mozzarella and basil leaves", "Step 4: Bake at 475°F for 12-15 minutes"],
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
    rating: 4.8,
    cookingTime: "30 Mins",
    difficulty: "Medium",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Grilled Salmon",
    ingredients: ["4 salmon fillets", "Lemon", "Garlic", "Olive oil", "Dill", "Salt and pepper", "Asparagus"],
    steps: ["Step 1: Marinate salmon with lemon, garlic, and olive oil", "Step 2: Preheat grill to medium-high heat", "Step 3: Grill salmon for 4-5 minutes per side", "Step 4: Serve with grilled asparagus"],
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500",
    rating: 4.9,
    cookingTime: "20 Mins",
    difficulty: "Easy",
    category: "Non-Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Pad Thai",
    ingredients: ["Rice noodles", "Shrimp or tofu", "Eggs", "Bean sprouts", "Peanuts", "Lime", "Fish sauce", "Tamarind paste", "Garlic"],
    steps: ["Step 1: Soak rice noodles in warm water", "Step 2: Stir-fry protein with garlic", "Step 3: Add noodles and sauce, toss well", "Step 4: Top with peanuts, lime, and bean sprouts"],
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500",
    rating: 4.7,
    cookingTime: "25 Mins",
    difficulty: "Medium",
    category: "Non-Veg",
    servings: "3 Servings",
    heatLevel: "Medium Heat"
  },
  {
    title: "Vegetable Stir Fry",
    ingredients: ["Broccoli", "Bell peppers", "Carrots", "Snow peas", "Soy sauce", "Ginger", "Garlic", "Sesame oil", "Rice"],
    steps: ["Step 1: Chop all vegetables into bite-sized pieces", "Step 2: Heat wok with sesame oil", "Step 3: Stir-fry vegetables with ginger and garlic", "Step 4: Add soy sauce and serve over rice"],
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500",
    rating: 4.4,
    cookingTime: "20 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Chicken Tacos",
    ingredients: ["500g chicken breast", "Taco shells", "Lettuce", "Tomatoes", "Cheese", "Sour cream", "Taco seasoning", "Lime"],
    steps: ["Step 1: Cook chicken with taco seasoning", "Step 2: Shred chicken into small pieces", "Step 3: Warm taco shells", "Step 4: Assemble tacos with all toppings"],
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500",
    rating: 4.6,
    cookingTime: "30 Mins",
    difficulty: "Easy",
    category: "Non-Veg",
    servings: "6 Servings",
    heatLevel: "Medium Heat"
  },
  {
    title: "Mushroom Risotto",
    ingredients: ["Arborio rice", "Mushrooms", "Vegetable broth", "White wine", "Parmesan cheese", "Butter", "Onion", "Garlic"],
    steps: ["Step 1: Sauté mushrooms and set aside", "Step 2: Cook onion and rice in butter", "Step 3: Add wine and broth gradually, stirring constantly", "Step 4: Stir in mushrooms and parmesan"],
    image: "https://images.unsplash.com/photo-1476124369491-c4ca6e0e6e98?w=500",
    rating: 4.8,
    cookingTime: "40 Mins",
    difficulty: "Hard",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Berry Smoothie Bowl",
    ingredients: ["Frozen berries", "Banana", "Greek yogurt", "Honey", "Granola", "Fresh berries", "Chia seeds", "Coconut flakes"],
    steps: ["Step 1: Blend frozen berries, banana, and yogurt", "Step 2: Pour into a bowl", "Step 3: Top with granola, fresh berries, and chia seeds", "Step 4: Drizzle with honey"],
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500",
    rating: 4.5,
    cookingTime: "10 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "2 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Beef Stroganoff",
    ingredients: ["500g beef strips", "Mushrooms", "Onion", "Sour cream", "Beef broth", "Flour", "Butter", "Egg noodles", "Paprika"],
    steps: ["Step 1: Brown beef strips in butter", "Step 2: Sauté mushrooms and onions", "Step 3: Make sauce with broth and sour cream", "Step 4: Combine all and serve over noodles"],
    image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=500",
    rating: 4.7,
    cookingTime: "35 Mins",
    difficulty: "Medium",
    category: "Non-Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Caprese Salad",
    ingredients: ["Fresh mozzarella", "Tomatoes", "Fresh basil", "Olive oil", "Balsamic glaze", "Salt", "Black pepper"],
    steps: ["Step 1: Slice tomatoes and mozzarella", "Step 2: Arrange alternating slices on a plate", "Step 3: Add basil leaves between slices", "Step 4: Drizzle with olive oil and balsamic glaze"],
    image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=500",
    rating: 4.6,
    cookingTime: "10 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "2 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Butter Chicken",
    ingredients: ["500g chicken", "Tomato puree", "Cream", "Butter", "Garam masala", "Ginger-garlic paste", "Kasuri methi", "Onions"],
    steps: ["Step 1: Marinate and grill chicken pieces", "Step 2: Make tomato-based gravy with spices", "Step 3: Add grilled chicken to gravy", "Step 4: Finish with cream and butter"],
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500",
    rating: 4.9,
    cookingTime: "45 Mins",
    difficulty: "Medium",
    category: "Non-Veg",
    servings: "4 Servings",
    heatLevel: "Medium Heat"
  },
  {
    title: "Greek Gyros",
    ingredients: ["Lamb or chicken", "Pita bread", "Tzatziki sauce", "Tomatoes", "Onions", "Lettuce", "Feta cheese", "Greek seasoning"],
    steps: ["Step 1: Season and cook meat until crispy", "Step 2: Warm pita bread", "Step 3: Slice meat thinly", "Step 4: Assemble gyros with all toppings and tzatziki"],
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500",
    rating: 4.7,
    cookingTime: "30 Mins",
    difficulty: "Medium",
    category: "Non-Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Vegetable Curry",
    ingredients: ["Mixed vegetables", "Coconut milk", "Curry paste", "Onions", "Garlic", "Ginger", "Tomatoes", "Cilantro", "Rice"],
    steps: ["Step 1: Sauté onions, garlic, and ginger", "Step 2: Add curry paste and cook until fragrant", "Step 3: Add vegetables and coconut milk", "Step 4: Simmer until vegetables are tender"],
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500",
    rating: 4.5,
    cookingTime: "35 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "6 Servings",
    heatLevel: "Medium Heat"
  },
  {
    title: "Pancakes",
    ingredients: ["2 cups flour", "2 eggs", "1.5 cups milk", "2 tbsp sugar", "2 tsp baking powder", "Butter", "Maple syrup", "Berries"],
    steps: ["Step 1: Mix dry ingredients in a bowl", "Step 2: Whisk eggs and milk, combine with dry ingredients", "Step 3: Cook on griddle until bubbles form", "Step 4: Flip and cook until golden, serve with syrup"],
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500",
    rating: 4.6,
    cookingTime: "20 Mins",
    difficulty: "Easy",
    category: "Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  },
  {
    title: "Sushi Rolls",
    ingredients: ["Sushi rice", "Nori sheets", "Fresh fish or vegetables", "Avocado", "Cucumber", "Soy sauce", "Wasabi", "Pickled ginger"],
    steps: ["Step 1: Cook and season sushi rice", "Step 2: Place nori on bamboo mat", "Step 3: Spread rice and add fillings", "Step 4: Roll tightly and slice into pieces"],
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500",
    rating: 4.8,
    cookingTime: "40 Mins",
    difficulty: "Hard",
    category: "Non-Veg",
    servings: "4 Servings",
    heatLevel: "Mild"
  }
];

async function seedRecipes() {
  try {
    await Recipe.deleteMany({});
    console.log("Cleared existing recipes");
    
    await Recipe.insertMany(recipes);
    console.log("Successfully added 20 recipes!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding recipes:", error);
    process.exit(1);
  }
}

seedRecipes();
