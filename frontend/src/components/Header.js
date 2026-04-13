import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Header({ userRole, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const getUserInitial = () => {
    const userName = localStorage.getItem("userName") || "User";
    return userName.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      if (onLogout) onLogout();
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full border-b border-[#3a5a3a]/30 bg-gradient-to-r from-[#0a1f0a]/80 to-[#1a3a1a]/80 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigate(userRole === "admin" ? "/admin" : "/")} 
          className="flex items-center gap-3 text-white cursor-pointer hover:opacity-80 transition-opacity"
        >
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
          <h2 className="text-white text-lg font-bold tracking-[-0.015em]">
            My Personal Chef
          </h2>
        </div>

        {/* Desktop Navigation */}
        {userRole ? (
          <nav className="hidden md:flex items-center gap-6">
            {userRole === "admin" ? (
              <>
                <button
                  onClick={() => navigate("/admin")}
                  className={`text-sm font-medium transition-colors ${
                    isActive("/admin") ? "text-[#7FFF00]" : "text-white/80 hover:text-white"
                  }`}
                >
                  Add Recipe
                </button>
                <button
                  onClick={() => navigate("/view-recipes")}
                  className={`text-sm font-medium transition-colors ${
                    isActive("/view-recipes") ? "text-[#7FFF00]" : "text-white/80 hover:text-white"
                  }`}
                >
                  View Recipes
                </button>
                <button
                  onClick={() => navigate("/admin/feedback")}
                  className={`text-sm font-medium transition-colors ${
                    isActive("/admin/feedback") ? "text-[#7FFF00]" : "text-white/80 hover:text-white"
                  }`}
                >
                  Feedback
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/")}
                  className={`text-sm font-medium transition-colors ${
                    isActive("/") || isActive("/home") ? "text-[#7FFF00]" : "text-white/80 hover:text-white"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => navigate("/recipes")}
                  className={`text-sm font-medium transition-colors ${
                    isActive("/recipes") ? "text-[#7FFF00]" : "text-white/80 hover:text-white"
                  }`}
                >
                  Recipes
                </button>
                <button
                  onClick={() => navigate("/favorites")}
                  className={`text-sm font-medium transition-colors ${
                    isActive("/favorites") ? "text-[#7FFF00]" : "text-white/80 hover:text-white"
                  }`}
                >
                  Favorites
                </button>
              </>
            )}
            
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[#7FFF00] to-[#6eee00] hover:from-[#6eee00] hover:to-[#7FFF00] text-black px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#7FFF00]/20"
            >
              Logout
            </button>
            
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7FFF00] to-[#6eee00] flex items-center justify-center border-2 border-[#7FFF00] shadow-lg shadow-[#7FFF00]/30">
              <span className="text-black font-bold text-lg">
                {getUserInitial()}
              </span>
            </div>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="text-[#7FFF00] text-sm font-bold hover:underline"
            >
              Log In
            </button>
          </nav>
        )}

        {/* Mobile Menu Button */}
        {userRole && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-[#1a3a1a] rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {userRole && mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-[#3a5a3a]/30">
          <nav className="flex flex-col gap-2 px-4 pt-4">
            {userRole === "admin" ? (
              <>
                <button
                  onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/admin") ? "bg-[#7FFF00]/20 text-[#7FFF00]" : "text-white/80 hover:bg-[#1a3a1a]"
                  }`}
                >
                  Add Recipe
                </button>
                <button
                  onClick={() => { navigate("/view-recipes"); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/view-recipes") ? "bg-[#7FFF00]/20 text-[#7FFF00]" : "text-white/80 hover:bg-[#1a3a1a]"
                  }`}
                >
                  View Recipes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { navigate("/"); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/") || isActive("/home") ? "bg-[#7FFF00]/20 text-[#7FFF00]" : "text-white/80 hover:bg-[#1a3a1a]"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => { navigate("/recipes"); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/recipes") ? "bg-[#7FFF00]/20 text-[#7FFF00]" : "text-white/80 hover:bg-[#1a3a1a]"
                  }`}
                >
                  Recipes
                </button>
                <button
                  onClick={() => { navigate("/favorites"); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/favorites") ? "bg-[#7FFF00]/20 text-[#7FFF00]" : "text-white/80 hover:bg-[#1a3a1a]"
                  }`}
                >
                  Favorites
                </button>
              </>
            )}
            
            <div className="border-t border-[#3a5a3a]/30 my-2"></div>
            
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="text-left px-4 py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-[#7FFF00] to-[#6eee00] text-black hover:from-[#6eee00] hover:to-[#7FFF00] transition-all"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
