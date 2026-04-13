import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.name) {
        localStorage.setItem("userName", data.name);
      }
      localStorage.setItem("userEmail", String(email || "").trim().toLowerCase());
      onLogin(data.role);
    } catch (error) {
      console.error("Login error:", error);
      setError("Cannot connect to server. Please make sure the backend is running.");
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/login-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background-dark/85 backdrop-blur-[2px]"></div>
      </div>

      {/* SIMPLE HEADER FOR LOGIN PAGE */}
      <header className="w-full border-b border-[#2c3928]/50 bg-background-dark/30 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
            <h2 className="text-white text-lg font-bold tracking-[-0.015em]">
              My Personal Chef
            </h2>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[440px] bg-[#142210] border border-[#2c3928] rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome</h1>
          <p className="text-[#a3b99d] text-center mb-6">
            Log in to access your saved recipes.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email or Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3b99d]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </div>
                <input
                  className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-12 text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3b99d]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M12 17v-2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </div>
                <input
                  className="w-full h-12 rounded-lg bg-[#1e271c] border border-[#2c3928] px-12 text-white placeholder-[#6b7c65] focus:outline-none focus:border-primary"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3b99d] hover:text-white"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2c3928] bg-[#1e271c] text-primary focus:ring-primary"
                />
                <span className="text-sm text-[#a3b99d]">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot Password?
              </button>
            </div>

            <button className="h-12 bg-primary text-background-dark font-bold rounded-lg hover:bg-[#6eee00] transition-colors flex items-center justify-center gap-2">
              Log In
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2c3928]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#142210] text-[#a3b99d]">OR</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#a3b99d]">
              Don't have an account?{" "}
              <button 
                onClick={() => window.location.href = "/signup"}
                className="text-primary font-semibold hover:underline"
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 w-full py-6 text-center">
        <p className="text-sm text-[#a3b99d]">
          © 2025 My Personal Chef. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Login;
