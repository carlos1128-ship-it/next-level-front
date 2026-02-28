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
    <div className="space-y-6">
      <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Relatorios</h1>
      <div className="flex gap-3">
        <button
          onClick={load}
          type="button"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 font-bold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Atualizar
        </button>
        <button
          onClick={handleExport}
          type="button"
          className="rounded-lg bg-lime-300 px-4 py-2 font-bold text-zinc-900 transition hover:opacity-90"
        >
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Income</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-lime-500">{asCurrency(totals.income)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Expense</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-red-500">{asCurrency(totals.expense)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Balance</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{asCurrency(totals.balance)}</p>
        </div>
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
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 min-w-0">
          <ResponsiveContainer width="100%" minWidth={280} minHeight={260} height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a1a1aa" />
              <XAxis dataKey="name" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip />
              <Line type="monotone" dataKey="Receita" stroke="#84cc16" />
              <Line type="monotone" dataKey="Despesa" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Reports;

