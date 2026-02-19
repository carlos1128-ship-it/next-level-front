import React from 'react';
import { LightbulbIcon } from '../components/icons';

interface IntegrationCardProps {
    name: string;
    logo: string;
    description: string;
    isConnected: boolean;
}

// Fix: Changed component to `React.FC` to correctly handle props like 'key'.
const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, logo, description, isConnected }) => (
    <div className="bg-[#111] p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:bg-[#181818]">
        <img src={logo} alt={`${name} logo`} className="h-16 w-16 mb-4 object-contain" />
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-4 flex-grow">{description}</p>
        {isConnected ? (
            <div className="w-full">
                <p className="text-green-400 mb-2 text-sm font-semibold">✓ Conectado</p>
                <button className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition text-sm">Gerenciar</button>
            </div>
        ) : (
            <button className="w-full bg-[#C5FF00] text-black font-bold py-2 px-4 rounded-lg hover:opacity-90 transition text-sm">Conectar</button>
        )}
    </div>
);

const integrationsData: IntegrationCardProps[] = [
    { name: 'WhatsApp Business', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/2044px-WhatsApp.svg.png', description: 'Automatize conversas e analise o fluxo de mensagens.', isConnected: false },
    { name: 'Meta Ads', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png', description: 'Importe dados de campanhas e otimize seus anúncios.', isConnected: true },
    { name: 'Google Analytics', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Google_Analytics_logo_%282016%29.svg/1200px-Google_Analytics_logo_%282016%29.svg.png', description: 'Analise o tráfego do seu site e o comportamento do usuário.', isConnected: true },
    { name: 'Shopify', logo: 'https://cdn.shopify.com/shopify-marketing_assets/static/shopify-favicon.png', description: 'Sincronize vendas, produtos e dados de clientes.', isConnected: true },
    { name: 'Mercado Livre', logo: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.2/mercadolibre/logo__large_plus.png', description: 'Gerencie seus anúncios e vendas do maior marketplace.', isConnected: false },
    { name: 'Slack', logo: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg', description: 'Receba notificações e relatórios diretamente no seu canal.', isConnected: false },
];

const Integrations = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Integrações</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">Conecte suas ferramentas para centralizar e potencializar suas análises.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Fix: Use object spread to pass props to IntegrationCard, resolving a TypeScript error with the 'key' prop. */}
                {integrationsData.map(integration => <IntegrationCard key={integration.name} {...integration} />)}
            </div>

            <div className="mt-8 bg-[#111] p-4 rounded-lg border border-dashed border-gray-700 flex items-center gap-4">
                <LightbulbIcon className="w-8 h-8 text-[#C5FF00]"/>
                <p className="text-zinc-600 dark:text-zinc-300">Não encontrou a integração que precisa? <a href="#" className="text-[#C5FF00] font-semibold hover:underline">Solicite uma nova integração.</a></p>
            </div>
        </div>
    );
};

export default Integrations;
