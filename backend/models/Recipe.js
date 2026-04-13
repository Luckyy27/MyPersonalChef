const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  ingredients: {
    type: [String],
    required: true
  },
  steps: {
    type: [String],
    required: true
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/400x300"
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  cookingTime: {
    type: String,
    default: "30 Mins"
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  category: {
    type: String,
    enum: ["Veg", "Non-Veg"],
    default: "Veg"
  },
  type: {
    type: String,
    enum: ["Breakfast", "Desserts", "Fast Food", "Lunch", "Dinner", "Snacks", "Beverages", "Other"],
    default: "Other"
  },
  servings: {
    type: String,
    default: "4 Servings"
  },
  heatLevel: {
    type: String,
    enum: ["Mild", "Medium Heat", "Hot", "Very Hot"],
    default: "Medium Heat"
  },
  youtubeUrl: {
    type: String,
    default: "",
    trim : true
  },
  createdBy: {
    type: String,
    default: "admin"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Recipe", recipeSchema);
