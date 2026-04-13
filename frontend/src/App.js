//import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import AdminAddRecipe from "./pages/AdminAddRecipe";
import AdminFeedback from "./pages/AdminFeedback";
import Favorites from "./pages/Favorites";
import ViewRecipes from "./pages/ViewRecipes";
import Pantry from "./pages/Pantry";
import Recipes from "./pages/Recipes";

function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userRole) => {
    setRole(userRole);
    localStorage.setItem("userRole", userRole);
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem("userRole");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1f0b] via-[#132a0e] to-[#0b1608] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-[#0f1f0b] via-[#132a0e] to-[#0b1608]">
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={
            !role ? (
              <Login onLogin={handleLogin} />
            ) : role === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Home userRole={role} onLogout={handleLogout} />
            )
          }
        />

        {/* SIGNUP */}
        <Route path="/signup" element={<Signup />} />

        {/* HOME PAGE FOR LOGGED IN USERS */}
        <Route
          path="/home"
          element={
            role ? (
              <Home userRole={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* FAVORITES */}
        <Route
          path="/favorites"
          element={
            role ? (
              <Favorites userRole={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* PANTRY */}
        <Route
          path="/pantry"
          element={
            role ? (
              <Pantry userRole={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* RECIPES */}
        <Route
          path="/recipes"
          element={
            role ? (
              <Recipes userRole={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* RECIPE DETAIL */}
        <Route
          path="/recipe/:id"
          element={
            role ? (
              <RecipeDetail userRole={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ADMIN PAGE */}
        <Route
          path="/admin"
          element={
            role === "admin" ? (
              <AdminAddRecipe userRole={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ADMIN VIEW RECIPES */}
        <Route
          path="/view-recipes"
          element={
            role === "admin" ? (
              <ViewRecipes userRole={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ADMIN FEEDBACK */}
        <Route
          path="/admin/feedback"
          element={
            role === "admin" ? (
              <AdminFeedback userRole={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* CATCH ALL - REDIRECT TO HOME */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
