import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { KpiCardProps } from "../types";
import { useAuth } from "../App";
import {
  DollarSignIcon,
  BarChartIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  LightbulbIcon,
} from "../components/icons";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../src/services/error";
import {
  analyzeData,
  exportFinancialCsv,
  getDashboardSummary,
} from "../src/services/endpoints";
import type { DashboardSummary } from "../src/types/domain";

const EMPTY_SUMMARY: DashboardSummary = {
  revenue: 0,
  conversion: 0,
  cac: 0,
  retention: 0,
  lineData: [],
  pieData: [],
};

const PIE_COLORS = ["#B6FF00", "#87B900", "#6D9200", "#547100"];
const PERIODS = ["Hoje", "Ontem", "Semana", "Mes", "Ano"];
const ANALYZE_COOLDOWN_KEY = "dashboard_ai_analyze_cooldown_until";
const ANALYZE_COOLDOWN_MS = 5 * 60 * 1000;

const asCurrency = (value: number) =>
  `R$ ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const asPercent = (value: number) => `${Number(value || 0).toFixed(1)}%`;

const normalizeAiText = (raw: string) => {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(lines));
  return unique.join("\n");
};

const hasUsefulSummaryData = (summary: DashboardSummary) => {
  if ((summary.revenue || 0) > 0) return true;
  if ((summary.cac || 0) > 0) return true;
  if ((summary.conversion || 0) > 0) return true;
  if ((summary.retention || 0) > 0) return true;
  if (Array.isArray(summary.lineData) && summary.lineData.length > 0) return true;
  if (Array.isArray(summary.pieData) && summary.pieData.length > 0) return true;
  return false;
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const values = Object.fromEntries(payload.map((entry) => [entry.dataKey, entry.value]));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 px-3 py-2 text-xs text-zinc-200 shadow-2xl">
      <p className="mb-1 text-zinc-400">{label}</p>
      <p className="font-bold text-lime-400">Picos : {values.Picos || 0}</p>
      <p className="font-bold text-lime-300">Vendas : {values.Vendas || 0}</p>
    </div>
  );
};

const KpiCard: React.FC<
  KpiCardProps & { iconAccent?: string }
> = ({ title, value, change, changeType, icon: Icon, color, iconAccent }) => {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:border-lime-400/40">
      <div className="mb-4 flex items-start justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
          {title}
        </span>
        <div className="rounded-xl border border-zinc-800 bg-black/60 p-2">
          <Icon className={`h-5 w-5 ${iconAccent || color}`} />
        </div>
      </div>
      <p className="text-3xl font-black tracking-tighter text-zinc-100 md:text-4xl">{value}</p>
      <div
        className={`mt-2 flex items-center text-[11px] font-black ${
          changeType === "increase" ? "text-lime-400" : "text-red-500"
        }`}
      >
        {changeType === "increase" ? (
          <ArrowUpRightIcon className="mr-1 h-3.5 w-3.5" />
        ) : (
          <ArrowDownRightIcon className="mr-1 h-3.5 w-3.5" />
        )}
        {change} <span className="ml-1 font-medium text-zinc-500">vs. periodo anterior</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { username, detailLevel } = useAuth();
  const { addToast } = useToast();
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [aiInsight, setAiInsight] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activePeriod, setActivePeriod] = useState("Hoje");

  const formattedInsight = useMemo(() => normalizeAiText(aiInsight), [aiInsight]);

  const chartData = useMemo(() => {
    if (!summary.lineData.length) {
      return [
        { name: "08:00", Vendas: 12, Picos: 20 },
        { name: "10:00", Vendas: 18, Picos: 28 },
        { name: "12:00", Vendas: 4, Picos: 10 },
        { name: "14:00", Vendas: 6, Picos: 8 },
        { name: "16:00", Vendas: 3, Picos: 18 },
        { name: "18:00", Vendas: 4, Picos: 24 },
        { name: "20:00", Vendas: 10, Picos: 16 },
      ];
    }
    return summary.lineData.map((item) => ({
      name: item.name,
      Vendas: Number(item.Vendas || 0),
      Picos: typeof item.Picos === "number" ? item.Picos : Number(item.Vendas || 0) * 1.5,
    }));
  }, [summary.lineData]);

  const pieData = useMemo(() => {
    if (!summary.pieData.length) {
      return [
        { name: "PREMIUM", value: 36 },
        { name: "STANDARD", value: 28 },
        { name: "LITE", value: 20 },
        { name: "CUSTOM", value: 16 },
      ];
    }
    return summary.pieData;
  }, [summary.pieData]);
  const hasChartData = chartData.length > 0 || pieData.length > 0;

  const runAnalyze = async (payload: DashboardSummary) => {
    const cooldownUntil = Number(localStorage.getItem(ANALYZE_COOLDOWN_KEY) || 0);
    if (cooldownUntil > Date.now()) return;

    try {
      const response = await analyzeData(payload, detailLevel);
      const text =
        typeof response === "string"
          ? response
          : response.analysis || response.insight || response.message || "";
      localStorage.removeItem(ANALYZE_COOLDOWN_KEY);
      setAiInsight(normalizeAiText(text));
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      const message = getErrorMessage(error, "").toLowerCase();
      if (status === 429 || message.includes("limite da ia") || message.includes("quota")) {
        localStorage.setItem(ANALYZE_COOLDOWN_KEY, String(Date.now() + ANALYZE_COOLDOWN_MS));
      }
      setAiInsight("");
    }
  };

  const loadSummary = async () => {
    setIsUpdating(true);
    try {
      const data = await getDashboardSummary();
      const normalized: DashboardSummary = {
        ...EMPTY_SUMMARY,
        ...data,
        lineData: Array.isArray(data?.lineData) ? data.lineData : [],
        pieData: Array.isArray(data?.pieData) ? data.pieData : [],
      };
      setSummary(normalized);
      if (hasUsefulSummaryData(normalized)) {
        await runAnalyze(normalized);
      } else {
        setAiInsight("");
      }
    } catch (error) {
      setSummary(EMPTY_SUMMARY);
      setAiInsight("");
      addToast(getErrorMessage(error, "Nao foi possivel carregar o dashboard."), "error");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [detailLevel]);

  useEffect(() => {
    const onTransactionsUpdated = () => {
      loadSummary();
    };
    window.addEventListener("transactions:updated", onTransactionsUpdated);
    return () => window.removeEventListener("transactions:updated", onTransactionsUpdated);
  }, []);

  const handleExport = async () => {
    try {
      const blob = await exportFinancialCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "financial-export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      addToast("CSV exportado com sucesso.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Falha ao exportar CSV."), "error");
    }
  };

  return (
    <div className="space-y-7 overflow-x-hidden">
      <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-100 md:text-5xl">Visao Geral</h1>
          <p className="mt-2 text-base font-medium text-zinc-400 md:text-lg">
            Ola, {username || "Usuario"}. Aqui esta o panorama estrategico de hoje.
          </p>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-7 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100 transition hover:bg-zinc-900 md:flex-none"
          >
            Exportar Dados
          </button>
          <button
            onClick={loadSummary}
            disabled={isUpdating}
            className={`flex-1 rounded-2xl bg-lime-400 px-7 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 transition ${
              isUpdating ? "opacity-50" : "hover:opacity-90"
            } md:flex-none`}
          >
            {isUpdating ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {PERIODS.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`rounded-2xl px-6 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition ${
              activePeriod === period
                ? "bg-lime-400 text-zinc-900"
                : "border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Faturamento"
          value={asCurrency(summary.revenue)}
          change="12.5%"
          changeType="increase"
          icon={DollarSignIcon}
          color="text-lime-400"
        />
        <KpiCard
          title="Taxa de Conversao"
          value={asPercent(summary.conversion)}
          change="8.3%"
          changeType="increase"
          icon={BarChartIcon}
          color="text-blue-400"
        />
        <KpiCard
          title="CAC Medio"
          value={asCurrency(summary.cac)}
          change="2.1%"
          changeType="decrease"
          icon={DollarSignIcon}
          color="text-red-500"
        />
        <KpiCard
          title="Taxa de Retencao"
          value={asPercent(summary.retention)}
          change="5.0%"
          changeType="increase"
          icon={BarChartIcon}
          color="text-purple-400"
        />
      </div>

      {!hasChartData ? (
        <div className="grid place-items-center rounded-3xl border border-zinc-900 bg-zinc-950 p-10 text-zinc-500">
          Nenhum dado disponivel ainda.
        </div>
      ) : (
        <div className="grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="relative min-h-0 overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950 p-7 xl:col-span-2">
            <div className="relative z-10 mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tighter text-zinc-100 md:text-3xl">Atividade por Hora</h3>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                Monitoramento Ativo
              </span>
            </div>
            <div className="relative z-10 min-h-0 min-w-0">
              <ResponsiveContainer width="100%" minWidth={280} minHeight={260} height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="5 5" stroke="#1f2937" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#52525b"
                    fontSize={11}
                    fontWeight="800"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={11}
                    fontWeight="800"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#B6FF00", strokeDasharray: "4 4" }} />
                  <Line
                    type="monotone"
                    dataKey="Picos"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 6"
                  />
                  <Line
                    type="monotone"
                    dataKey="Vendas"
                    stroke="#B6FF00"
                    strokeWidth={4}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col items-center rounded-3xl border border-zinc-900 bg-zinc-950 p-7">
            <h3 className="mb-8 text-2xl font-black tracking-tighter text-zinc-100 md:text-3xl">Mix de Produtos</h3>
            <div className="w-full min-w-0">
              <ResponsiveContainer width="100%" minWidth={240} minHeight={220} height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={7}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid w-full grid-cols-2 gap-y-2 text-xs font-bold uppercase tracking-[0.1em] text-zinc-300">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start gap-6 rounded-3xl border border-zinc-900 bg-zinc-950 p-7 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-lime-400/15 p-2 text-lime-400">
              <LightbulbIcon className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-black tracking-tighter text-zinc-100 md:text-3xl">Insight Estrategico</h3>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300 md:text-base">
            {formattedInsight || "Seu volume de vendas aumentou nos canais digitais. Recomendamos otimizar a alocacao de verba em Meta Ads para os horarios de pico (20h-22h)."}
          </p>
        </div>
        <Link
          to="/insights"
          className="rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-100 transition hover:border-lime-400/40"
        >
          Ver Insights Completos
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
