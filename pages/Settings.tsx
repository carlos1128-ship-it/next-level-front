import React, { useState } from "react";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
import { updateUserProfile } from "../src/services/endpoints";
import type { DetailLevel } from "../src/types/domain";

const Settings = () => {
  const { detailLevel, setDetailLevel, theme, setTheme } = useAuth();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleThemeToggle = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      setSaving(true);
      await updateUserProfile({ theme: nextTheme });
      addToast("Tema atualizado.", "success");
    } catch {
      setTheme(theme);
      addToast("Falha ao salvar tema.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDetailChange = async (value: DetailLevel) => {
    const previous = detailLevel;
    setDetailLevel(value);
    try {
      setSaving(true);
      await updateUserProfile({ detailLevel: value });
      addToast("Nível de detalhamento atualizado.", "success");
    } catch {
      setDetailLevel(previous);
      addToast("Falha ao salvar nível de detalhamento.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-black tracking-tighter">Configurações</h1>

      <div className="bg-[#121212] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="font-bold">Tema</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Alterna entre modo claro e escuro.</p>
          </div>
          <button
            onClick={handleThemeToggle}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-black/40 border border-zinc-300 dark:border-zinc-700 hover:border-[#B6FF00]/40 transition text-sm font-bold"
          >
            {theme === "dark" ? "Mudar para Claro" : "Mudar para Escuro"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="font-bold">Nível de Detalhamento</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Define o tamanho e profundidade das respostas da IA.
            </p>
          </div>
          <select
            value={detailLevel}
            onChange={(e) => handleDetailChange(e.target.value as DetailLevel)}
            disabled={saving}
            className="bg-[#181818] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#B6FF00]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;

