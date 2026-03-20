import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
import {
  getAttendantLeads,
  getBotConfig,
  interveneLead,
  updateBotConfig,
} from "../src/services/endpoints";
import type { BotConfig, Lead } from "../src/types/domain";
import { getErrorMessage } from "../src/services/error";
import { MessageSquareIcon, UserIcon, LightbulbIcon } from "../components/icons";

const defaultConfig: BotConfig = {
  id: "",
  companyId: "",
  botName: "Atendente IA",
  welcomeMessage: "Oi! Sou o assistente virtual da empresa, posso ajudar?",
  toneOfVoice: "amigavel",
  instructions: null,
  isActive: true,
};

const Attendant = () => {
  const { selectedCompanyId } = useAuth();
  const { addToast } = useToast();
  const [config, setConfig] = useState<BotConfig>(defaultConfig);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const loadConfig = async () => {
    if (!selectedCompanyId) return;
    setLoadingConfig(true);
    try {
      const data = await getBotConfig(selectedCompanyId);
      setConfig(data);
    } catch (error) {
      addToast(getErrorMessage(error, "Falha ao carregar configuracao do bot"), "error");
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadLeads = async () => {
    if (!selectedCompanyId) return;
    setLoadingLeads(true);
    try {
      const data = await getAttendantLeads({ companyId: selectedCompanyId, limit: 20 });
      setLeads(data);
    } catch (error) {
      addToast(getErrorMessage(error, "Falha ao carregar leads"), "error");
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    void loadConfig();
    void loadLeads();
    const interval = setInterval(() => void loadLeads(), 10000);
    return () => clearInterval(interval);
  }, [selectedCompanyId]);

  const handleConfigSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCompanyId) return;
    setSavingConfig(true);
    try {
      const updated = await updateBotConfig(selectedCompanyId, config);
      setConfig(updated);
      addToast("Configurações salvas.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Erro ao salvar"), "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleIntervene = async (lead: Lead) => {
    if (!selectedCompanyId) return;
    try {
      await interveneLead(lead.id, selectedCompanyId);
      addToast("Bot desativado para este lead por 24h.", "info");
      await loadLeads();
    } catch (error) {
      addToast(getErrorMessage(error, "Não foi possível intervir"), "error");
    }
  };

  const liveFeed = useMemo(() => leads.slice(0, 10), [leads]);

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-[#0c111c] via-[#0d1827] to-[#0c111c] p-8 text-zinc-100 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Fase I · Atendente IA Autônomo</p>
            <h1 className="text-3xl font-black tracking-tight text-lime-300 md:text-4xl">Gestão de Leads e IA</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Ajuste a personalidade do bot, acompanhe conversas em tempo real e assuma o controle quando necessário.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-lime-200">
            <MessageSquareIcon className="h-4 w-4" /> Bot {config.isActive ? "Ativo" : "Pausado"}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100">Bot Settings</h2>
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Identidade e tom</span>
          </div>
          <form className="space-y-4" onSubmit={handleConfigSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-zinc-300">
                <span className="block font-semibold text-zinc-200">Nome do Bot</span>
                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 focus:border-lime-400 focus:outline-none"
                  value={config.botName}
                  onChange={(e) => setConfig((c) => ({ ...c, botName: e.target.value }))}
                  disabled={loadingConfig}
                />
              </label>
              <label className="space-y-2 text-sm text-zinc-300">
                <span className="block font-semibold text-zinc-200">Tom de Voz</span>
                <select
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 focus:border-lime-400 focus:outline-none"
                  value={config.toneOfVoice}
                  onChange={(e) => setConfig((c) => ({ ...c, toneOfVoice: e.target.value }))}
                  disabled={loadingConfig}
                >
                  <option value="amigavel">Amigável</option>
                  <option value="formal">Formal</option>
                  <option value="agressivo-vendas">Agressivo em vendas</option>
                  <option value="consultivo">Consultivo</option>
                </select>
              </label>
            </div>
            <label className="space-y-2 text-sm text-zinc-300">
              <span className="block font-semibold text-zinc-200">Mensagem de Boas-Vindas</span>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 focus:border-lime-400 focus:outline-none"
                value={config.welcomeMessage || ""}
                onChange={(e) => setConfig((c) => ({ ...c, welcomeMessage: e.target.value }))}
                disabled={loadingConfig}
              />
            </label>
            <label className="space-y-2 text-sm text-zinc-300">
              <span className="block font-semibold text-zinc-200">Regras de Ouro / Prompt</span>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 focus:border-lime-400 focus:outline-none"
                value={config.instructions || ""}
                onChange={(e) => setConfig((c) => ({ ...c, instructions: e.target.value }))}
                placeholder="Ex: Nunca dê desconto maior que 5% sem autorização."
                disabled={loadingConfig}
              />
            </label>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-lime-400"
                  checked={config.isActive}
                  onChange={(e) => setConfig((c) => ({ ...c, isActive: e.target.checked }))}
                />
                Bot ativo
              </label>
              <button
                type="submit"
                disabled={savingConfig}
                className="rounded-xl bg-lime-400 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-900 transition hover:opacity-90 disabled:opacity-50"
              >
                {savingConfig ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100">Live Feed</h2>
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Tempo real</span>
          </div>
          {loadingLeads ? (
            <p className="text-sm text-zinc-400">Carregando conversas...</p>
          ) : (
            <div className="space-y-3">
              {liveFeed.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum chat ativo agora.</p>
              ) : (
                liveFeed.map((lead) => {
                  const lastMsg = lead.conversations[0]?.content || "Sem mensagens ainda.";
                  return (
                    <div
                      key={lead.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-lime-400/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-bold text-zinc-200">
                            {lead.name?.[0]?.toUpperCase() || lead.externalId.slice(-2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">{lead.name || lead.externalId}</p>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                              Status: {lead.status} · Score {lead.score}
                            </p>
                          </div>
                        </div>
                        <button
                          className="rounded-lg border border-amber-400/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200 transition hover:bg-amber-400/10"
                          onClick={() => void handleIntervene(lead)}
                        >
                          Intervir
                        </button>
                      </div>
                      <p className="mt-3 text-sm text-zinc-300 line-clamp-2">{lastMsg}</p>
                      {lead.botPausedUntil ? (
                        <p className="mt-2 text-[11px] text-amber-300">
                          Bot pausado até {new Date(lead.botPausedUntil).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LightbulbIcon className="h-5 w-5 text-lime-300" />
            <h2 className="text-lg font-bold text-zinc-100">Regras de segurança</h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">IA Transparente</span>
        </div>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• A IA nunca inventa preços; se não tiver o valor no contexto, avisa que vai confirmar com um humano.</li>
          <li>• Sempre se identifica como assistente virtual da empresa.</li>
          <li>• Palavras de frustração escalam para atendimento humano e pausam o bot por 24h.</li>
        </ul>
      </section>
    </div>
  );
};

export default Attendant;
