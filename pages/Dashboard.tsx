import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { KpiCardProps } from '../types';
import { useAuth } from '../App';
import { DollarSignIcon, BarChartIcon, ArrowUpRightIcon, ArrowDownRightIcon, LightbulbIcon } from '../components/icons';
import { getMockData, Period } from '../mock/data';
import { useToast } from '../components/Toast';
import { api } from '../services/api';

const AnimatedNumber = ({ value }: { value: string | number }) => {
  const [display, setDisplay] = useState('0');
  
  useEffect(() => {
    const normalizedValue = typeof value === 'string' ? value : String(value ?? '');
    const isCurrency = normalizedValue.includes('R$');
    const numericValue = parseFloat(normalizedValue.replace(/[^0-9.,]/g, '').replace(',', '.'));
    
    if (isNaN(numericValue)) {
      setDisplay(normalizedValue);
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      
      if (isCurrency) {
        setDisplay(`R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      } else {
        setDisplay(`${current.toFixed(1)}%`);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display}</span>;
};

const KpiCard: React.FC<KpiCardProps & { insight?: string }> = ({ title, value, change, changeType, icon: Icon, color, insight }) => {
    const { addToast } = useToast();
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
       setIsPulsing(true);
       const t = setTimeout(() => setIsPulsing(false), 500);
       return () => clearTimeout(t);
    }, [value]);

    return (
        <div className={`bg-[#121212] p-6 rounded-2xl border transition-all duration-300 group hover:border-[#B6FF00]/30 hover:bg-[#181818] relative overflow-hidden ${isPulsing ? 'border-[#B6FF00]/50 scale-[1.02]' : 'border-white/5'}`}>
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-[#B6FF00]/5 rounded-full blur-2xl group-hover:bg-[#B6FF00]/10 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{title}</span>
                <div className={`p-2 rounded-lg bg-black/50 border border-white/5 group-hover:border-[#B6FF00]/20 transition-all`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">
                <AnimatedNumber value={value} />
            </p>
            <div className={`flex items-center text-[11px] font-bold mt-2 ${changeType === 'increase' ? 'text-[#B6FF00]' : 'text-red-500'}`}>
                {changeType === 'increase' ? <ArrowUpRightIcon className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRightIcon className="w-3.5 h-3.5 mr-1" />}
                {change} <span className="text-gray-600 ml-1 font-medium">vs. período anterior</span>
            </div>
            
            {insight && (
               <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                  <div className="relative group/tooltip">
                     <button 
                        onClick={() => addToast(insight, 'info')}
                        className="p-1 hover:bg-[#B6FF00]/10 rounded-full transition-colors"
                        aria-label="Ver insight"
                     >
                        <LightbulbIcon className="w-3.5 h-3.5 text-[#B6FF00]" />
                     </button>
                     <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#181818] border border-white/10 text-white text-[10px] font-medium rounded-lg p-2.5 shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-10 translate-y-1 group-hover/tooltip:translate-y-0">
                        {insight}
                     </div>
                  </div>
               </div>
            )}
        </div>
    );
};

const PIE_COLORS = ['#B6FF00', '#9AD400', '#7FAA00', '#638100'];
type AnalyzeResponse =
  | string
  | {
      analysis?: string;
      insight?: string;
      summary?: string;
      message?: string;
    };

const Dashboard = () => {
  const { username } = useAuth();
  const { addToast } = useToast();
  const [period, setPeriod] = useState<Period>('Hoje');
  const [data, setData] = useState(getMockData('Hoje'));
  const [aiInsights, setAiInsights] = useState<AnalyzeResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const analyzeDashboardData = async (salesData: unknown) => {
    try {
      const response = await api.post<AnalyzeResponse>('/ai/analyze', {
        data: salesData,
      });

      setAiInsights(
        typeof response.data === 'string'
          ? response.data
          : response.data.analysis ?? response.data
      );
    } catch {
      setAiInsights(null);
    }
  };

  useEffect(() => {
    const loadDashboardMetrics = async () => {
      const fallbackData = getMockData(period);

      try {
        const { data } = await api.get<Partial<typeof fallbackData>>("/dashboard/metrics");
        const mergedData = {
          ...fallbackData,
          ...data,
          lineData: Array.isArray(data?.lineData) ? data.lineData : fallbackData.lineData,
          pieData: Array.isArray(data?.pieData) ? data.pieData : fallbackData.pieData,
        };
        setData(mergedData);
        await analyzeDashboardData(mergedData);
      } catch {
        setData(fallbackData);
        await analyzeDashboardData(fallbackData);
      }
    };

    loadDashboardMetrics();
  }, [period]);

  const handleRefresh = async () => {
    setIsUpdating(true);
    const fallbackData = getMockData(period);

    try {
      const { data } = await api.get<Partial<typeof fallbackData>>("/dashboard/metrics");
      const mergedData = {
        ...fallbackData,
        ...data,
        lineData: Array.isArray(data?.lineData) ? data.lineData : fallbackData.lineData,
        pieData: Array.isArray(data?.pieData) ? data.pieData : fallbackData.pieData,
      };
      setData(mergedData);
      await analyzeDashboardData(mergedData);
      addToast("Dados atualizados.", "success");
    } catch {
      setData(fallbackData);
      await analyzeDashboardData(fallbackData);
      addToast("API indisponível. Exibindo dados simulados.", "info");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownload = () => {
    addToast("Seu PDF foi baixado com sucesso.", "success");
  };

  const aiInsightText =
    typeof aiInsights === 'string'
      ? aiInsights
      : aiInsights?.insight || aiInsights?.summary || aiInsights?.message || null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Visão Geral</h1>
          <p className="text-gray-500 font-medium mt-1">Olá, {username}. Aqui está o panorama estratégico de {period.toLowerCase()}.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleDownload} className="flex-1 md:flex-none bg-[#121212] border border-white/5 text-white font-bold text-[10px] uppercase tracking-widest py-3.5 px-6 rounded-xl hover:bg-white/5 transition-all">
            Exportar Dados
          </button>
          <button 
            onClick={handleRefresh} 
            disabled={isUpdating}
            className={`flex-1 md:flex-none bg-[#B6FF00] text-black font-black text-[10px] uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all neon-glow ${isUpdating ? 'opacity-50' : 'hover:opacity-90'}`}
          >
            {isUpdating ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </header>
      
      <div className="flex flex-wrap gap-2.5">
        {(['Hoje', 'Ontem', 'Semana', 'Mês', 'Ano'] as Period[]).map((p) => (
          <button 
            key={p} 
            onClick={() => setPeriod(p)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-[#B6FF00] text-black neon-glow' : 'bg-[#121212] text-gray-500 border border-white/5 hover:border-white/20'}`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
           title="Faturamento" 
           value={data.revenue} 
           change="12.5%" 
           changeType="increase" 
           icon={DollarSignIcon} 
           color="text-[#B6FF00]" 
           insight="Pico de vendas detectado às 15h. Campanhas de remarketing ativas."
        />
        <KpiCard 
           title="Taxa de Conversão" 
           value={data.conversion} 
           change="8.3%" 
           changeType="increase" 
           icon={BarChartIcon} 
           color="text-blue-400" 
           insight="Conversão acima da média histórica para o período selecionado."
        />
        <KpiCard 
           title="CAC Médio" 
           value={data.cac} 
           change="2.1%" 
           changeType="decrease" 
           icon={DollarSignIcon} 
           color="text-red-400" 
        />
        <KpiCard 
           title="Taxa de Retenção" 
           value={data.retention} 
           change="5.0%" 
           changeType="increase" 
           icon={BarChartIcon} 
           color="text-purple-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121212] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-xl font-black tracking-tighter">Atividade por Hora</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#B6FF00] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Monitoramento Ativo</span>
            </div>
          </div>
          <div className="h-[320px] w-full relative z-10">
             <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={300}>
               <LineChart data={data.lineData}>
                 <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                 <XAxis dataKey="name" stroke="#777" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dy={10} />
                 <YAxis stroke="#777" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '10px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
                   itemStyle={{ color: '#B6FF00', fontWeight: 'bold' }}
                   cursor={{ stroke: '#B6FF00', strokeWidth: 1, strokeDasharray: '3 3' }}
                 />
                 <Line type="monotone" dataKey="Vendas" stroke="#B6FF00" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#B6FF00', stroke: '#000', strokeWidth: 2 }} />
                 <Line type="monotone" dataKey="Picos" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 flex flex-col items-center">
          <h3 className="text-xl font-black tracking-tighter mb-8 text-center">Mix de Produtos</h3>
          <div className="h-[260px] w-full">
             <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={220}>
               <PieChart>
                 <Pie 
                   data={data.pieData} 
                   cx="50%" 
                   cy="50%" 
                   innerRadius={65} 
                   outerRadius={95} 
                   paddingAngle={8} 
                   dataKey="value"
                   stroke="none"
                 >
                   {data.pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                   ))}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#181818', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }} 
                    itemStyle={{ color: '#B6FF00' }}
                 />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 w-full">
            {data.pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:border-[#B6FF00]/20 transition-all">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 rounded-lg bg-[#B6FF00]/10 text-[#B6FF00]">
                <LightbulbIcon className="w-5 h-5" />
             </div>
             <h3 className="text-2xl font-black tracking-tighter">Insight Estratégico</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            {aiInsightText || (
              <>
                Seu volume de vendas aumentou nos canais digitais. Recomendamos otimizar a alocação de verba em <span className="text-[#B6FF00] font-bold">Meta Ads</span> para os horários de pico (20h-22h). Nenhuma anomalia detectada nos sistemas de integração.
              </>
            )}
          </p>
        </div>
        <button 
           onClick={() => window.location.hash = '#/insights'} 
           className="whitespace-nowrap bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest py-4 px-8 rounded-xl transition-all border border-white/5"
        >
          Ver Insights Completos
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
