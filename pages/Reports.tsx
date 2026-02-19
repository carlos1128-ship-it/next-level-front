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
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";
import { exportFinancialCsv, getTransactions } from "../src/services/endpoints";
import type { TransactionItem } from "../src/types/domain";

const Reports = () => {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
      setLoadError("Nao foi possivel carregar o relatorio.");
      addToast("Falha ao carregar relatorio.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const chartData = useMemo(() => {
    const map = new Map<string, { name: string; Receita: number; Despesa: number }>();
    safeTransactions.forEach((tx) => {
      const key = new Date(tx.createdAt).toLocaleDateString("pt-BR");
      if (!map.has(key)) map.set(key, { name: key, Receita: 0, Despesa: 0 });
      const row = map.get(key);
      if (!row) return;
      if (tx.type === "revenue") row.Receita += Number(tx.amount || 0);
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
    } catch {
      addToast("Falha ao exportar relatorio.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Relatorios</h1>
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
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <ResponsiveContainer width="100%" height={320}>
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
