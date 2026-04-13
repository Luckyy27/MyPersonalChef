import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function ViewRecipes({ userRole, onLogout }) {
  const [recipes, setRecipes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [editingRecipe, setEditingRecipe] = useState(null);
  const navigate = useNavigate();

  const categories = ["All", "Veg", "Non-Veg"];
  const types = ["All", "Breakfast", "Desserts", "Fast Food", "Lunch", "Dinner", "Snacks", "Beverages", "Other"];

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = () => {
    fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/recipes`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => {
          const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (aTime !== bTime) return bTime - aTime;
          return String(a?.title || '').localeCompare(String(b?.title || ''));
        });
        setRecipes(list);
      });
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
    const recipeType = recipe.type || "Other";
    const matchesType = selectedType === "All" || recipeType === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleDelete = async (recipeId) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/recipes/${recipeId}`, {
          method: "DELETE"
        });
        if (res.ok) {
          setRecipes(recipes.filter(r => r._id !== recipeId));
          alert("Recipe deleted successfully!");
        } else {
          alert("Error deleting recipe");
        }
      } catch (error) {
        alert("Server error");
      }
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe({
      ...recipe,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : recipe.ingredients,
      steps: Array.isArray(recipe.steps) ? recipe.steps.join('\n') : recipe.steps
    });
  };

  const handleUpdate = async () => {
    try {
      const ingredientsArray = editingRecipe.ingredients.split('\n').filter(item => item.trim() !== '');
      const stepsArray = editingRecipe.steps.split('\n').filter(item => item.trim() !== '');

      const res = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/recipes/${editingRecipe._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingRecipe,
          ingredients: ingredientsArray,
          steps: stepsArray
        })
      });

      if (res.ok) {
        fetchRecipes();
        setEditingRecipe(null);
        alert("Recipe updated successfully!");
      } else {
        alert("Error updating recipe");
      }
    } catch (error) {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] via-[#1f3a1f] to-[#152815]">
      <Header userRole={userRole} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Manage Recipes</h1>
          <p className="text-[#a3b99d] text-sm sm:text-base">View, edit, and delete recipes</p>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3b99d]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-lg border border-[#41543b] bg-[#243d24] text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-[#131811]"
                    : "bg-[#243d24] text-[#a3b99d] border border-[#2c3928] hover:border-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedType === t
                    ? "bg-primary text-[#131811]"
                    : "bg-[#243d24] text-[#a3b99d] border border-[#2c3928] hover:border-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* RECIPES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-[#243d24] border border-[#2c3928] rounded-2xl overflow-hidden hover:border-primary transition-all"
            >
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">{recipe.title}</h3>
                <div className="flex items-center gap-4 text-xs text-[#a3b99d] mb-4">
                  <span className="px-2 py-1 rounded bg-black/20 text-white border border-white/10">
                    {recipe.category || "Uncategorized"}
                  </span>
                  <span>⭐ {recipe.rating}</span>
                  <span>🕐 {recipe.cookingTime}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => navigate(`/recipe/${recipe._id}`)}
                    className="flex-1 py-2 bg-[#2c3928] text-white rounded-lg hover:bg-primary hover:text-[#131811] transition-colors text-sm font-semibold"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recipe._id)}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#a3b99d] text-lg">No recipes found</p>
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingRecipe && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e271c] border border-[#2c3928] rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Edit Recipe</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Recipe Name</label>
                <input
                  type="text"
                  value={editingRecipe.title}
                  onChange={(e) => setEditingRecipe({...editingRecipe, title: e.target.value})}
                  className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Image URL</label>
                <input
                  type="text"
                  value={editingRecipe.image}
                  onChange={(e) => setEditingRecipe({...editingRecipe, image: e.target.value})}
                  className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">YouTube URL (optional)</label>
                <input
                  type="url"
                  value={editingRecipe.youtubeUrl || ""}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, youtubeUrl: e.target.value })}
                  className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Category</label>
                  <select
                    value={editingRecipe.category}
                    onChange={(e) => setEditingRecipe({...editingRecipe, category: e.target.value})}
                    className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Type</label>
                  <select
                    value={editingRecipe.type || "Other"}
                    onChange={(e) => setEditingRecipe({...editingRecipe, type: e.target.value})}
                    className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Difficulty</label>
                  <select
                    value={editingRecipe.difficulty}
                    onChange={(e) => setEditingRecipe({...editingRecipe, difficulty: e.target.value})}
                    className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Ingredients (one per line)</label>
                <textarea
                  value={editingRecipe.ingredients}
                  onChange={(e) => setEditingRecipe({...editingRecipe, ingredients: e.target.value})}
                  rows="6"
                  className="w-full rounded-lg bg-[#1e271c] border border-[#2c3928] p-4 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Steps (one per line)</label>
                <textarea
                  value={editingRecipe.steps}
                  onChange={(e) => setEditingRecipe({...editingRecipe, steps: e.target.value})}
                  rows="8"
                  className="w-full rounded-lg bg-[#1e271c] border border-[#2c3928] p-4 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setEditingRecipe(null)}
                  className="flex-1 py-3 bg-[#2c3928] text-white rounded-lg hover:bg-[#3d4d38] transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-3 bg-primary text-[#131811] rounded-lg hover:bg-[#6eee00] transition-colors font-semibold"
                >
                  Update Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRecipes;
