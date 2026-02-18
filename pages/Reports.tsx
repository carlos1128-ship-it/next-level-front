import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SkeletonLoader = () => (
    <div className="bg-[#111] p-4 rounded-lg border border-gray-800/50 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
    </div>
);

const reportData = {
    line: [
        { name: 'Jan', Lucro: 4000, Perda: 2400 },
        { name: 'Fev', Lucro: 3000, Perda: 1398 },
        { name: 'Mar', Lucro: 2000, Perda: 9800 },
        { name: 'Abr', Lucro: 2780, Perda: 3908 },
        { name: 'Mai', Lucro: 1890, Perda: 4800 },
        { name: 'Jun', Lucro: 2390, Perda: 3800 },
    ],
    area: [
        { name: '2024', Projeção: 5000 },
        { name: '2025', Projeção: 6200 },
        { name: '2026', Projeção: 7500 },
        { name: '2027', Projeção: 9000 },
    ],
    bar: [
        { name: 'Empresa A', Eficiência: 85, Desperdício: 15 },
        { name: 'Empresa B', Eficiência: 70, Desperdício: 30 },
    ],
};


const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [showData, setShowData] = useState(true);

    const handleGenerateReport = () => {
        setShowData(false);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowData(true);
            alert("Relatório detalhado gerado com sucesso! (simulado)");
        }, 2000);
    };
    
    const handleRefresh = () => {
        setShowData(false);
        setTimeout(() => setShowData(true), 1000);
    };

    const handleExport = () => {
        alert("Exportado para PDF com sucesso! (simulado)");
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Relatórios</h1>

            <div className="flex flex-wrap gap-4 mb-6">
                <select className="bg-[#111] border border-gray-700/50 rounded p-2">
                    <option>Filtrar por data</option>
                </select>
                <select className="bg-[#111] border border-gray-700/50 rounded p-2">
                    <option>Filtrar por setor</option>
                </select>
                <button onClick={handleGenerateReport} className="bg-[#C5FF00] text-black font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">
                    Gerar relatório detalhado
                </button>
                 <button onClick={handleRefresh} className="bg-[#111] border border-gray-700/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800/50 transition">
                    Atualizar
                </button>
                <button onClick={handleExport} className="bg-[#111] border border-gray-700/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800/50 transition">
                    Exportar PDF
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? <><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /></> : null}
                {showData && !loading ? (
                    <>
                        <div className="bg-[#111] p-4 rounded-lg border border-gray-800/50 fade-in">
                            <h3 className="font-bold mb-4">Lucros e Perdas</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={reportData.line}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Lucro" stroke="#C5FF00" />
                                    <Line type="monotone" dataKey="Perda" stroke="#f87171" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-[#111] p-4 rounded-lg border border-gray-800/50 fade-in">
                            <h3 className="font-bold mb-4">Projeções de Crescimento</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={reportData.area}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                                    <Area type="monotone" dataKey="Projeção" stroke="#C5FF00" fill="#C5FF00" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="bg-[#111] p-4 rounded-lg border border-gray-800/50 fade-in col-span-1 lg:col-span-2">
                            <h3 className="font-bold mb-4">Comparativo entre Empresas</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportData.bar}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                                    <Legend />
                                    <Bar dataKey="Eficiência" fill="#C5FF00" />
                                    <Bar dataKey="Desperdício" fill="#f87171" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : !loading && !showData ? (
                     <div className="col-span-1 lg:col-span-2 text-center text-gray-500 py-10">
                        <p>Clique em "Gerar relatório detalhado" para ver os dados.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Reports;