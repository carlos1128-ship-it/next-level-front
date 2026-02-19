import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "../src/services/endpoints";

const Profile = () => {
  const { username, logout } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        setName(profile.name || "");
        setEmail(profile.email || "");
      })
      .catch(() => {
        addToast("Falha ao carregar perfil.", "error");
      });
  }, []);

  const onSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await updateUserProfile({ name, email });
      addToast("Perfil atualizado com sucesso.", "success");
    } catch {
      addToast("Não foi possível atualizar o perfil.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      addToast("Preencha senha atual e nova senha.", "info");
      return;
    }
    try {
      setSavingPassword(true);
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      addToast("Senha alterada com sucesso.", "success");
    } catch {
      addToast("Não foi possível alterar a senha.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Perfil</h1>

      <div className="bg-[#111111]/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 bg-[#181818] border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 bg-[#181818] border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={onSaveProfile}
          disabled={savingProfile}
          className="bg-[#B6FF00] text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {savingProfile ? "Salvando..." : "Salvar Perfil"}
        </button>
      </div>

      <div className="bg-[#111111]/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Trocar Senha</h2>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Senha atual"
          className="w-full bg-[#181818] border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nova senha"
          className="w-full bg-[#181818] border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2"
        />
        <button
          onClick={onChangePassword}
          disabled={savingPassword}
          className="bg-white/10 border border-zinc-300 dark:border-zinc-700 font-bold px-4 py-2 rounded-lg hover:bg-white/15 disabled:opacity-50"
        >
          {savingPassword ? "Atualizando..." : "Atualizar Senha"}
        </button>
      </div>

      <button
        onClick={logout}
        className="w-full mt-2 py-3 bg-red-600/50 border border-red-500 rounded-lg hover:bg-red-600 transition font-bold"
      >
        Sair da Conta {username ? `(${username})` : ""}
      </button>
    </div>
  );
};

export default Profile;

