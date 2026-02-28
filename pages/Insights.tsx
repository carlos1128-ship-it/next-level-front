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
import { getErrorMessage } from "../src/services/error";
import { useToast } from "../components/Toast";
import { LoadingState } from "../components/AsyncState";

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
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    red: "text-red-400",
  };

  return (
    <div className={`rounded-3xl border p-6 ${colorClasses[color]}`}>
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${textColors[color]}`}>
        {category}
      </span>
      <h3 className="mt-2 text-3xl font-black tracking-tight text-zinc-100">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-zinc-300">{description}</p>
    </div>
  );
};

const fallbackCards: InsightCardProps[] = [
  {
    title: "Mercado Sustentavel em Alta",
    description: "O mercado de moda sustentavel cresceu 25% no ultimo trimestre. Considere adicionar uma linha de produtos ecologicos.",
    category: "Oportunidade",
    color: "green",
  },
  {
    title: "Busca por Produtos Customizaveis",
    description: "Houve um aumento de 40% nas buscas por produtos customizaveis. Ferramentas de personalizacao podem elevar o LTV.",
    category: "Tendencia",
    color: "blue",
  },
  {
    title: "Horario de pico: 20h-22h",
    description: "Seu engajamento e maior no inicio da noite. Recomendamos programar anuncios estrategicos para este intervalo.",
    category: "Sugestao da IA",
    color: "purple",
  },
  {
    title: "Campanha Frete Gratis da Concorrencia",
    description: "Monitore o impacto da nova politica do seu principal concorrente. Considere uma campanha de cashback como resposta.",
    category: "Ameaca",
    color: "red",
  },
];

const benchmarkData = [
  { name: "E-commerce", total: 18 },
  { name: "Industria", total: 7 },
  { name: "Servicos", total: 12 },
  { name: "Tecnologia", total: 25 },
];

const Insights = () => {
  const { addToast } = useToast();
  const [historyInsights, setHistoryInsights] = useState<InsightCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAiHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/ai/history");
      const parsed = Array.isArray(data)
        ? data
            .map((item: any, index: number) => ({
              title: item?.title ?? "Insight da IA",
              description: item?.description ?? item?.content ?? "",
              category: item?.category ?? "Sugestao da IA",
              color: (["green", "blue", "purple", "red"][index % 4] as InsightCardProps["color"]),
            }))
            .filter((item: InsightCardProps) => item.description)
        : [];

      setHistoryInsights(parsed);
    } catch (error) {
      setHistoryInsights([]);
      addToast(getErrorMessage(error, "Nao foi possivel carregar os insights."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiHistory();
  }, []);

  const cards = useMemo(() => {
    if (historyInsights.length >= 4) return historyInsights.slice(0, 4);
    return fallbackCards;
  }, [historyInsights]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-6xl font-black tracking-tighter text-zinc-100">Insights</h1>
        <p className="mt-2 text-xl text-zinc-400">Analise orientada por dados e monitoramento competitivo.</p>
      </header>

      {loading ? <LoadingState label="Carregando insights..." /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {cards.map((insight) => (
          <InsightCard key={`${insight.title}-${insight.category}`} {...insight} />
        ))}
      </div>

      <div className="rounded-3xl border border-zinc-900 bg-zinc-950 p-8">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-4xl font-black tracking-tighter text-zinc-100">Benchmark por Setor (30 dias)</h3>
          <span className="rounded-xl bg-lime-400/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
            Analise Global
          </span>
        </div>
        <div className="h-[360px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={260}>
            <BarChart layout="vertical" data={benchmarkData} margin={{ left: 20, right: 25 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#52525b" />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" width={110} />
              <Tooltip />
              <Bar dataKey="total" fill="#B6FF00" radius={[6, 6, 6, 6]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
          Os dados acima sao baseados em tendencias agregadas do ecossistema Next Level.
        </p>
      </div>
    </div>
  );
};

export default Insights;
