import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Pantry({ userRole, onLogout }) {
  const [pantryItems, setPantryItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pantryItems") || "[]");
    setPantryItems(stored);
  }, []);

  const addIngredient = () => {
    const parts = inputValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const existingLower = new Set(pantryItems.map((p) => String(p).toLowerCase()));
    const toAdd = parts.filter((p) => !existingLower.has(String(p).toLowerCase()));
    if (toAdd.length === 0) {
      setInputValue("");
      return;
    }

    const newItems = [...pantryItems, ...toAdd];
    setPantryItems(newItems);
    localStorage.setItem("pantryItems", JSON.stringify(newItems));
    setInputValue("");
  };

  const removeIngredient = (index) => {
    const newItems = pantryItems.filter((_, i) => i !== index);
    setPantryItems(newItems);
    localStorage.setItem("pantryItems", JSON.stringify(newItems));
  };

  const findRecipes = async () => {
    if (pantryItems.length === 0) {
      alert("Please add at least one ingredient to your pantry!");
      return;
    }

    if (pantryItems.length < 3) {
      alert("Please add at least 3 ingredients to get suggestions.");
      return;
    }

    setLoading(true);
    setSuggestedRecipes([]); // Clear previous results
    try {
      console.log("Searching for recipes with ingredients:", pantryItems);
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/recipes/pantry-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: pantryItems })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received recipes:", data);
      console.log("Number of matching recipes:", data.length);
      setSuggestedRecipes(data);
      
      if (data.length === 0) {
        console.log("No recipes matched. Make sure your ingredients match recipe ingredients in the database.");
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to fetch recipes. Make sure the backend server is running on port 5000.");
    }
    setLoading(false);
  };

  const clearPantry = () => {
    if (window.confirm("Are you sure you want to clear your pantry?")) {
      setPantryItems([]);
      localStorage.removeItem("pantryItems");
      setSuggestedRecipes([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] via-[#1f3a1f] to-[#152815]">
      <Header userRole={userRole} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            My Pantry
          </h1>
          <p className="text-[#a3b99d] text-base sm:text-lg">
            Add ingredients you have, and we'll suggest recipes you can make!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-[#1e271c] border border-[#2c3928] rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
              Your Ingredients
            </h2>

            <div className="flex gap-2 mb-4 sm:mb-6">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                placeholder="e.g.,tomato,onion,rice. Minimum 3 Ingredents for Best Results"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-[#41543b] bg-[#0f1f0b] text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary text-sm sm:text-base"
              />
              <button
                onClick={addIngredient}
                className="bg-primary hover:bg-[#6eee00] text-[#131811] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                Add
              </button>
            </div>

            {pantryItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-[#2c3928] mb-3 sm:mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
                <p className="text-[#a3b99d] text-sm sm:text-base">Your pantry is empty. Start adding ingredients!</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4 sm:mb-6 max-h-64 sm:max-h-80 overflow-y-auto">
                  {pantryItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 bg-[#0f1f0b] border border-[#2c3928] rounded-lg"
                    >
                      <span className="text-white capitalize text-sm sm:text-base">{item}</span>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={findRecipes}
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-[#6eee00] text-[#131811] px-4 sm:px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? "Searching..." : "Find Recipes"}
                  </button>
                  <button
                    onClick={clearPantry}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors border border-red-500/30 text-sm sm:text-base"
                  >
                    Clear All
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-[#1e271c] border border-[#2c3928] rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Suggested Recipes
            </h2>

            {suggestedRecipes.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-gradient-to-br from-[#1a3a1a]/50 to-[#2a4a2a]/50 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-[#3a5a3a]/30">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-500 mb-3 sm:mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <p className="text-gray-400 text-sm sm:text-base">
                    {pantryItems.length === 0 
                      ? "Add ingredients to get recipe suggestions" 
                      : loading 
                        ? "Searching for recipes..." 
                        : "No recipes found matching your ingredients. Try adding more items!"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
                {suggestedRecipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    onClick={() => navigate(`/recipe/${recipe._id}`)}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-[#0f1f0b] border border-[#2c3928] rounded-lg hover:border-primary transition-all cursor-pointer group"
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors text-sm sm:text-base line-clamp-1">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#a3b99d] mb-2">
                        <div className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          <span>{recipe.cookingTime || "30 Mins"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span>{recipe.rating || 4.5}</span>
                        </div>
                      </div>
                      {recipe.matchCount && (
                        <div className="text-xs text-primary font-semibold">
                          {recipe.matchCount} matching ingredient{recipe.matchCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-[#2c3928] py-6 sm:py-8 text-center mt-12 sm:mt-16">
        <p className="text-[#a3b99d] text-xs sm:text-sm">
          © 2025 My Personal Chef. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Pantry;
