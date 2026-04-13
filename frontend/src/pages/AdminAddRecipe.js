import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function AdminAddRecipe({ userRole, onLogout }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Veg");
  const [type, setType] = useState("Other");
  const [cookingTime, setCookingTime] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [servings, setServings] = useState("");
  const [heatLevel] = useState("Medium Heat");
  const [rating, setRating] = useState("4.5");
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [youtubeImportUrl, setYoutubeImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importMeta, setImportMeta] = useState(null);

  const handleImageSelect = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setImage(url);
      setImagePreview(url);
    }
  };

  const handleAutoFillFromYoutube = async () => {
    setMessage("");
    setImportMeta(null);

    if (!youtubeImportUrl.trim()) {
      setMessage("Please enter a YouTube URL to auto-fill.");
      return;
    }

    try {
      setIsImporting(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/api/ai/import-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ youtubeUrl: youtubeImportUrl.trim() })
      });

      const data = await response.json();

      if (data?.status !== "ok" && data?.status !== "partial") {
        setImportMeta({
          status: "error",
          message: data?.message || "AI import failed"
        });
        return;
      }

      const recipe = data?.recipe || {};

      if (recipe.title) setTitle(recipe.title);
      if (Array.isArray(recipe.ingredients) && recipe.ingredients.length) setIngredients(recipe.ingredients.join("\n"));
      if (Array.isArray(recipe.steps) && recipe.steps.length) setSteps(recipe.steps.join("\n"));
      if (recipe.cookingTime) setCookingTime(recipe.cookingTime);
      if (recipe.difficulty) setDifficulty(recipe.difficulty);
      if (recipe.image) {
        setImage(recipe.image);
        setImagePreview(recipe.image);
      }

      setImportMeta({
        status: data?.status || "ok",
        source: data?.source,
        confidence: typeof data.confidence === "number" ? data.confidence : 0,
        message: data.message || ""
      });

      if (data.status === "partial") {
        setMessage(data.message || "Auto-fill was partial. Please verify and complete manually.");
      } else {
        setMessage("Auto-fill completed. Please verify before publishing.");
      }
    } catch (error) {
      setMessage("Server error while auto-filling.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddRecipe = async () => {
    setMessage("");

    const ingredientsArray = ingredients.split("\n").filter((item) => item.trim() !== "");
    const stepsArray = steps.split("\n").filter((item) => item.trim() !== "");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/add-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          ingredients: ingredientsArray,
          steps: stepsArray,
          image,
          category,
          type,
          cookingTime,
          difficulty,
          servings,
          heatLevel,
          rating: parseFloat(rating),
          youtubeUrl: videoUrl
        })
      });

      if (!response.ok) {
        setMessage("Error adding recipe");
        return;
      }

      setTitle("");
      setIngredients("");
      setSteps("");
      setImage("");
      setImagePreview("");
      setCookingTime("");
      setServings("");
      setVideoUrl("");
      setMessage("Recipe added successfully!");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setMessage("Server error");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All changes will be lost.")) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] via-[#1f3a1f] to-[#152815]">
      <Header userRole={userRole} onLogout={onLogout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Admin – Add New Recipe</h1>
          <p className="text-[#a3b99d] text-sm sm:text-base">Share your culinary masterpiece with the world.</p>
        </div>

        <div className="bg-[#1e271c] border border-[#2c3928] rounded-2xl p-4 sm:p-8">
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">Recipe Name</label>
            <input
              type="text"
              placeholder="e.g. Grandma's Apple Pie"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">YouTube URL (Auto-Fill)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeImportUrl}
                onChange={(e) => setYoutubeImportUrl(e.target.value)}
                className="w-full px-4 py-3 bg-[#2c3928] border border-[#3a4a38] rounded-lg text-white placeholder-[#6b7c65] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAutoFillFromYoutube}
                disabled={isImporting}
                className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  isImporting
                    ? "bg-[#3a4a38] text-[#a3b99d] cursor-not-allowed"
                    : "bg-primary hover:bg-[#6eee00] text-[#131811]"
                }`}
              >
                {isImporting ? "Auto-Filling..." : "Auto-Fill from YouTube"}
              </button>
            </div>
            {importMeta && typeof importMeta.confidence === "number" && importMeta.confidence < 0.6 && (
              <p className="text-xs text-yellow-300 mt-2">
                Low confidence ({Math.round(importMeta.confidence * 100)}%) – please verify.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Video URL (for Watch button)
              <span className="text-[#a3b99d] text-xs font-normal ml-1">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-3 bg-[#2c3928] border border-[#3a4a38] rounded-lg text-white placeholder-[#6b7c65] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-[#a3b99d] mt-1">
              Add a YouTube URL to enable the Watch button on the recipe page.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">Recipe Image</label>
            <div className="flex items-center gap-4 p-6 bg-[#1e271c] border border-[#2c3928] rounded-lg">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
              ) : (
                <div className="w-20 h-20 bg-[#0f1f0b] border-2 border-dashed border-[#2c3928] rounded-lg flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7c65" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <p className="text-white text-sm font-medium mb-1">Upload a photo</p>
                <p className="text-[#6b7c65] text-xs mb-3">JPG, PNG max 5MB</p>
                <button
                  type="button"
                  onClick={handleImageSelect}
                  className="bg-primary hover:bg-[#6eee00] text-[#131811] px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  Select Image
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white focus:outline-none focus:border-primary"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
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
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white focus:outline-none focus:border-primary"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Cooking Time</label>
              <input
                type="text"
                placeholder="e.g. 30 Mins"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Servings</label>
              <input
                type="text"
                placeholder="e.g. 4 Servings"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="e.g. 4.5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-4 text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white text-sm font-semibold">Ingredients</label>
              <span className="text-xs text-[#6b7c65]">ONE PER LINE</span>
             </div>
             <textarea
               placeholder="2 cups flour\n1 tsp salt\n3 large eggs"
               value={ingredients}
               onChange={(e) => setIngredients(e.target.value)}
               rows="6"
               className="w-full rounded-lg bg-[#1e271c] border border-[#2c3928] p-4 text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary resize-none"
             />
           </div>
 
           <div className="mb-8">
             <label className="block text-white text-sm font-semibold mb-2">Preparation Steps</label>
             <textarea
               placeholder="Step 1: ...\nStep 2: ..."
               value={steps}
               onChange={(e) => setSteps(e.target.value)}
               rows="8"
               className="w-full rounded-lg bg-[#1e271c] border border-[#2c3928] p-4 text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary resize-none"
             />
           </div>
 
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
             <button
               type="button"
               onClick={handleCancel}
               className="px-6 py-3 rounded-lg text-white font-semibold hover:bg-[#243d24] transition-colors order-2 sm:order-1"
             >
               Cancel
             </button>
             <button
               onClick={handleAddRecipe}
               className="bg-primary hover:bg-[#6eee00] text-[#131811] px-8 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
             >
               Publish Recipe
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M5 12h14M12 5l7 7-7 7" />
               </svg>
             </button>
           </div>
 
           {message && (
             <div
               className={`mt-4 p-4 rounded-lg ${
                 message.includes("successfully")
                   ? "bg-green-500/20 border border-green-500 text-green-400"
                   : "bg-red-500/20 border border-red-500 text-red-400"
               }`}
             >
               <p className="text-sm font-semibold">{message}</p>
             </div>
           )}
         </div>
       </main>
     </div>
   );
 }
 
 export default AdminAddRecipe;

