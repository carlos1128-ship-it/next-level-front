import React, { useEffect, useMemo, useState } from "react";
import { PlusIcon } from "../components/icons";
import { useToast } from "../components/Toast";
import { EmptyState, ErrorState, LoadingState } from "../components/AsyncState";
import { getErrorMessage } from "../src/services/error";
import { createCompany, getCompanies } from "../src/services/endpoints";
import type { Company } from "../src/types/domain";
import { useAuth } from "../App";

const getCompanyId = (company: Partial<Company> | null | undefined) =>
  company?.id || company?._id || null;

const formatDocument = (value: string) => value.replace(/\D/g, "").slice(0, 14);

const formatOpenedAge = (openedAt?: string) => {
  if (!openedAt) return "Nao informado";
  const opened = new Date(openedAt);
  if (Number.isNaN(opened.getTime())) return "Nao informado";

  const now = new Date();
  const diffMonths =
    (now.getFullYear() - opened.getFullYear()) * 12 +
    (now.getMonth() - opened.getMonth());

  if (diffMonths <= 0) return "Menos de 1 mes";
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? "mes" : "meses"}`;

  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  return `${years} ${years === 1 ? "ano" : "anos"}${months ? ` e ${months} ${months === 1 ? "mes" : "meses"}` : ""}`;
};

const Companies = () => {
  const { addToast } = useToast();
  const { selectedCompanyId, setSelectedCompanyId } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState({
    name: "",
    sector: "",
    segment: "",
    document: "",
    openedAt: "",
    description: "",
  });
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
    void loadCompanies();
  }, []);

  const onChangeForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === "document" ? formatDocument(value) : value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      sector: "",
      segment: "",
      document: "",
      openedAt: "",
      description: "",
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast("Nome da empresa e obrigatorio.", "info");
      return;
    }
    if (!form.sector.trim() && !form.segment.trim()) {
      addToast("Informe pelo menos setor ou segmento.", "info");
      return;
    }
    if (!form.document.trim()) {
      addToast("Informe o CNPJ ou CPF da empresa.", "info");
      return;
    }
    if (!form.openedAt) {
      addToast("Informe desde quando a empresa esta aberta.", "info");
      return;
    }
    if (!form.description.trim()) {
      addToast("Adicione uma descricao curta da empresa.", "info");
      return;
    }

    try {
      setLoadingSubmit(true);
      const created = await createCompany({
        name: form.name.trim(),
        sector: form.sector.trim() || undefined,
        segment: form.segment.trim() || undefined,
        document: form.document.trim(),
        openedAt: form.openedAt,
        description: form.description.trim(),
      });
      const createdCompanyId = getCompanyId(created);
      if (!createdCompanyId) {
        throw new Error("Empresa criada sem ID no retorno da API.");
      }

      setSelectedCompanyId(createdCompanyId);
      resetForm();
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

  const summaryText = useMemo(() => {
    if (!companies.length) return "Cadastre a primeira empresa para liberar os modulos.";
    return `${companies.length} empresa${companies.length === 1 ? "" : "s"} vinculada${companies.length === 1 ? "" : "s"} ao seu ambiente.`;
  }, [companies.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-100 md:text-5xl">Empresas</h1>
          <p className="mt-2 text-zinc-400">{summaryText}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-2xl bg-lime-400 px-6 py-3 text-base font-black text-zinc-900 transition hover:opacity-90"
        >
          <PlusIcon className="h-5 w-5" /> Nova Empresa
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-4 rounded-3xl border border-zinc-900 bg-zinc-950 p-5 md:grid-cols-2 xl:grid-cols-4"
        >
          <input
            value={form.name}
            onChange={(e) => onChangeForm("name", e.target.value)}
            placeholder="Nome da empresa"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400 xl:col-span-2"
          />
          <input
            value={form.sector}
            onChange={(e) => onChangeForm("sector", e.target.value)}
            placeholder="Setor"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <input
            value={form.segment}
            onChange={(e) => onChangeForm("segment", e.target.value)}
            placeholder="Segmento"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <input
            value={form.document}
            onChange={(e) => onChangeForm("document", e.target.value)}
            placeholder="CNPJ ou CPF"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <input
            type="date"
            value={form.openedAt}
            onChange={(e) => onChangeForm("openedAt", e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <textarea
            value={form.description}
            onChange={(e) => onChangeForm("description", e.target.value)}
            placeholder="Descricao curta do que a empresa faz"
            rows={4}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400 md:col-span-2 xl:col-span-2"
          />
          <button
            type="submit"
            disabled={loadingSubmit}
            className="rounded-xl bg-lime-400 px-4 py-3 font-black text-zinc-900 transition hover:opacity-90 disabled:opacity-50 md:col-span-2 xl:col-span-2"
          >
            {loadingSubmit ? "Salvando..." : "Salvar Empresa"}
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
          onAction={() => void loadCompanies()}
        />
      ) : companies.length === 0 ? (
        <EmptyState
          title="Nenhuma empresa cadastrada"
          description="Cadastre a primeira empresa para liberar os modulos de analise."
          actionLabel="Criar primeira empresa"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-zinc-900 bg-zinc-950">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-zinc-900 uppercase tracking-[0.12em] text-zinc-500">
              <tr>
                <th className="p-4">Empresa</th>
                <th className="p-4">Setor / Segmento</th>
                <th className="p-4">Documento</th>
                <th className="p-4">Tempo Aberta</th>
                <th className="p-4">Descricao</th>
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
                    <td className="p-4 text-zinc-300">
                      {[company.sector, company.segment].filter(Boolean).join(" / ") || "Nao informado"}
                    </td>
                    <td className="p-4 text-zinc-300">{company.document || "Nao informado"}</td>
                    <td className="p-4 text-zinc-300">{formatOpenedAge(company.openedAt)}</td>
                    <td className="max-w-xs p-4 text-zinc-400">{company.description || "Sem descricao"}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-sm font-bold ${isSelected ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-300"}`}>
                        {isSelected ? "Ativa" : "Disponivel"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => selectCompany(getCompanyId(company))}
                        className="text-lime-400 transition hover:text-lime-300"
                      >
                        Selecionar
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
