import React, { useEffect, useState } from "react";
import { PlusIcon } from "../components/icons";
import { useToast } from "../components/Toast";
import { createCompany, getCompanies } from "../src/services/endpoints";
import type { Company } from "../src/types/domain";

const Companies = () => {
  const { addToast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch {
      setCompanies([]);
      addToast("Falha ao carregar empresas.", "error");
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Nome da empresa é obrigatório.", "info");
      return;
    }
    try {
      setLoading(true);
      await createCompany({ name: name.trim(), sector: sector.trim() || undefined });
      setName("");
      setSector("");
      addToast("Empresa criada com sucesso.", "success");
      await loadCompanies();
    } catch {
      addToast("Não foi possível criar a empresa.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Empresas</h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-[#111] border border-gray-800/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da empresa"
          className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2"
        />
        <input
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          placeholder="Setor"
          className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#C5FF00] text-black font-bold py-2 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          <PlusIcon className="w-5 h-5" />
          {loading ? "Salvando..." : "Nova Empresa"}
        </button>
      </form>

      <div className="bg-[#111] border border-gray-800/50 rounded-lg overflow-x-auto">
        {companies.length === 0 ? (
          <div className="p-6 text-sm text-gray-400 text-center">
            Nenhuma empresa cadastrada.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-gray-800/50 text-sm text-gray-400">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Setor</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-gray-800/50 last:border-b-0">
                  <td className="p-4 font-semibold">{company.name}</td>
                  <td className="p-4">{company.sector || "-"}</td>
                  <td className="p-4">{company.status || "Ativa"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Companies;
