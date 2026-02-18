import React from 'react';
import { PlusIcon } from '../components/icons';

const Companies = () => {
    // Mock data
    const companies = [
        { name: 'Tech Solutions Ltda.', sector: 'Tecnologia', status: 'Ativa' },
        { name: 'E-commerce Brasil', sector: 'E-commerce', status: 'Ativa' },
        { name: 'Indústria Forte S.A.', sector: 'Indústria', status: 'Pendente' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Empresas</h1>
                <button className="flex items-center gap-2 bg-[#C5FF00] text-black font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">
                    <PlusIcon className="w-5 h-5" />
                    Nova Empresa
                </button>
            </div>

            <div className="bg-[#111] border border-gray-800/50 rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-800/50 text-sm text-gray-400">
                        <tr>
                            <th className="p-4">Nome da Empresa</th>
                            <th className="p-4">Setor</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company, index) => (
                            <tr key={index} className="border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/50 transition">
                                <td className="p-4 font-semibold">{company.name}</td>
                                <td className="p-4">{company.sector}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        company.status === 'Ativa' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {company.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button className="text-[#C5FF00] hover:underline text-sm">Gerenciar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Companies;