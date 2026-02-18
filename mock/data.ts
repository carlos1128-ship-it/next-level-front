export type Period = 'Hoje' | 'Ontem' | 'Semana' | 'Mês' | 'Ano';

export interface DashboardData {
  revenue: string;
  conversion: string;
  cac: string;
  retention: string;
  lineData: any[];
  pieData: any[];
}

export const getMockData = (period: Period): DashboardData => {
  const multipliers: Record<Period, number> = {
    'Hoje': 1,
    'Ontem': 0.9,
    'Semana': 7,
    'Mês': 30,
    'Ano': 365
  };

  const m = multipliers[period];

  return {
    revenue: `R$ ${(4880.50 * m).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    conversion: `${(18.3 + (Math.random() * 2 - 1)).toFixed(1)}%`,
    cac: `R$ ${(89.20 + (Math.random() * 5 - 2.5)).toFixed(2).replace('.', ',')}`,
    retention: `${(87.6 + (Math.random() * 1)).toFixed(1)}%`,
    lineData: [
      { name: '08:00', Vendas: 12 * m, Picos: 20 * m },
      { name: '10:00', Vendas: 19 * m, Picos: 30 * m },
      { name: '12:00', Vendas: 3 * m, Picos: 10 * m },
      { name: '14:00', Vendas: 5 * m, Picos: 8 * m },
      { name: '16:00', Vendas: 2 * m, Picos: 18 * m },
      { name: '18:00', Vendas: 3 * m, Picos: 25 * m },
      { name: '20:00', Vendas: 10 * m, Picos: 15 * m },
    ],
    pieData: [
      { name: 'Premium', value: 400 * m },
      { name: 'Standard', value: 300 * m },
      { name: 'Lite', value: 300 * m },
      { name: 'Custom', value: 200 * m },
    ]
  };
};