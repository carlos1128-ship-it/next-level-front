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

interface InsightCardProps {
  title: string;
  description: string;
  category: string;
  color: "green" | "blue" | "purple" | "red";
}

const InsightCard: React.FC<InsightCardProps> = ({ title, description, category, color }) => {
  const colorClasses = {
    green: "border-green-500/50 bg-green-500/5",
    blue: "border-blue-500/50 bg-blue-500/5",
    purple: "border-purple-500/50 bg-purple-500/5",
    red: "border-red-500/50 bg-red-500/5",
  };

  const textColors = {
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    red: "text-red-400",
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color]}`}>
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${textColors[color]}`}>
        {category}
      </span>
      <h3 className="font-black text-lg mt-1 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-400 mt-2 leading-relaxed whitespace-pre-line break-words">
        {description}
      </p>
    </div>
  );
};

const Insights = () => {
  const { addToast } = useToast();
  const [historyInsights, setHistoryInsights] = useState<InsightCardProps[]>([]);

  useEffect(() => {
    const loadAiHistory = async () => {
      try {
        const { data } = await api.get("/api/ai/history");
        const parsed = Array.isArray(data)
          ? data
              .map((item: any) => ({
                title: item?.title ?? "Insight da IA",
                description: item?.description ?? item?.content ?? "",
                category: item?.category ?? "Sugestão da IA",
                color: (item?.color ?? "purple") as InsightCardProps["color"],
              }))
              .filter((item: InsightCardProps) => item.description)
          : [];

        setHistoryInsights(parsed);
      } catch {
        setHistoryInsights([]);
        addToast("Falha ao carregar insights.", "error");
      }
    };

    loadAiHistory();
  }, []);

  const chartData = useMemo(() => {
    const bucket: Record<string, number> = {};
    historyInsights.forEach((i) => {
      bucket[i.category] = (bucket[i.category] || 0) + 1;
    });
    return Object.entries(bucket).map(([name, total]) => ({ name, total }));
  }, [historyInsights]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Insights Estratégicos</h1>
        <p className="text-gray-500 mt-2">Análise baseada em dados reais da sua operação.</p>
      </header>

      {historyInsights.length === 0 ? (
        <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 text-gray-400 text-center">
          Ainda não há insights gerados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {historyInsights.map((insight) => (
            <InsightCard key={`${insight.title}-${insight.category}`} {...insight} />
          ))}
        </div>
      )}

      <div className="bg-[#121212] p-8 rounded-3xl border border-white/5">
        <h3 className="text-xl font-black tracking-tighter mb-8">Distribuição por Categoria</h3>
        <div className="h-[350px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#aaa" fontSize={11} />
                <YAxis stroke="#aaa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#181818",
                    border: "none",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="total" fill="#B6FF00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full grid place-items-center text-gray-500">
              Sem dados para gráfico.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
