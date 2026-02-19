import React, { useEffect, useMemo, useState } from "react";
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

const PIE_COLORS = ["#B6FF00", "#9AD400", "#7FAA00", "#638100"];

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

const KpiCard: React.FC<
  KpiCardProps & { insight?: string; numericValue?: number; isMoney?: boolean }
> = ({ title, value, change, changeType, icon: Icon, color, insight }) => {
  const { addToast } = useToast();
  return (
    <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 transition-all duration-300 group hover:border-[#B6FF00]/30 hover:bg-[#181818] relative overflow-hidden">
      <div className="absolute -right-2 -top-2 w-16 h-16 bg-[#B6FF00]/5 rounded-full blur-2xl group-hover:bg-[#B6FF00]/10 transition-all" />
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-black/50 border border-white/5 group-hover:border-[#B6FF00]/20 transition-all">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      <div
        className={`flex items-center text-[11px] font-bold mt-2 ${
          changeType === "increase" ? "text-[#B6FF00]" : "text-red-500"
        }`}
      >
        {changeType === "increase" ? (
          <ArrowUpRightIcon className="w-3.5 h-3.5 mr-1" />
        ) : (
          <ArrowDownRightIcon className="w-3.5 h-3.5 mr-1" />
        )}
        {change} <span className="text-gray-600 ml-1 font-medium">vs. período anterior</span>
      </div>
      {insight ? (
        <button
          onClick={() => addToast(insight, "info")}
          className="absolute top-3 right-3 p-1 hover:bg-[#B6FF00]/10 rounded-full transition-colors"
          aria-label="Ver insight"
        >
          <LightbulbIcon className="w-3.5 h-3.5 text-[#B6FF00]" />
        </button>
      ) : null}
    </div>
  );
};

const Dashboard = () => {
  const { username, detailLevel } = useAuth();
  const { addToast } = useToast();
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [aiInsight, setAiInsight] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState(false);

  const hasChartData = summary.lineData.length > 0 || summary.pieData.length > 0;

  const formattedInsight = useMemo(() => normalizeAiText(aiInsight), [aiInsight]);
  const longInsight = formattedInsight.length > 280;
  const displayedInsight =
    longInsight && !expandedInsight ? `${formattedInsight.slice(0, 280)}...` : formattedInsight;

  const runAnalyze = async (payload: DashboardSummary) => {
    try {
      const response = await analyzeData(payload, detailLevel);
      const text =
        typeof response === "string"
          ? response
          : response.analysis || response.insight || response.message || "";
      setAiInsight(normalizeAiText(text));
    } catch {
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
      await runAnalyze(normalized);
    } catch {
      setSummary(EMPTY_SUMMARY);
      setAiInsight("");
      addToast("Não foi possível carregar o dashboard.", "error");
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
    } catch {
      addToast("Falha ao exportar CSV.", "error");
    }
  };

  return (
    <div className="space-y-8 overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Visão Geral</h1>
          <p className="text-gray-500 font-medium mt-1">
            Olá, {username || "usuário"}. Aqui está seu panorama estratégico.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 md:flex-none bg-[#121212] border border-white/5 text-white font-bold text-[10px] uppercase tracking-widest py-3.5 px-6 rounded-xl hover:bg-white/5 transition-all"
          >
            Exportar CSV
          </button>
          <button
            onClick={loadSummary}
            disabled={isUpdating}
            className={`flex-1 md:flex-none bg-[#B6FF00] text-black font-black text-[10px] uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all neon-glow ${
              isUpdating ? "opacity-50" : "hover:opacity-90"
            }`}
          >
            {isUpdating ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Faturamento"
          value={asCurrency(summary.revenue)}
          change="0%"
          changeType="increase"
          icon={DollarSignIcon}
          color="text-[#B6FF00]"
        />
        <KpiCard
          title="Taxa de Conversão"
          value={asPercent(summary.conversion)}
          change="0%"
          changeType="increase"
          icon={BarChartIcon}
          color="text-blue-400"
        />
        <KpiCard
          title="CAC Médio"
          value={asCurrency(summary.cac)}
          change="0%"
          changeType="decrease"
          icon={DollarSignIcon}
          color="text-red-400"
        />
        <KpiCard
          title="Taxa de Retenção"
          value={asPercent(summary.retention)}
          change="0%"
          changeType="increase"
          icon={BarChartIcon}
          color="text-purple-400"
        />
      </div>

      {!hasChartData ? (
        <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 text-center text-gray-400">
          Nenhum dado disponível ainda. Adicione transações no fluxo financeiro para popular o
          dashboard.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          <div className="lg:col-span-2 bg-[#121212] p-8 rounded-3xl border border-white/5 relative overflow-hidden min-h-0">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-xl font-black tracking-tighter">Atividade</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Dados Reais
              </span>
            </div>
            <div className="w-full relative z-10 min-h-0">
              {summary.lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={summary.lineData}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#777"
                      fontSize={10}
                      fontWeight="900"
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#777"
                      fontSize={10}
                      fontWeight="900"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#181818",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "16px",
                        fontSize: "10px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Vendas"
                      stroke="#B6FF00"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] grid place-items-center text-gray-500 text-sm">
                  Sem histórico para o período.
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 flex flex-col items-center">
            <h3 className="text-xl font-black tracking-tighter mb-8 text-center">Mix de Produtos</h3>
            <div className="w-full">
              {summary.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={summary.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {summary.pieData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#181818",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "10px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] grid place-items-center text-gray-500 text-sm">
                  Sem distribuição disponível.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#B6FF00]/10 text-[#B6FF00]">
              <LightbulbIcon className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black tracking-tighter">Insight Estratégico</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line break-words">
            {displayedInsight || "Ainda sem insight gerado para os dados atuais."}
          </p>
          {longInsight ? (
            <button
              onClick={() => setExpandedInsight((v) => !v)}
              className="mt-3 text-xs font-bold text-[#B6FF00] hover:underline"
            >
              {expandedInsight ? "Ver menos" : "Ver mais"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
