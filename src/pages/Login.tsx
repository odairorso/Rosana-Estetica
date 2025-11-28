import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    const siteUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || (typeof window !== "undefined" ? window.location.origin : undefined);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: siteUrl },
    });
    setLoading(false);
    if (error) {
      const msg = error.message || "Erro no cadastro";
      setError(msg);
      if (msg.toLowerCase().includes("registered") || msg.toLowerCase().includes("cadastrado")) {
        setInfo("Usuário já cadastrado. Faça login.");
        setMode("login");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Informe seu e-mail para recuperar a senha");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    const siteUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || (typeof window !== "undefined" ? window.location.origin : undefined);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl ? `${siteUrl}/reset-password` : undefined });
    setLoading(false);
    if (error) setError(error.message); else setInfo("Verifique seu e-mail para redefinir a senha");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900/50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === "login" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("login")}
            >Entrar</Button>
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("signup")}
            >Cadastrar</Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (loading || !email || !password) return;
              if (mode === "login") handleLogin(); else handleSignup();
            }}
            className="space-y-3"
          >
            <Input
              type="email"
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              type="password"
              placeholder="sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {info && <p className="text-green-600 text-sm">{info}</p>}
            <Button type="submit" className="w-full" disabled={loading || !email || !password}>
              {mode === "login" ? (loading ? "Entrando..." : "Entrar") : (loading ? "Cadastrando..." : "Cadastrar")}
            </Button>
          </form>
          <div className="mt-3 text-center">
            <button className="text-sm text-muted-foreground underline" onClick={handleForgotPassword} disabled={loading}>
              Esqueci minha senha
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}