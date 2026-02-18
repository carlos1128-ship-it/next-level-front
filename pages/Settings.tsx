import React, { useState } from 'react';
import Plans from './Plans';

const SettingItem = ({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#121212] rounded-2xl border border-white/5 hover:border-white/10 transition-colors gap-4">
        <div>
            <h3 className="font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-gray-500 font-medium">{description}</p>
        </div>
        <div className="w-full sm:w-auto">{children}</div>
    </div>
);

const ToggleSwitch = () => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-[#181818] border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-600 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B6FF00] peer-checked:after:bg-black"></div>
        </label>
    );
};

const Settings = () => {
    const [activeTab, setActiveTab] = useState<'geral' | 'ia' | 'planos'>('geral');

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-black tracking-tighter mb-8">Configurações</h1>

            <div className="flex border-b border-white/5 mb-8 overflow-x-auto no-scrollbar">
                {[
                   { id: 'geral', label: 'Geral' },
                   { id: 'ia', label: 'Inteligência Artificial' },
                   { id: 'planos', label: 'Planos & Assinatura' }
                ].map(tab => (
                   <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                         activeTab === tab.id ? 'text-[#B6FF00]' : 'text-gray-500 hover:text-white'
                      }`}
                   >
                      {tab.label}
                      {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B6FF00] neon-glow"></div>}
                   </button>
                ))}
            </div>

            <div className="fade-in space-y-10">
                {activeTab === 'geral' && (
                   <div className="space-y-6">
                       <div className="space-y-4">
                           <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-1">Sistema</h2>
                           <SettingItem title="Modo Escuro" description="Interface otimizada para ambientes de baixa luminosidade.">
                               <ToggleSwitch />
                           </SettingItem>
                           <SettingItem title="Notificações em Tempo Real" description="Alertas críticos sobre faturamento e anomalias.">
                               <ToggleSwitch />
                           </SettingItem>
                            <SettingItem title="Idioma do Sistema" description="Defina a linguagem padrão da plataforma.">
                               <select className="w-full sm:w-auto bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#B6FF00] transition-all">
                                   <option>Português (Brasil)</option>
                                   <option>English (US)</option>
                               </select>
                           </SettingItem>
                       </div>
                       
                       <div className="space-y-4 pt-6">
                           <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-1">Segurança</h2>
                           <SettingItem title="Autenticação em Dois Fatores" description="Camada extra de proteção para seus dados financeiros.">
                               <button className="text-xs font-black uppercase text-[#B6FF00] border-b border-[#B6FF00]/30 pb-0.5 hover:border-[#B6FF00] transition-all">Configurar</button>
                           </SettingItem>
                       </div>
                   </div>
                )}

                {activeTab === 'ia' && (
                   <div className="space-y-6">
                       <div className="space-y-4">
                           <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-1">Comportamento</h2>
                            <SettingItem title="Pseudônimo da IA" description="Como você deseja chamar seu assistente.">
                               <input type="text" defaultValue="Next AI" className="w-full sm:w-auto bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#B6FF00] transition-all" />
                           </SettingItem>
                            <SettingItem title="Nível de Detalhamento" description="Ajuste o tom das respostas e análises.">
                               <select className="w-full sm:w-auto bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#B6FF00] transition-all">
                                   <option>Executivo (Direto)</option>
                                   <option>Analista (Detalhado)</option>
                                   <option>Criativo (Expansivo)</option>
                               </select>
                           </SettingItem>
                       </div>

                       <div className="p-6 rounded-3xl bg-[#B6FF00]/5 border border-[#B6FF00]/10">
                          <h3 className="font-black text-[#B6FF00] uppercase tracking-widest text-[10px] mb-2">Dica Estratégica</h3>
                          <p className="text-xs text-gray-400 leading-relaxed">Configurar a IA no modo <b>Executivo</b> economiza tempo e foca em métricas que impactam diretamente no seu fluxo de caixa.</p>
                       </div>
                   </div>
                )}

                {activeTab === 'planos' && (
                   <div className="pt-4">
                      <Plans />
                   </div>
                )}
            </div>
        </div>
    );
};

export default Settings;