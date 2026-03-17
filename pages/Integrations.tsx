import React, { useEffect, useMemo, useState } from 'react';
import { LightbulbIcon } from '../components/icons';
import { useAuth } from '../App';
import { useToast } from '../components/Toast';
import {
  connectIntegration,
  getIntegrationStatuses,
} from '../src/services/endpoints';
import type {
  IntegrationProvider,
  IntegrationStatus,
} from '../src/types/domain';

const PROVIDERS: Record<
  IntegrationProvider,
  { name: string; description: string; logo: string; hint: string }
> = {
  WHATSAPP: {
    name: 'WhatsApp Business',
    description: 'Envie mensagens e templates via Cloud API.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/2044px-WhatsApp.svg.png',
    hint: 'Use o phone_number_id da Cloud API e o access token gerado no app Meta.',
  },
  INSTAGRAM: {
    name: 'Instagram',
    description: 'Capture DMs e menções para engajar clientes.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/512px-Instagram_logo_2016.svg.png',
    hint: 'Use o instagram_business_account_id e a token da Graph API.',
  },
  MERCADOLIVRE: {
    name: 'Mercado Livre',
    description: 'Receba notificações de vendas e mensagens.',
    logo: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.2/mercadolibre/logo__large_plus.png',
    hint: 'Use o seller_id da conta e a access token do app Mercado Livre.',
  },
};

type StatusMap = Record<IntegrationProvider, IntegrationStatus>;

const emptyStatus = (provider: IntegrationProvider): IntegrationStatus => ({
  provider,
  status: 'disconnected',
  connected: false,
  externalId: null,
  updatedAt: null,
});

const buildEmptyMap = (): StatusMap => ({
  WHATSAPP: emptyStatus('WHATSAPP'),
  INSTAGRAM: emptyStatus('INSTAGRAM'),
  MERCADOLIVRE: emptyStatus('MERCADOLIVRE'),
});

const IntegrationCard = ({
  provider,
  status,
  onConnect,
  disabled,
}: {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  onConnect: (provider: IntegrationProvider) => void;
  disabled: boolean;
}) => {
  const card = PROVIDERS[provider];
  const badgeClass = status.connected
    ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
    : 'bg-zinc-800 text-zinc-300 border border-zinc-700';

  return (
    <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:border-[#C5FF00]/40">
      <div className="flex items-center gap-3">
        <img src={card.logo} alt={`${card.name} logo`} className="h-12 w-12 rounded-md object-contain bg-white/5 p-1" />
        <div className="flex-1">
          <h3 className="text-xl font-bold tracking-tight">{card.name}</h3>
          <p className="text-sm text-zinc-500">{card.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
          {status.connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <div className="mt-4 text-sm text-zinc-400 space-y-1">
        <p>
          <span className="text-zinc-500">External ID:</span>{' '}
          {status.externalId || '—'}
        </p>
        <p>
          <span className="text-zinc-500">Atualizado:</span>{' '}
          {status.updatedAt ? new Date(status.updatedAt).toLocaleString() : '—'}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          disabled={disabled}
          onClick={() => onConnect(provider)}
          className={`flex-1 text-sm font-semibold py-2 px-4 rounded-lg transition ${
            disabled
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-[#C5FF00] text-black hover:opacity-90'
          }`}
        >
          {status.connected ? 'Gerenciar credenciais' : 'Conectar'}
        </button>
      </div>
    </div>
  );
};

const Integrations = () => {
  const { selectedCompanyId } = useAuth();
  const { addToast } = useToast();
  const [statuses, setStatuses] = useState<StatusMap>(buildEmptyMap);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<IntegrationProvider | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [externalId, setExternalId] = useState('');

  const hasCompany = Boolean(selectedCompanyId);

  const loadStatuses = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const data = await getIntegrationStatuses(selectedCompanyId);
      const next = buildEmptyMap();
      data.forEach((item) => {
        next[item.provider] = {
          ...emptyStatus(item.provider),
          ...item,
          updatedAt: item.updatedAt || item['updated_at'] || null,
        };
      });
      setStatuses(next);
    } catch {
      addToast('Não foi possível carregar o status das integrações', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId]);

  const handleOpenModal = (provider: IntegrationProvider) => {
    setActiveProvider(provider);
    setExternalId(statuses[provider]?.externalId || '');
    setAccessToken('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCompanyId || !activeProvider) {
      addToast('Selecione uma empresa para conectar', 'error');
      return;
    }

    if (!externalId.trim() || !accessToken.trim()) {
      addToast('Preencha External ID e Access Token', 'error');
      return;
    }

    setSaving(true);
    try {
      await connectIntegration(selectedCompanyId, {
        provider: activeProvider,
        externalId: externalId.trim(),
        accessToken: accessToken.trim(),
        status: 'connected',
      });
      addToast('Integração salva com sucesso', 'success');
      setIsModalOpen(false);
      await loadStatuses();
    } catch {
      addToast('Falha ao salvar integração', 'error');
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = useMemo(
    () => (activeProvider ? `Conectar ${PROVIDERS[activeProvider].name}` : ''),
    [activeProvider],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integrações</h1>
        <p className="text-zinc-500">
          Conecte canais externos para ingestão e disparo de mensagens.
        </p>
      </div>

      {!hasCompany && (
        <div className="p-4 rounded-xl border border-orange-400/30 bg-orange-500/5 text-orange-200 text-sm">
          Selecione ou crie uma empresa para habilitar as integrações.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(PROVIDERS).map((key) => {
          const provider = key as IntegrationProvider;
          const status = statuses[provider] || emptyStatus(provider);
          return (
            <IntegrationCard
              key={provider}
              provider={provider}
              status={status}
              onConnect={handleOpenModal}
              disabled={!hasCompany || loading}
            />
          );
        })}
      </div>

      <div className="mt-6 bg-[#0f0f0f] p-4 rounded-lg border border-dashed border-zinc-800 flex items-center gap-4">
        <LightbulbIcon className="w-8 h-8 text-[#C5FF00]" />
        <p className="text-zinc-400 text-sm">
          Dica: cadastre o mesmo <span className="font-semibold">externalId</span> (phoneId, sellerId)
          que chegará no webhook. O sistema usa esse ID para associar eventos ao seu companyId.
        </p>
      </div>

      {isModalOpen && activeProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#0b0b0b] border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Integração</p>
                <h3 className="text-2xl font-bold mt-1">{modalTitle}</h3>
                <p className="text-sm text-zinc-500 mt-2">{PROVIDERS[activeProvider].hint}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition text-sm"
              >
                fechar
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-zinc-400">External ID</label>
                <input
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  placeholder="phone_number_id / seller_id / instagram_business_account_id"
                  className="mt-2 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C5FF00]"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Access Token</label>
                <textarea
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Cole aqui o token de acesso"
                  className="mt-2 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C5FF00] min-h-[90px]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  saving
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#C5FF00] text-black hover:opacity-90'
                }`}
              >
                {saving ? 'Salvando...' : 'Salvar integração'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
