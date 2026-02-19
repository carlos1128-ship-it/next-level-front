import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { EyeIcon, EyeOffIcon } from '../components/icons';
import { API_URL, apiRequest } from '../services/api';

const Splash = ({ onDone }: { onDone: () => void }) => {
  const brand = "NEXT LEVEL";
  const letters = brand.split("");

  useEffect(() => {
    const totalDuration = 3500; 
    const timer = setTimeout(() => onDone(), totalDuration);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return (
      <div className="absolute inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center z-50" aria-label="NEXT LEVEL">
        <h1 className="text-6xl font-black text-[#B6FF00] text-neon tracking-tighter">NEXT LEVEL</h1>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center z-50" aria-label="NEXT LEVEL Animation">
      <div className="relative flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <div className="flex">
            {letters.slice(0, 4).map((l, i) => {
              let delay = 0;
              if (i > 0) delay = 300 + 120 + (i - 1) * 120;
              return (
                <span 
                  key={`l-${i}`} 
                  className="splash-letter text-6xl md:text-8xl font-black text-[#B6FF00] text-neon tracking-tighter" 
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {l}
                </span>
              );
            })}
          </div>
          <div className="flex">
            {letters.slice(5).map((l, i) => {
              const delay = 960 + i * 120;
              return (
                <span 
                  key={`ll-${i}`} 
                  className="splash-letter text-6xl md:text-8xl font-black text-[#B6FF00] text-neon tracking-tighter" 
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {l}
                </span>
              );
            })}
          </div>
        </div>
        <p className="text-zinc-500 mt-10 tracking-[1em] text-[10px] font-black uppercase fade-in" style={{ animationDelay: '2s' }}>
          Pronto para avançar
        </p>
      </div>
    </div>
  );
};

const AuthForm = ({ title, subtitle, onSubmit, children, buttonText, loading, footerContent }: {
    title: string;
    subtitle: string;
    onSubmit: (e: React.FormEvent) => void;
    children?: React.ReactNode;
    buttonText: string;
    loading: boolean;
    footerContent: React.ReactNode;
}) => (
    <div className="w-full max-w-sm fade-in">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-[#B6FF00] text-neon tracking-tighter">{title}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm font-medium">{subtitle}</p>
        </div>
        <form onSubmit={onSubmit} className="bg-[#121212] p-8 rounded-2xl border border-white/5 shadow-2xl">
            {children}
            <div className="flex flex-col items-center">
                <button className="w-full bg-[#B6FF00] text-black font-bold py-4 px-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center neon-glow" type="submit" disabled={loading}>
                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div> : buttonText}
                </button>
                {footerContent}
            </div>
        </form>
        <p className="text-center text-gray-700 text-[10px] uppercase font-bold tracking-widest mt-10">Inteligência Estratégica & Automação</p>
    </div>
);

const LoginPage = () => {
  const [step, setStep] = useState(0);
  const [isRegisterView, setIsRegisterView] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Erro ao fazer login');
      }

      const data = await response.json();
      localStorage.setItem('token', data.accessToken);
      login(data.user?.name || email);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          companyName: name,
        }),
      });
      alert('Conta criada com sucesso! Faça login.');
      setIsRegisterView(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (step === 0) return <Splash onDone={() => setStep(1)} />;
    
    return isRegisterView ? (
        <AuthForm
            title="NEXT LEVEL"
            subtitle="Crie sua conta estratégica"
            onSubmit={handleRegister}
            buttonText="→ Começar agora"
            loading={loading}
            footerContent={
                <button type="button" onClick={() => { setIsRegisterView(false); resetForm(); }} className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-zinc-900 dark:hover:text-zinc-100 mt-6 transition-colors">
                    Já tem uma conta? <span className="text-[#B6FF00]">Entrar</span>
                </button>
            }
        >
            <div className="mb-4">
                <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1.5">Nome</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#181818] border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#B6FF00]" type="text" placeholder="Seu nome completo" />
            </div>
            <div className="mb-4">
                <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1.5">E-mail</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#181818] border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#B6FF00]" type="email" placeholder="seu@email.com" />
            </div>
            <div className="mb-8">
                <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1.5">Senha</label>
                <input value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#181818] border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#B6FF00]" type="password" placeholder="••••••••••" />
            </div>
            {error && <p className="text-red-500 text-xs text-center mb-6 font-bold uppercase">{error}</p>}
        </AuthForm>
    ) : (
         <AuthForm
            title="NEXT LEVEL"
            subtitle="Bem-vindo de volta ao comando"
            onSubmit={handleLogin}
            buttonText="→ Entrar no sistema"
            loading={loading}
            footerContent={
                 <button type="button" onClick={() => { setIsRegisterView(true); resetForm(); }} className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-zinc-900 dark:hover:text-zinc-100 mt-6 transition-colors">
                    Não tem uma conta? <span className="text-[#B6FF00]">Criar conta</span>
                </button>
            }
        >
            <div className="mb-4">
                <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1.5">E-mail</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#181818] border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#B6FF00]" type="email" placeholder="seu@email.com" />
            </div>
            <div className="mb-8 relative">
                <label className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1.5">Senha</label>
                <input value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#181818] border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#B6FF00]" type={showPassword ? "text" : "password"} placeholder="••••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 pr-4 flex items-center text-gray-500">
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs text-center mb-6 font-bold uppercase">{error}</p>}
        </AuthForm>
    )
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex items-center justify-center p-4">
      {renderContent()}
    </div>
  );
};

export default LoginPage;

