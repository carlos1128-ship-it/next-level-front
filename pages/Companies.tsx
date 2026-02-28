import React, { useEffect, useState } from "react";
import { PlusIcon } from "../components/icons";
import { useToast } from "../components/Toast";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";
import { getErrorMessage } from "../src/services/error";
import { createCompany, getCompanies } from "../src/services/endpoints";
import type { Company } from "../src/types/domain";
import { useAuth } from "../App";

const getCompanyId = (company: Partial<Company> | null | undefined) =>
  company?.id || company?._id || null;

const Companies = () => {
  const { addToast } = useToast();
  const { selectedCompanyId, setSelectedCompanyId } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadCompanies = async () => {
    setLoadingPage(true);
    setLoadError(null);
    try {
      const data = await getCompanies();
      const list = (Array.isArray(data) ? data : []).filter(
        (company): company is Company => Boolean(getCompanyId(company))
      );
      setCompanies(list);

      if (!list.length) {
        setSelectedCompanyId(null);
        return list;
      }

      const activeExists = list.some((company) => getCompanyId(company) === selectedCompanyId);
      if (!activeExists) {
        setSelectedCompanyId(getCompanyId(list[0]));
      }
      return list;
    } catch (error) {
      setCompanies([]);
      const message = getErrorMessage(error, "Nao foi possivel carregar as empresas.");
      setLoadError(message);
      addToast(message, "error");
      return [];
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Nome da empresa e obrigatorio.", "info");
      return;
    }
    try {
      setLoadingSubmit(true);
      const created = await createCompany({ name: name.trim(), sector: sector.trim() || undefined });
      const createdCompanyId = getCompanyId(created);
      if (!createdCompanyId) {
        throw new Error("Empresa criada sem ID no retorno da API.");
      }

      setSelectedCompanyId(createdCompanyId);
      setName("");
      setSector("");
      setShowForm(false);
      await loadCompanies();
      window.dispatchEvent(new Event("companies:updated"));
      addToast("Empresa criada com sucesso.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Nao foi possivel criar a empresa."), "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const selectCompany = (companyId: string | null) => {
    if (!companyId) return;
    setSelectedCompanyId(companyId);
    addToast("Empresa ativa atualizada.", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-6xl font-black tracking-tighter text-zinc-100">Empresas</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-2xl bg-lime-400 px-6 py-3 text-lg font-black text-zinc-900 transition hover:opacity-90"
        >
          <PlusIcon className="h-5 w-5" /> Nova Empresa
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-900 bg-zinc-950 p-4 md:grid-cols-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da empresa"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Setor"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <button
            type="submit"
            disabled={loadingSubmit}
            className="rounded-xl bg-lime-400 px-4 py-2 font-black text-zinc-900 transition hover:opacity-90 disabled:opacity-50"
          >
            {loadingSubmit ? "Salvando..." : "Salvar"}
          </button>
        </form>
      ) : null}

      {loadingPage ? (
        <LoadingState label="Carregando empresas..." />
      ) : loadError ? (
        <ErrorState
          title="Erro ao carregar empresas"
          description={loadError}
          actionLabel="Tentar novamente"
          onAction={loadCompanies}
        />
      ) : companies.length === 0 ? (
        <EmptyState
          title="Nenhuma empresa cadastrada"
          description="Cadastre a primeira empresa para liberar os modulos de analise."
          actionLabel="Criar primeira empresa"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-900 bg-zinc-950">
          <table className="w-full text-left text-lg">
            <thead className="border-b border-zinc-900 text-sm uppercase tracking-[0.12em] text-zinc-500">
              <tr>
                <th className="p-4">Nome da Empresa</th>
                <th className="p-4">Setor</th>
                <th className="p-4">Status</th>
                <th className="p-4">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(companies) ? companies : []).map((company) => {
                const isSelected = getCompanyId(company) === selectedCompanyId;
                return (
                  <tr key={getCompanyId(company) || company.name} className="border-b border-zinc-900 last:border-b-0">
                    <td className="p-4 font-semibold text-zinc-100">{company.name || "-"}</td>
                    <td className="p-4 text-zinc-300">{company.sector || "Tecnologia"}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-sm font-bold ${isSelected ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-300"}`}>
                        {isSelected ? "Ativa" : "Pendente"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => selectCompany(getCompanyId(company))}
                        className="text-lime-400 transition hover:text-lime-300"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Companies;
