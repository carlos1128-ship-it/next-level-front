import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";

interface InsightCardProps {
  title: string;
  description: string;
  category: string;
  color: "green" | "blue" | "purple" | "red";
}

const InsightCard: React.FC<InsightCardProps> = ({ title, description, category, color }) => {
  const colorClasses = {
    green: "border-green-500/40 bg-green-500/5",
    blue: "border-blue-500/40 bg-blue-500/5",
    purple: "border-purple-500/40 bg-purple-500/5",
    red: "border-red-500/40 bg-red-500/5",
  };

  const textColors = {
    green: "text-green-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
    red: "text-red-500",
  };

  return (
    <div className={`rounded-2xl border p-6 ${colorClasses[color]}`}>
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${textColors[color]}`}>
        {category}
      </span>
      <h3 className="mt-1 text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
};

const Insights = () => {
  const { addToast } = useToast();
  const [historyInsights, setHistoryInsights] = useState<InsightCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAiHistory = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const { data } = await api.get("/api/ai/history");
      const parsed = Array.isArray(data)
        ? data
            .map((item: any) => ({
              title: item?.title ?? "Insight da IA",
              description: item?.description ?? item?.content ?? "",
              category: item?.category ?? "Sugestao da IA",
              color: (item?.color ?? "purple") as InsightCardProps["color"],
            }))
            .filter((item: InsightCardProps) => item.description)
        : [];

      setHistoryInsights(parsed);
    } catch {
      setHistoryInsights([]);
      setLoadError("Nao foi possivel carregar os insights.");
      addToast("Falha ao carregar insights.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiHistory();
  }, []);

  const chartData = useMemo(() => {
    const bucket: Record<string, number> = {};
    (Array.isArray(historyInsights) ? historyInsights : []).forEach((i) => {
      bucket[i.category] = (bucket[i.category] || 0) + 1;
    });
    return Object.entries(bucket).map(([name, total]) => ({ name, total }));
  }, [historyInsights]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">Insights Estrategicos</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Analise baseada em dados reais da sua operacao.</p>
      </header>

      {loading ? (
        <LoadingState label="Carregando insights..." />
      ) : loadError ? (
        <ErrorState
          title="Erro ao carregar insights"
          description={loadError}
          actionLabel="Tentar novamente"
          onAction={loadAiHistory}
        />
      ) : historyInsights.length === 0 ? (
        <EmptyState
          title="Ainda nao ha insights gerados"
          description="Interaja com o dashboard e o chat para gerar historico de insights."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {(Array.isArray(historyInsights) ? historyInsights : []).map((insight) => (
            <InsightCard key={`${insight.title}-${insight.category}`} {...insight} />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-8 text-xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">Distribuicao por Categoria</h3>
        <div className="h-[350px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a1a1aa" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" />
                <Tooltip />
                <Bar dataKey="total" fill="#84cc16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-zinc-500 dark:text-zinc-400">Sem dados para grafico.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
