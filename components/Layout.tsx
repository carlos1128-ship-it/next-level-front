import React, { useState, ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import type { NavItem } from '../types';
import { HomeIcon, BarChartIcon, MessageSquareIcon, SettingsIcon, UserIcon, PuzzleIcon, BuildingIcon, LightbulbIcon, DollarSignIcon, PlusIcon, CreditCardIcon } from './icons';
import { useAuth } from '../App';

const navItems: NavItem[] = [
  { path: '/', name: 'Início', icon: HomeIcon, isPrimary: true },
  { path: '/reports', name: 'Relatórios', icon: BarChartIcon, isPrimary: true },
  { path: '/chat', name: 'Chat IA', icon: MessageSquareIcon, isPrimary: true },
  { path: '/insights', name: 'Insights', icon: LightbulbIcon, isPrimary: true },
  { path: '/plans', name: 'Planos', icon: CreditCardIcon },
  { path: '/settings', name: 'Configurações', icon: SettingsIcon },
  { path: '/profile', name: 'Perfil', icon: UserIcon },
  { path: '/integrations', name: 'Integrações', icon: PuzzleIcon },
  { path: '/companies', name: 'Empresas', icon: BuildingIcon },
  { path: '/financial-flow', name: 'Fluxo Financeiro', icon: DollarSignIcon },
];

const Sidebar = () => {
  const { username } = useAuth();
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#0A0A0A] text-white p-6 flex-col justify-between hidden lg:flex border-r border-white/5 z-50">
      <div>
        <div className="text-2xl font-black text-[#B6FF00] mb-8 text-neon tracking-tighter">
          NEXT LEVEL
        </div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-6">Operação Segura</p>
        <nav aria-label="Menu Principal">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive ? 'bg-[#B6FF00]/10 text-[#B6FF00]' : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-[#B6FF00]' : 'group-hover:text-white'}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B6FF00] neon-glow"></div>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="pt-6 border-t border-white/5">
         <Link to="/profile" className="flex items-center gap-3 group" aria-label="Acessar Perfil">
            <div className="w-10 h-10 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-[#B6FF00] group-hover:border-[#B6FF00]/50 transition-all font-black">
               {username?.charAt(0).toUpperCase()}
            </div>
            <div>
               <p className="text-sm font-bold">{username}</p>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ver Perfil</p>
            </div>
         </Link>
      </div>
    </aside>
  );
};

const Header = () => {
   const { username } = useAuth();
   return (
      <header className="h-16 flex items-center justify-between lg:justify-end px-6 lg:px-8 border-b border-white/5 glass sticky top-0 z-40">
         <div className="lg:hidden text-lg font-black text-[#B6FF00] text-neon">NEXT LEVEL</div>
         <div className="flex items-center gap-4">
            <Link to="/settings" className="p-2 text-gray-500 hover:text-[#B6FF00] transition-colors" aria-label="Configurações">
               <SettingsIcon className="w-5 h-5" />
            </Link>
            <Link to="/profile" className="flex items-center gap-2.5 group" aria-label="Menu do Usuário">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white group-hover:text-[#B6FF00] transition-colors">{username}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-tighter">Estratégico</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-[#B6FF00] group-hover:border-[#B6FF00]/50 transition-all text-xs font-black">
                  {username?.charAt(0).toUpperCase()}
               </div>
            </Link>
         </div>
      </header>
   );
}

const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-xl p-2 flex justify-around border-t border-white/5 lg:hidden z-50" aria-label="Menu Mobile">
    {navItems.filter(item => item.isPrimary).map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-1/4 ${
            isActive ? 'text-[#B6FF00]' : 'text-gray-500'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase mt-1 tracking-tighter">{item.name}</span>
            {isActive && <div className="absolute top-0 w-8 h-0.5 bg-[#B6FF00] rounded-full neon-glow"></div>}
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const actions = [
      { name: 'Nova Empresa', icon: BuildingIcon, path: '/companies' },
      { name: 'Novo Relatório', icon: BarChartIcon, path: '/reports' },
      { name: 'Nova Conversa', icon: MessageSquareIcon, path: '/chat' },
  ];

  return (
      <div className="fixed bottom-24 right-5 lg:bottom-10 lg:right-10 z-50">
          {isOpen && (
              <div className="flex flex-col items-center mb-4 space-y-4" role="menu">
                  {actions.map((action, index) => (
                      <Link key={action.name} to={action.path} onClick={() => setIsOpen(false)} className="flex items-center justify-center w-12 h-12 bg-[#121212] border border-white/10 rounded-full text-white hover:border-[#B6FF00] transition-all transform hover:scale-110 fade-in" style={{ animationDelay: `${index * 50}ms` }} role="menuitem">
                          <action.icon className="w-5 h-5" />
                      </Link>
                  ))}
              </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${isOpen ? 'bg-red-500 transform rotate-45' : 'bg-[#B6FF00] text-black neon-glow-strong'}`}
            aria-label={isOpen ? "Fechar menu de ações" : "Abrir menu de ações"}
            aria-expanded={isOpen}
          >
              <PlusIcon className="w-7 h-7 font-bold"/>
          </button>
      </div>
  )
}

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-black">
    <Sidebar />
    <main className="lg:pl-64 min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 fade-in">
        {children}
      </div>
    </main>
    <BottomNav />
    <FloatingActionButton />
  </div>
);

export default Layout;