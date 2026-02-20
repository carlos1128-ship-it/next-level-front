import React, { useEffect, useState } from "react";
import { PlusIcon } from "../components/icons";
import { useToast } from "../components/Toast";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";
import { getErrorMessage } from "../src/services/api";
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
      const refreshedCompanies = await loadCompanies();
      const existsInList = refreshedCompanies.some(
        (company) => getCompanyId(company) === createdCompanyId
      );

      if (!existsInList) {
        throw new Error("Empresa nao foi encontrada na listagem apos criar.");
      }

      addToast("Empresa criada com sucesso e selecionada como ativa.", "success");
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Empresas</h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da empresa"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <input
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          placeholder="Setor"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={loadingSubmit}
          className="flex items-center justify-center gap-2 rounded-lg bg-lime-300 px-4 py-2 font-bold text-zinc-900 transition hover:opacity-90 disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          {loadingSubmit ? "Salvando..." : "Nova Empresa"}
        </button>
      </form>

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
          onAction={() => document.querySelector<HTMLInputElement>("input")?.focus()}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-200 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Setor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Acao</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(companies) ? companies : []).map((company) => (
                <tr key={getCompanyId(company) || company.name} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
                  <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">{company.name || "-"}</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">{company.sector || "-"}</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">
                    {getCompanyId(company) === selectedCompanyId ? "Ativa" : company.status || "Disponivel"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => selectCompany(getCompanyId(company))}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                        getCompanyId(company) === selectedCompanyId
                          ? "bg-lime-300 text-zinc-900"
                          : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {getCompanyId(company) === selectedCompanyId ? "Selecionada" : "Selecionar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Companies;
