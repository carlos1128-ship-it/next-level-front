import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../src/services/error";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";
import { exportFinancialCsv, getFinancialReport, getTransactions } from "../src/services/endpoints";
import type { TransactionItem } from "../src/types/domain";
import { useAuth } from "../App";

const asCurrency = (value: number) =>
  `R$ ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatCompactCurrency = (value: number) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });

const Reports = () => {
  const { selectedCompanyId } = useAuth();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    if (!selectedCompanyId) {
      setTransactions([]);
      setTotals({ income: 0, expense: 0, balance: 0 });
      setLoadError("Selecione uma empresa para gerar o relatorio.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const [data, report] = await Promise.all([
        getTransactions(selectedCompanyId),
        getFinancialReport(selectedCompanyId),
      ]);
      setTransactions(Array.isArray(data) ? data : []);
      setTotals(report);
    } catch (error) {
      setTransactions([]);
      setTotals({ income: 0, expense: 0, balance: 0 });
      const message = getErrorMessage(error, "Nao foi possivel carregar o relatorio.");
      setLoadError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedCompanyId]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const chartData = useMemo(() => {
    const map = new Map<string, { name: string; Receita: number; Despesa: number }>();
    safeTransactions.forEach((tx) => {
      const key = new Date(tx.createdAt).toLocaleDateString("pt-BR");
      if (!map.has(key)) map.set(key, { name: key, Receita: 0, Despesa: 0 });
      const row = map.get(key);
      if (!row) return;
      if (tx.type === "income") row.Receita += Number(tx.amount || 0);
      if (tx.type === "expense") row.Despesa += Number(tx.amount || 0);
    });
    return Array.from(map.values()).slice(-20);
  }, [safeTransactions]);

  const maxValue = useMemo(() => {
    const values = chartData.flatMap((row) => [row.Receita, row.Despesa]);
    return values.length ? Math.max(...values) : 0;
  }, [chartData]);

  const handleExport = async () => {
    try {
      const blob = await exportFinancialCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-financeiro.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      addToast("Relatorio exportado.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Falha ao exportar relatorio."), "error");
    }
  };

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-zinc-900 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900/90 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-lime-300">
              Visao Financeira
            </p>
            <h1 className="text-3xl font-black tracking-tighter text-zinc-100 md:text-4xl">Relatorios</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
              Performance consolidada de receitas e despesas com leitura rapida para tomada de decisao.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={load}
              type="button"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              Atualizar
            </button>
            <button
              onClick={handleExport}
              type="button"
              className="rounded-xl border border-lime-300/70 bg-lime-300 px-4 py-2.5 text-sm font-black text-zinc-900 transition hover:brightness-95"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="group relative overflow-hidden rounded-2xl border border-lime-400/20 bg-zinc-950 p-5">
          <div className="pointer-events-none absolute -right-7 -top-7 h-20 w-20 rounded-full bg-lime-400/20 blur-2xl transition group-hover:scale-110" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">Receita</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-lime-400 md:text-3xl">{asCurrency(totals.income)}</p>
          <p className="mt-2 text-xs text-zinc-500">Volume: {formatCompactCurrency(totals.income)}</p>
        </article>

        <article className="group relative overflow-hidden rounded-2xl border border-red-500/25 bg-zinc-950 p-5">
          <div className="pointer-events-none absolute -right-7 -top-7 h-20 w-20 rounded-full bg-red-500/20 blur-2xl transition group-hover:scale-110" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">Despesa</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-red-400 md:text-3xl">{asCurrency(totals.expense)}</p>
          <p className="mt-2 text-xs text-zinc-500">Volume: {formatCompactCurrency(totals.expense)}</p>
        </article>

        <article className="group relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="pointer-events-none absolute -right-7 -top-7 h-20 w-20 rounded-full bg-zinc-500/20 blur-2xl transition group-hover:scale-110" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">Saldo</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-zinc-100 md:text-3xl">{asCurrency(totals.balance)}</p>
          <p className="mt-2 text-xs text-zinc-500">Movimentacoes: {safeTransactions.length}</p>
        </article>
      </div>

      {loading ? (
        <LoadingState label="Carregando relatorio..." />
      ) : loadError ? (
        <ErrorState
          title="Erro ao carregar relatorio"
          description={loadError}
          actionLabel="Tentar novamente"
          onAction={load}
        />
      ) : chartData.length === 0 ? (
        <EmptyState
          title="Sem dados para relatorio"
          description="Cadastre transacoes para gerar visualizacoes e exportacoes."
        />
      ) : (
        <div className="rounded-3xl border border-zinc-900 bg-zinc-950 p-6 md:p-8">
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-100 md:text-3xl">Evolucao Financeira</h2>
              <p className="mt-2 text-sm text-zinc-500">Comparativo diario entre entrada e saida de caixa.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-lime-500/35 bg-lime-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-lime-300">
                Receita
              </span>
              <span className="rounded-full border border-red-500/35 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-300">
                Despesa
              </span>
            </div>
          </div>

          <div className="h-[360px] w-full min-w-0 rounded-2xl border border-zinc-900 bg-zinc-950/70 p-3">
            <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={260}>
              <LineChart data={chartData} margin={{ top: 12, right: 12, left: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#2a2a32" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#3f3f46" />
                <YAxis
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  stroke="#3f3f46"
                  width={80}
                  tickFormatter={(value) => formatCompactCurrency(Number(value || 0))}
                />
                <Tooltip
                  cursor={{ stroke: "#52525b", strokeDasharray: "3 3" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #3f3f46",
                    background: "#09090b",
                    color: "#f4f4f5",
                  }}
                  formatter={(value: number, name: string) => [asCurrency(Number(value || 0)), name]}
                  labelStyle={{ color: "#d4d4d8", fontWeight: 700 }}
                />
                <Line
                  type="monotone"
                  dataKey="Receita"
                  stroke="#84cc16"
                  strokeWidth={3}
                  dot={{ r: 2, fill: "#84cc16", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#bef264", stroke: "#171717", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Despesa"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 2, fill: "#ef4444", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#fca5a5", stroke: "#171717", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-5 text-[11px] font-semibold tracking-wide text-zinc-500">
            Pico observado no periodo: <span className="font-black text-zinc-300">{formatCompactCurrency(maxValue)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;

