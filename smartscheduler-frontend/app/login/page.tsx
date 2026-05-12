"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      router.push("/dashboard");
    } else {
      setError("E-posta veya şifre hatalı.");
    }
  };

  return (
    <div className="min-h-screen bg-darkbg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-2xl mb-4 border border-accent/20">
            <Sparkles size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white">SmartScheduler</h1>
          <p className="text-white/40 text-sm mt-1">DevArchitechs — 2025-2026</p>
        </div>

        {/* Card */}
        <div className="bg-cardbg border border-white/[0.07] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Giriş Yap</h2>
          <p className="text-white/40 text-sm mb-6">Hesabınıza erişin</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ornek@universite.edu.tr"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-white placeholder-white/20 text-sm focus:outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <span className="text-white/30 text-sm">Hesabınız yok mu? </span>
            <a href="/register" className="text-accent text-sm hover:underline">
              Kayıt Ol
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
