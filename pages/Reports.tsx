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
import { exportFinancialCsv, getTransactions } from "../src/services/endpoints";
import type { TransactionItem } from "../src/types/domain";

const Reports = () => {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
      addToast("Falha ao carregar relatório.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const chartData = useMemo(() => {
    const map = new Map<string, { name: string; Receita: number; Despesa: number }>();
    transactions.forEach((tx) => {
      const key = new Date(tx.createdAt).toLocaleDateString("pt-BR");
      if (!map.has(key)) map.set(key, { name: key, Receita: 0, Despesa: 0 });
      const row = map.get(key)!;
      if (tx.type === "revenue") row.Receita += Number(tx.amount || 0);
      if (tx.type === "expense") row.Despesa += Number(tx.amount || 0);
    });
    return Array.from(map.values()).slice(-20);
  }, [transactions]);

  const handleExport = async () => {
    try {
      const blob = await exportFinancialCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-financeiro.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      addToast("Relatório exportado.", "success");
    } catch {
      addToast("Falha ao exportar relatório.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>
      <div className="flex gap-3">
        <button
          onClick={load}
          className="bg-[#111] border border-gray-700/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800/50 transition"
        >
          Atualizar
        </button>
        <button
          onClick={handleExport}
          className="bg-[#C5FF00] text-black font-bold py-2 px-4 rounded-lg hover:opacity-90 transition"
        >
          Exportar CSV
        </button>
      </div>

      <div className="bg-[#111] p-4 rounded-lg border border-gray-800/50">
        {loading ? (
          <div className="h-[320px] grid place-items-center text-gray-400">Carregando...</div>
        ) : chartData.length === 0 ? (
          <div className="h-[320px] grid place-items-center text-gray-400">
            Sem dados para relatório.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} />
              <Line type="monotone" dataKey="Receita" stroke="#C5FF00" />
              <Line type="monotone" dataKey="Despesa" stroke="#f87171" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Reports;
