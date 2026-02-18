import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../services/api';

interface InsightCardProps {
    title: string;
    description: string;
    category: string;
    color: 'green' | 'blue' | 'purple' | 'red';
}

const insightData: InsightCardProps[] = [
    { title: "Expansão em 'Moda Sustentável'", description: "O mercado de moda sustentável cresceu 25% no último trimestre. Considere adicionar uma linha de produtos ecológicos.", category: "Oportunidade", color: "green" },
    { title: "Busca por 'Produtos Personalizados'", description: "Houve um aumento de 40% nas buscas por produtos customizáveis. Ferramentas de personalização podem elevar o LTV.", category: "Tendência", color: "blue" },
    { title: "Horário de pico: 20h-22h", description: "Seu engajamento é maior no início da noite. Recomendamos programar anúncios estratégicos para este intervalo.", category: "Sugestão da IA", color: "purple" },
    { title: "Campanha Frete Grátis da Concorrência", description: "Monitore o impacto da nova política do seu principal concorrente. Considere uma campanha de cashback como resposta.", category: "Ameaça", color: "red" },
];

const chartData = [
    { name: 'E-commerce', Crescimento: 18 },
    { name: 'Indústria', Crescimento: 7 },
    { name: 'Serviços', Crescimento: 12 },
    { name: 'Tecnologia', Crescimento: 25 },
];

const InsightCard: React.FC<InsightCardProps> = ({ title, description, category, color }) => {
    const colorClasses = {
        green: 'border-green-500/50 bg-green-500/5',
        blue: 'border-blue-500/50 bg-blue-500/5',
        purple: 'border-purple-500/50 bg-purple-500/5',
        red: 'border-red-500/50 bg-red-500/5',
    };
    
    const textColors = {
        green: 'text-green-400',
        blue: 'text-blue-400',
        purple: 'text-purple-400',
        red: 'text-red-400',
    }
    
    return (
        <div className={`p-6 rounded-2xl border ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${textColors[color]}`}>{category}</span>
            <h3 className="font-black text-lg mt-1 tracking-tight">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
        </div>
    );
};


const Insights = () => {
    const [historyInsights, setHistoryInsights] = useState<InsightCardProps[] | null>(null);

    useEffect(() => {
        const loadAiHistory = async () => {
            try {
                const { data } = await api.get('/ai/history');
                const parsed = Array.isArray(data)
                    ? data
                          .map((item: any) => ({
                              title: item?.title ?? 'Insight da IA',
                              description: item?.description ?? item?.content ?? '',
                              category: item?.category ?? 'Sugestão da IA',
                              color: (item?.color ?? 'purple') as InsightCardProps['color'],
                          }))
                          .filter((item: InsightCardProps) => item.description)
                    : null;

                setHistoryInsights(parsed && parsed.length ? parsed : null);
            } catch {
                setHistoryInsights(null);
            }
        };

        loadAiHistory();
    }, []);

    return (
        <div className="space-y-10">
            <header>
               <h1 className="text-4xl font-black tracking-tighter">Insights Estratégicos</h1>
               <p className="text-gray-500 mt-2">Análise profunda de tendências e oportunidades de mercado em tempo real.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(historyInsights ?? insightData).map(insight => <InsightCard key={insight.title} {...insight} />)}
            </div>

            <div className="bg-[#121212] p-8 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black tracking-tighter">Benchmark por Setor (30 dias)</h3>
                   <div className="px-3 py-1 bg-[#B6FF00]/10 text-[#B6FF00] text-[10px] font-black uppercase rounded-full">Análise Global</div>
                </div>
                <div className="h-[350px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                           <XAxis type="number" stroke="#555" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                           <YAxis type="category" dataKey="name" stroke="#fff" fontSize={12} fontWeight="bold" width={100} axisLine={false} tickLine={false} />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#181818', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
                              cursor={{ fill: '#ffffff05' }}
                           />
                           <Bar dataKey="Crescimento" fill="#B6FF00" barSize={12} radius={[0, 10, 10, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
                </div>
                <p className="text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mt-6">Os dados acima são baseados em tendências agregadas do ecossistema Next Level.</p>
            </div>
        </div>
    );
};

export default Insights;
