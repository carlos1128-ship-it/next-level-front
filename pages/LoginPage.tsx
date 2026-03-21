import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { EyeIcon, EyeOffIcon } from "../components/icons";
import { api } from "../services/api";

function getFirstString(values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

const Splash = ({ onDone }: { onDone: () => void }) => {
  const brand = "NEXT LEVEL";
  const letters = brand.split("");

  useEffect(() => {
    const timer = setTimeout(() => onDone(), 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-950" aria-label="NEXT LEVEL">
        <h1 className="text-6xl font-black tracking-tighter text-lime-500">NEXT LEVEL</h1>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-950" aria-label="NEXT LEVEL Animation">
      <div className="relative flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <div className="flex">
            {letters.slice(0, 4).map((l, i) => (
              <span
                key={`l-${i}`}
                className="splash-letter text-6xl font-black tracking-tighter text-lime-500 md:text-8xl"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {l}
              </span>
            ))}
          </div>
          <div className="flex">
            {letters.slice(5).map((l, i) => (
              <span
                key={`ll-${i}`}
                className="splash-letter text-6xl font-black tracking-tighter text-lime-500 md:text-8xl"
                style={{ animationDelay: `${500 + i * 100}ms` }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
        <p className="fade-in mt-10 text-[10px] font-black uppercase tracking-[1em] text-zinc-500" style={{ animationDelay: "1.2s" }}>
          Pronto para avancar
        </p>
      </div>
    </div>
  );
};

const AuthForm = ({
  title,
  subtitle,
  onSubmit,
  children,
  buttonText,
  loading,
  footerContent,
}: {
  title: string;
  subtitle: string;
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
  buttonText: string;
  loading: boolean;
  footerContent: React.ReactNode;
}) => (
  <div className="fade-in w-full max-w-sm">
    <div className="mb-10 text-center">
      <h1 className="text-4xl font-black tracking-tighter text-lime-500">{title}</h1>
      <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">{subtitle}</p>
    </div>
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {children}
      <div className="flex flex-col items-center">
        <button
          className="flex w-full items-center justify-center rounded-xl bg-lime-400 px-4 py-4 font-bold text-zinc-900 transition-all hover:opacity-90"
          type="submit"
          disabled={loading}
        >
          {loading ? <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-zinc-900"></div> : buttonText}
        </button>
        {footerContent}
      </div>
    </form>
    <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
      Inteligencia Estrategica e Automacao
    </p>
  </div>
);

const fieldClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:outline-none focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

const LoginPage = () => {
  const [step, setStep] = useState(0);
  const [isRegisterView, setIsRegisterView] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<{
        accessToken?: string;
        access_token?: string;
        refreshToken?: string;
        refresh_token?: string;
        user?: { name?: string; admin?: boolean };
      }>("/auth/login", {
        email,
        password,
      });
      const payload = response.data as Record<string, unknown>;
      const nestedData = (payload.data || payload.result || payload.tokens || {}) as Record<string, unknown>;
      const token = getFirstString([
        payload.access_token,
        payload.accessToken,
        payload.token,
        nestedData.access_token,
        nestedData.accessToken,
        nestedData.token,
      ]);
      const refreshToken = getFirstString([
        payload.refresh_token,
        payload.refreshToken,
        nestedData.refresh_token,
        nestedData.refreshToken,
      ]);
      if (!token) {
        throw new Error("Token nao retornado no login.");
      }
      localStorage.setItem("access_token", token);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }
      login({ name: response.data.user?.name || email, email, admin: Boolean(response.data.user?.admin) });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: any } }).response;
        const message =
          response?.data?.message ||
          response?.data?.error ||
          response?.data?.detail ||
          "Erro ao fazer login";
        setError(String(message));
      } else {
        setError(err instanceof Error ? err.message : "Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        email,
        password,
        name: name.trim(),
        companyName: name.trim(),
      });
      alert("Conta criada com sucesso. Faca login.");
      setIsRegisterView(false);
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 p-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Splash onDone={() => setStep(1)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {isRegisterView ? (
        <AuthForm
          title="NEXT LEVEL"
          subtitle="Crie sua conta estrategica"
          onSubmit={handleRegister}
          buttonText="Entrar no sistema"
          loading={loading}
          footerContent={
            <button
              type="button"
              onClick={() => {
                setIsRegisterView(false);
                resetForm();
              }}
              className="mt-6 inline-block align-baseline text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Ja tem uma conta? <span className="text-lime-500">Entrar</span>
            </button>
          }
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClassName} type="text" placeholder="Seu nome completo" />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-zinc-500">E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClassName} type="email" placeholder="seu@email.com" />
          </div>
          <div className="mb-8">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-zinc-500">Senha</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClassName} type="password" placeholder="**********" />
          </div>
          {error && <p className="mb-6 text-center text-xs font-bold uppercase text-red-500">{error}</p>}
        </AuthForm>
      ) : (
        <AuthForm
          title="NEXT LEVEL"
          subtitle="Bem-vindo de volta"
          onSubmit={handleLogin}
          buttonText="Entrar no sistema"
          loading={loading}
          footerContent={
            <button
              type="button"
              onClick={() => {
                setIsRegisterView(true);
                resetForm();
              }}
              className="mt-6 inline-block align-baseline text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Nao tem uma conta? <span className="text-lime-500">Criar conta</span>
            </button>
          }
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-zinc-500">E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClassName} type="email" placeholder="seu@email.com" />
          </div>
          <div className="relative mb-8">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-zinc-500">Senha</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClassName}
              type={showPassword ? "text" : "password"}
              placeholder="**********"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-7 flex items-center pr-4 text-zinc-500"
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {error && <p className="mb-6 text-center text-xs font-bold uppercase text-red-500">{error}</p>}
        </AuthForm>
      )}
    </div>
  );
};

export default LoginPage;



