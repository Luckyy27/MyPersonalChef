import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Favorites({ userRole, onLogout }) {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      return;
    }

    const normalizedEmail = String(userEmail || "").trim().toLowerCase();

    // Fetch favorites from backend
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/favorites/${encodeURIComponent(normalizedEmail)}`)
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to fetch favorites (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        const favoriteIds = data.favorites || [];
        if (favoriteIds.length > 0) {
          Promise.all(
            favoriteIds.map(id =>
              fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/recipes/${id}`)
                .then(res => {
                  if (!res.ok) return null;
                  return res.json().catch(() => null);
                })
                .catch(() => null)
            )
          ).then(recipes => setFavorites(recipes.filter(r => r && r._id)));
        } else {
          setFavorites([]);
        }
      })
      .catch((error) => console.error("Error fetching favorites:", error));
  }, []);

  const removeFavorite = async (recipeId) => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please login to manage favorites");
      return;
    }

    const normalizedEmail = String(userEmail || "").trim().toLowerCase();

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/favorites/${encodeURIComponent(normalizedEmail)}/${recipeId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed to remove favorite (${res.status})`);
      }
      setFavorites(favorites.filter(r => r._id !== recipeId));
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] via-[#1f3a1f] to-[#152815]">
      <Header userRole={userRole} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Your Favorites</h1>
          <p className="text-[#a3b99d] text-sm sm:text-base">Recipes you've saved for later</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto text-[#2c3928] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No favorites yet</h2>
            <p className="text-[#a3b99d] mb-6">Start adding recipes to your favorites!</p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary hover:bg-[#6eee00] text-[#131811] px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Recipes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((recipe) => (
              <div
                key={recipe._id}
                className="group flex flex-col gap-3 rounded-2xl border border-[#2c3928] bg-[#243d24] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={() => navigate(`/recipe/${recipe._id}`)}
                  />
                  <div className="absolute top-3 left-3 bg-[#131811]/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-white text-xs font-bold">{recipe.rating || 4.5}</span>
                  </div>
                  <button
                    onClick={() => removeFavorite(recipe._id)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold ${
                    recipe.category === "Veg" 
                      ? "bg-green-500/90 text-white" 
                      : "bg-red-500/90 text-white"
                  }`}>
                    {recipe.category || "Veg"}
                  </div>
                </div>

                <div className="flex flex-col gap-2 px-4 pb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[#a3b99d]">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span>{recipe.cookingTime || "30 Mins"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{recipe.difficulty || "Easy"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/recipe/${recipe._id}`)}
                    className="mt-2 w-full py-2.5 rounded-xl bg-[#2c3928] text-white text-sm font-semibold hover:bg-primary hover:text-[#131811] transition-colors"
                  >
                    View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Favorites;
