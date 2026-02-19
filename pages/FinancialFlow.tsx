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
import type { TransactionItem } from "../src/types/domain";

type Tab = "transactions" | "manual";

const FinancialFlow = () => {
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>("transactions");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<"revenue" | "expense">("revenue");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [manualRevenue, setManualRevenue] = useState("");
  const [manualExpense, setManualExpense] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
      addToast("Falha ao carregar transações.", "error");
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const chartData = useMemo(() => {
    const grouped = new Map<string, { name: string; Entradas: number; Saidas: number }>();
    transactions.forEach((tx) => {
      const day = new Date(tx.createdAt).toLocaleDateString("pt-BR");
      if (!grouped.has(day)) grouped.set(day, { name: day, Entradas: 0, Saidas: 0 });
      const row = grouped.get(day)!;
      if (tx.type === "revenue") row.Entradas += Number(tx.amount) || 0;
      if (tx.type === "expense") row.Saidas += Number(tx.amount) || 0;
    });
    return Array.from(grouped.values()).slice(-10);
  }, [transactions]);

  const totalRevenue = transactions
    .filter((t) => t.type === "revenue")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const balance = totalRevenue - totalExpense;

  const notifyDashboardUpdate = () => {
    window.dispatchEvent(new Event("transactions:updated"));
  };

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!description.trim() || !parsedAmount) {
      addToast("Preencha descrição e valor.", "info");
      return;
    }
    try {
      setLoading(true);
      await createTransaction({
        type,
        amount: parsedAmount,
        description: description.trim(),
      });
      setAmount("");
      setDescription("");
      await loadTransactions();
      notifyDashboardUpdate();
      addToast("Transação criada.", "success");
    } catch {
      addToast("Falha ao criar transação.", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const revenue = Number(manualRevenue || 0);
    const expense = Number(manualExpense || 0);
    if (!revenue && !expense) {
      addToast("Informe receita ou despesa.", "info");
      return;
    }
    try {
      setLoading(true);
      if (revenue > 0) {
        await createTransaction({
          type: "revenue",
          amount: revenue,
          description: manualDescription || "Entrada manual",
          manual: true,
        });
      }
      if (expense > 0) {
        await createTransaction({
          type: "expense",
          amount: expense,
          description: manualDescription || "Saída manual",
          manual: true,
        });
      }
      setManualRevenue("");
      setManualExpense("");
      setManualDescription("");
      await loadTransactions();
      notifyDashboardUpdate();
      addToast("Lançamento manual salvo.", "success");
    } catch {
      addToast("Falha ao salvar lançamento manual.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold">Fluxo Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111] p-4 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400">Entradas</p>
          <p className="text-2xl font-bold mt-1 text-[#B6FF00]">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#111] p-4 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400">Saídas</p>
          <p className="text-2xl font-bold mt-1 text-red-400">R$ {totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-[#111] p-4 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400">Saldo</p>
          <p className="text-2xl font-bold mt-1">R$ {balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-[#111] p-4 rounded-lg border border-gray-800">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5FF00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#C5FF00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} />
              <Area type="monotone" dataKey="Entradas" stroke="#C5FF00" fill="url(#colorEntradas)" />
              <Area type="monotone" dataKey="Saidas" stroke="#f87171" fill="url(#colorSaidas)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[320px] grid place-items-center text-gray-400">
            Nenhuma transação ainda.
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("transactions")}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${
            tab === "transactions" ? "bg-[#B6FF00] text-black" : "bg-[#121212] border border-white/10"
          }`}
        >
          Transações
        </button>
        <button
          onClick={() => setTab("manual")}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${
            tab === "manual" ? "bg-[#B6FF00] text-black" : "bg-[#121212] border border-white/10"
          }`}
        >
          Entrada Manual
        </button>
      </div>

      {tab === "transactions" ? (
        <>
          <form
            onSubmit={submitTransaction}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#111] p-4 rounded-lg border border-gray-800"
          >
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "revenue" | "expense")}
              className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2"
            >
              <option value="revenue">Receita</option>
              <option value="expense">Despesa</option>
            </select>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Valor"
              className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#B6FF00] text-black rounded-lg px-3 py-2 font-bold disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Adicionar"}
            </button>
          </form>

          <div className="bg-[#111] border border-gray-800 rounded-lg overflow-auto">
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-gray-400">Sem transações cadastradas.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Descrição</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-right p-3">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-900 last:border-none">
                      <td className="p-3">{new Date(tx.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="p-3">{tx.description}</td>
                      <td className="p-3">{tx.type === "revenue" ? "Receita" : "Despesa"}</td>
                      <td
                        className={`p-3 text-right font-bold ${
                          tx.type === "revenue" ? "text-[#B6FF00]" : "text-red-400"
                        }`}
                      >
                        R$ {Number(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <form
          onSubmit={submitManual}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#111] p-4 rounded-lg border border-gray-800"
        >
          <input
            value={manualRevenue}
            onChange={(e) => setManualRevenue(e.target.value)}
            placeholder="Receita manual"
            className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2"
          />
          <input
            value={manualExpense}
            onChange={(e) => setManualExpense(e.target.value)}
            placeholder="Despesa manual"
            className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2"
          />
          <input
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
            placeholder="Descrição"
            className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#B6FF00] text-black rounded-lg px-3 py-2 font-bold disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Manual"}
          </button>
        </form>
      )}
    </div>
  );
};

export default FinancialFlow;
