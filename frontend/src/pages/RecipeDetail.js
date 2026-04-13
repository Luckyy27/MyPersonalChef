import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

function RecipeDetail({ userRole, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userFavorites, setUserFavorites] = useState([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    try {
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split('?')[0];
      }
      if (url.includes('v=')) {
        return url.split('v=')[1].split('&')[0];
      }
      if (url.includes('youtu.be')) {
        return url.split('youtu.be/')[1].split('?')[0];
      }
      return null;
    } catch (e) {
      console.error('Error parsing YouTube URL:', e);
      return null;
    }
  };
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/recipes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecipe(data);
        const nextVideoId = getYouTubeVideoId(data?.youtubeUrl);
        setVideoId(nextVideoId);
      });
    
    // Check if recipe is in favorites from backend
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      const normalizedEmail = String(userEmail || "").trim().toLowerCase();
      fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/favorites/${encodeURIComponent(normalizedEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          const favoriteIds = data.favorites || [];
          setIsFavorite(favoriteIds.includes(id) || false);
          
          // Fetch user's favorite recipes for display
          if (favoriteIds.length > 0) {
            Promise.all(
              favoriteIds.slice(0, 3).map(favId =>
                fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/recipes/${favId}`)
                  .then(res => {
                    if (!res.ok) return null;
                    return res.json().catch(() => null);
                  })
                  .catch(() => null)
              )
            ).then(recipes => setUserFavorites(recipes.filter(r => r && r._id)));
          }
        })
        .catch((error) => console.error("Error fetching favorites:", error));
    }
  }, [id]);

  const toggleFavorite = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please login to save favorites");
      return;
    }

    const normalizedEmail = String(userEmail || "").trim().toLowerCase();
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const res = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/favorites/${encodeURIComponent(normalizedEmail)}/${id}`, {
          method: "DELETE"
        });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to remove favorite (${res.status})`);
        }
        setIsFavorite(false);
      } else {
        // Add to favorites
        const res = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/favorites/${encodeURIComponent(normalizedEmail)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId: id })
          });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to add favorite (${res.status})`);
        }
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorites. Please try again.");
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] via-[#1f3a1f] to-[#152815] flex items-center justify-center">
        <p className="text-white text-lg">Loading recipe...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] via-[#1f3a1f] to-[#152815]">
      <Header userRole={userRole} onLogout={onLogout} />

      {showVideoModal && videoId && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowVideoModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-[#1a2e1a] rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 border border-[#2c3928]">
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-[220px] sm:h-[420px]"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={recipe?.title || 'Recipe Video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-[#131811] hover:bg-[#6eee00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                  onClick={() => setShowVideoModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a] via-[#1a2e1a]/60 to-transparent"></div>
        
        {/* FEATURED BADGE */}
        <div className="absolute top-6 left-6 bg-primary text-[#131811] px-4 py-2 rounded-lg text-sm font-bold">
          Featured Recipe
        </div>

        {/* TITLE */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">{recipe.title}</h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-white text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="text-sm">{recipe.cookingTime || "20 Mins"}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-sm">{recipe.servings || "4 Servings"}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="text-sm">{recipe.heatLevel || "Medium Heat"}</span>
            </div>
          </div>
        </div>

        {/* BUTTONS CONTAINER */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col sm:flex-row gap-3">
          {/* WATCH BUTTON */}
          <button
            onClick={() => {
              if (videoId) {
                setShowVideoModal(true);
              } else {
                alert('No video available for this recipe');
              }
            }}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm sm:text-base ${videoId ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
            disabled={!videoId}
            title={!videoId ? 'No video available' : 'Watch recipe video'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.58 29 29 0 0 0-.46-5.58z" />
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
            </svg>
            {videoId ? 'Watch' : 'No Video'}
          </button>
          
          {/* FAVORITE BUTTON */}
          <button
            onClick={toggleFavorite}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm sm:text-base ${
              isFavorite 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-primary hover:bg-[#6eee00] text-[#131811]"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
        </div>
      </div>

      {/* INGREDIENTS AND INSTRUCTIONS SIDE BY SIDE */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* INGREDIENTS */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
              Ingredients
            </h2>
            <div className="space-y-3">
              {Array.isArray(recipe.ingredients) ? (
                recipe.ingredients.map((ingredient, index) => (
                  <label key={index} className="flex items-center gap-3 p-4 bg-[#1e271c] border border-[#2c3928] rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded border-[#2c3928] bg-[#0f1f0b] text-primary" />
                    <span className="text-white">{ingredient}</span>
                  </label>
                ))
              ) : (
                <p className="text-white p-4 bg-[#1e271c] border border-[#2c3928] rounded-lg">{recipe.ingredients}</p>
              )}
            </div>
          </div>

          {/* INSTRUCTIONS */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              Instructions
            </h2>
            <div className="space-y-6">
              {Array.isArray(recipe.steps) ? (
                recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-[#131811] rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#a3b99d] leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-[#131811] rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-[#a3b99d] leading-relaxed">{recipe.steps}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAVORITES SECTION */}
      {userFavorites.length > 0 && (
        <div className="bg-[#0f1f0b] py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Favorites</h2>
                <p className="text-[#a3b99d]">Recipes you've saved for later</p>
              </div>
              <button 
                onClick={() => navigate("/favorites")}
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View All Favorites
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userFavorites.map((fav) => (
                <div 
                  key={fav._id} 
                  onClick={() => navigate(`/recipe/${fav._id}`)}
                  className="bg-[#1e271c] border border-[#2c3928] rounded-2xl overflow-hidden hover:border-primary transition-all cursor-pointer"
                >
                  <img src={fav.image} alt={fav.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-2">{fav.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-[#a3b99d]">
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>{fav.cookingTime || "30 Mins"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        <span>{fav.difficulty || "Easy"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK SECTION */}
      <div className="bg-[#0f1f0b] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            <svg className="w-8 h-8 inline-block mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Share Your Feedback
          </h2>
          
          <form className="space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const feedbackData = {
              ...Object.fromEntries(formData),
              recipeId: id,
              recipeTitle: recipe?.title || 'Recipe',
              rating: parseInt(formData.get('rating'))
            };
            
            try {
              console.log('Submitting feedback:', feedbackData);
              const response = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/api/feedback`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(feedbackData),
  credentials: 'include'  // This is correct, keep this
});
              const result = await response.json();
              
              if (!response.ok) {
                throw new Error(result.error || `Server error: ${response.status}`);
              }
              
              if (!result.success) {
                throw new Error(result.message || 'Failed to submit feedback');
              }
              
              alert('Thank you for your feedback!');
              e.target.reset();
              setSelectedRating(0);
            } catch (error) {
              console.error('Error submitting feedback:', error);
              alert(error.message || 'Failed to submit feedback. Please try again later.');
            }
          }}>
            {/* Hidden inputs for recipe data */}
            <input type="hidden" name="recipeId" value={id} />
            <input type="hidden" name="recipeTitle" value={recipe?.title || ''} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#a3b99d] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-[#1e271c] border border-[#2c3928] rounded-lg text-white placeholder-[#6b7c65] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#a3b99d] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-[#1e271c] border border-[#2c3928] rounded-lg text-white placeholder-[#6b7c65] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-[#a3b99d] mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <React.Fragment key={star}>
                    <input
                      type="radio"
                      id={`star${star}`}
                      name="rating"
                      value={star}
                      required
                      className="hidden"
                      onChange={() => setSelectedRating(star)}
                    />
                    <label
                      htmlFor={`star${star}`}
                      className="text-3xl cursor-pointer transition-colors"
                      style={{
                        color: (hoveredStar >= star || selectedRating >= star) ? '#fbbf24' : '#4b5563',
                      }}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                    >
                      ★
                    </label>
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-[#a3b99d] mb-2">
                Your Feedback
              </label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                required
                className="w-full px-4 py-3 bg-[#1e271c] border border-[#2c3928] rounded-lg text-white placeholder-[#6b7c65] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Share your thoughts about this recipe..."
              ></textarea>
            </div>
            
            <input type="hidden" name="recipeId" value={id} />
            <input type="hidden" name="recipeTitle" value={recipe.title} />
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-[#6eee00] text-[#131811] font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
