import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "../components/Toast";
import { createTransaction, getTransactions } from "../src/services/endpoints";
import { getErrorMessage } from "../src/services/api";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";
import type { TransactionItem } from "../src/types/domain";
import { useAuth } from "../App";

const FinancialFlow = () => {
  const { addToast } = useToast();
  const { selectedCompanyId } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const loadTransactions = async () => {
    if (!selectedCompanyId) {
      setTransactions([]);
      setLoadError("Selecione uma empresa para continuar.");
      setLoadingPage(false);
      return;
    }

    setLoadingPage(true);
    setLoadError(null);
    try {
      const data = await getTransactions(selectedCompanyId);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      setTransactions([]);
      const message = getErrorMessage(error, "Nao foi possivel carregar as transacoes.");
      setLoadError(message);
      addToast(message, "error");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedCompanyId]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const chartData = useMemo(() => {
    const grouped = new Map<string, { name: string; Entradas: number; Saidas: number }>();
    safeTransactions.forEach((tx) => {
      const day = new Date(tx.createdAt).toLocaleDateString("pt-BR");
      if (!grouped.has(day)) grouped.set(day, { name: day, Entradas: 0, Saidas: 0 });
      const row = grouped.get(day);
      if (!row) return;
      if (tx.type === "income") row.Entradas += Number(tx.amount) || 0;
      if (tx.type === "expense") row.Saidas += Number(tx.amount) || 0;
    });
    return Array.from(grouped.values()).slice(-10);
  }, [safeTransactions]);

  const totalIncome = safeTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalExpense = safeTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  const notifyDashboardUpdate = () => {
    window.dispatchEvent(new Event("transactions:updated"));
  };

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!description.trim() || !parsedAmount) {
      addToast("Preencha descricao e valor.", "info");
      return;
    }
    try {
      setLoadingSubmit(true);
      await createTransaction({
        type,
        amount: parsedAmount,
        description: description.trim(),
      });
      setAmount("");
      setDescription("");
      await loadTransactions();
      notifyDashboardUpdate();
      addToast("Transacao criada.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Falha ao criar transacao."), "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Fluxo Financeiro</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Entradas</p>
          <p className="mt-1 text-2xl font-bold text-lime-500">R$ {totalIncome.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Saidas</p>
          <p className="mt-1 text-2xl font-bold text-red-500">R$ {totalExpense.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Saldo</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">R$ {balance.toFixed(2)}</p>
        </div>
      </div>

      {loadingPage ? (
        <LoadingState label="Carregando transacoes..." />
      ) : loadError ? (
        <ErrorState
          title="Erro ao carregar transacoes"
          description={loadError}
          actionLabel="Tentar novamente"
          onAction={loadTransactions}
        />
      ) : (
        <>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#a1a1aa" />
                  <XAxis dataKey="name" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip />
                  <Area type="monotone" dataKey="Entradas" stroke="#84cc16" fill="url(#colorEntradas)" />
                  <Area type="monotone" dataKey="Saidas" stroke="#ef4444" fill="url(#colorSaidas)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Sem transacoes"
                description="Crie sua primeira transacao para visualizar o grafico de fluxo financeiro."
              />
            )}
          </div>

          <form
            onSubmit={submitTransaction}
            className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-lime-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Valor"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descricao"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <button
              type="submit"
              disabled={loadingSubmit}
              className="rounded-lg bg-lime-300 px-3 py-2 font-bold text-zinc-900 disabled:opacity-50"
            >
              {loadingSubmit ? "Salvando..." : "Adicionar"}
            </button>
          </form>

          <div className="overflow-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {safeTransactions.length === 0 ? (
              <EmptyState
                title="Sem transacoes cadastradas"
                description="Use o formulario acima para registrar sua primeira movimentacao."
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <th className="p-3 text-left">Data</th>
                    <th className="p-3 text-left">Descricao</th>
                    <th className="p-3 text-left">Tipo</th>
                    <th className="p-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {safeTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-zinc-100 last:border-none dark:border-zinc-800">
                      <td className="p-3 text-zinc-700 dark:text-zinc-300">
                        {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3 text-zinc-900 dark:text-zinc-100">{tx.description || "-"}</td>
                      <td className="p-3 text-zinc-700 dark:text-zinc-300">
                        {tx.type === "income" ? "Receita" : "Despesa"}
                      </td>
                      <td className={`p-3 text-right font-bold ${tx.type === "income" ? "text-lime-500" : "text-red-500"}`}>
                        R$ {Number(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialFlow;
