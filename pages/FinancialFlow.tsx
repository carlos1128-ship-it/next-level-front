
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const flowData = [
    { name: 'Sem 1', Entradas: 4000, Saídas: 2400 },
    { name: 'Sem 2', Entradas: 3000, Saídas: 1398 },
    { name: 'Sem 3', Entradas: 5000, Saídas: 3800 },
    { name: 'Sem 4', Entradas: 2780, Saídas: 1908 },
    { name: 'Sem 5', Entradas: 1890, Saídas: 800 },
    { name: 'Sem 6', Entradas: 4390, Saídas: 3100 },
];

const KpiItem = ({ title, value, comparison }: { title: string; value: string; comparison: string }) => (
    <div className="bg-[#111] p-4 rounded-lg border border-gray-800">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className={`text-sm mt-1 ${comparison.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {comparison} vs. período anterior
        </p>
    </div>
);


const FinancialFlow = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Fluxo Financeiro</h1>

            <div className="flex flex-wrap gap-4 mb-6">
                <select className="bg-[#111] border border-gray-700 rounded p-2 text-sm">
                    <option>Últimos 30 dias</option>
                    <option>Este Mês</option>
                    <option>Este Ano</option>
                </select>
                <select className="bg-[#111] border border-gray-700 rounded p-2 text-sm">
                    <option>Empresa A</option>
                    <option>Empresa B</option>
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiItem title="Faturamento Mensal" value="R$ 48.800" comparison="+12.5%" />
                <KpiItem title="Lucro Líquido" value="R$ 18.300" comparison="+8.3%" />
                <KpiItem title="Custos Operacionais" value="R$ 8.900" comparison="-2.1%" />
                <KpiItem title="Margem de Lucro" value="37.6%" comparison="+2.1%" />
            </div>

            <div className="bg-[#111] p-4 rounded-lg border border-gray-800">
                <h3 className="font-bold mb-4">Fluxo de Caixa (Entradas vs. Saídas)</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={flowData}>
                        <defs>
                            <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C5FF00" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#C5FF00" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                        <Area type="monotone" dataKey="Entradas" stroke="#C5FF00" fillOpacity={1} fill="url(#colorEntradas)" />
                        <Area type="monotone" dataKey="Saídas" stroke="#f87171" fillOpacity={1} fill="url(#colorSaidas)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default FinancialFlow;
