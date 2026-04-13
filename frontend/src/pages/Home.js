import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Home({ userRole, onLogout }) {
  const [recipes, setRecipes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/recipes`)
      .then((res) => res.json())
      .then((data) => setRecipes(data));
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const homeRecipes = filteredRecipes.slice(0, 8);

 return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f0a] via-[#1a3a1a] to-[#0f2a0f] text-[#131811]">

    <Header userRole={userRole} onLogout={onLogout} />

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center px-4 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col items-center gap-4 sm:gap-6 text-center max-w-4xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tight text-white">
            Find your next <span className="text-[#7FFF00]">favorite meal</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-xl">
            Discover thousands of recipes from cuisines around the world.
          </p>

          {/* SEARCH BAR WITH PANTRY BUTTON */}
          <div className="w-full max-w-3xl mt-2 sm:mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search any recipe (e.g., dosa, biryani)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-4 rounded-xl border border-[#4a6a4a]/50 bg-[#0f2a0f]/80 text-white placeholder-gray-400 focus:outline-none focus:border-[#7FFF00] focus:ring-2 focus:ring-[#7FFF00]/20 transition-all text-sm sm:text-base"
                />
              </div>
              <button 
                onClick={() => navigate("/pantry")}
                className="flex items-center justify-center gap-2 h-12 sm:h-14 px-6 bg-gradient-to-r from-[#7FFF00] to-[#6eee00] hover:from-[#6eee00] hover:to-[#7FFF00] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#7FFF00]/30 whitespace-nowrap"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
                <span className="hidden sm:inline">My Pantry</span>
                <span className="sm:hidden">Pantry</span>
              </button>
            </div>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 sm:mt-4">
            {["All", "Veg", "Non-Veg"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[#7FFF00] to-[#6eee00] text-black shadow-lg shadow-[#7FFF00]/30"
                    : "bg-[#1a3a1a]/80 text-gray-300 border border-[#3a5a3a]/50 hover:border-[#7FFF00]/50 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>
    

      {/* RECIPE GRID */}
      <section className="px-4 md:px-10 pb-12 sm:pb-20 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Trending Recipes</h2>
          <button 
            onClick={() => navigate("/recipes")}
            className="text-[#7FFF00] text-sm font-semibold hover:underline flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-[#1a3a1a]/50 to-[#2a4a2a]/50 backdrop-blur-sm rounded-2xl p-12 border border-[#3a5a3a]/30">
              <p className="text-gray-400 text-lg">No recipes found</p>
            </div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-[#1a3a1a]/50 to-[#2a4a2a]/50 backdrop-blur-sm rounded-2xl p-12 border border-[#3a5a3a]/30">
              <p className="text-gray-400 text-lg">No recipes match your search</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {homeRecipes.map((recipe) => (
              <div
                key={recipe._id}
                onClick={() => navigate(`/recipe/${recipe._id}`)}
                className="group relative flex flex-col rounded-2xl border-2 border-[#2d4a2d] bg-gradient-to-br from-[#1f3d1f] to-[#2a4d2a] backdrop-blur-sm overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#7FFF00]/20 hover:-translate-y-2 hover:border-[#7FFF00] transition-all duration-300 cursor-pointer"
              >
                {/* IMAGE */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* RATING BADGE */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-white text-xs font-bold">{recipe.rating || 4.5}</span>
                  </div>
                  
                  {/* CATEGORY BADGE */}
                  <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border ${
                    recipe.category === "Veg" 
                      ? "bg-green-500/80 text-white border-green-400/30" 
                      : "bg-red-500/80 text-white border-red-400/30"
                  }`}>
                    {recipe.category || "Veg"}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col gap-3 p-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#7FFF00] transition-colors line-clamp-2">
                    {recipe.title}
                  </h3>

                  {/* META INFO */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span>{recipe.cookingTime || "30 Mins"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{recipe.difficulty || "Easy"}</span>
                    </div>
                  </div>

                  <button className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2a4a2a] to-[#3a5a3a] text-white text-sm font-semibold hover:from-[#7FFF00] hover:to-[#6eee00] hover:text-black transition-all duration-300 shadow-lg">
                    View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#3a5a3a]/30 py-8 text-center mt-16 bg-gradient-to-r from-[#0a1f0a]/50 to-[#1a3a1a]/50 backdrop-blur-sm">
        <p className="text-gray-400 text-sm">
          © 2025 My Personal Chef. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default Home;
