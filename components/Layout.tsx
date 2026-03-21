import React, { ReactNode, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import type { NavItem } from "../types";
import {
  HomeIcon,
  BarChartIcon,
  MessageSquareIcon,
  SettingsIcon,
  UserIcon,
  PuzzleIcon,
  BuildingIcon,
  LightbulbIcon,
  DollarSignIcon,
  PlusIcon,
  CreditCardIcon,
  PackageIcon,
  UsersIcon,
  ReceiptIcon,
  RadarIcon,
  ShieldIcon,
} from "./icons";
import { useAuth } from "../App";

const navItems: NavItem[] = [
  { path: "/", name: "Inicio", icon: HomeIcon, isPrimary: true },
  { path: "/reports", name: "Relatorios", icon: BarChartIcon, isPrimary: true },
  { path: "/chat", name: "Chat IA", icon: MessageSquareIcon, isPrimary: true },
  { path: "/insights", name: "Insights", icon: LightbulbIcon, isPrimary: true },
  { path: "/market-intel", name: "Mercado", icon: RadarIcon, isPrimary: true },
  { path: "/attendant", name: "Atendente IA", icon: MessageSquareIcon },
  { path: "/products", name: "Produtos", icon: PackageIcon },
  { path: "/customers", name: "Clientes", icon: UsersIcon },
  { path: "/costs", name: "Custos", icon: ReceiptIcon },
  { path: "/plans", name: "Planos", icon: CreditCardIcon },
  { path: "/settings", name: "Configuracoes", icon: SettingsIcon },
  { path: "/profile", name: "Perfil", icon: UserIcon },
  { path: "/integrations", name: "Integracoes", icon: PuzzleIcon },
  { path: "/companies", name: "Empresas", icon: BuildingIcon },
  { path: "/financial-flow", name: "Fluxo Financeiro", icon: DollarSignIcon },
];

const adminNavItem: NavItem = { path: "/admin/system-health", name: "System Health", icon: ShieldIcon };

const Sidebar = () => {
  const { username, isAdmin } = useAuth();
  const items = isAdmin ? [...navItems, adminNavItem] : navItems;
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col justify-between border-r border-zinc-900 bg-[#080b10] p-6 text-zinc-100 lg:flex">
      <div>
        <div className="mb-8 text-4xl font-black tracking-tight text-lime-400">NEXT LEVEL</div>
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Operacao Segura</p>
        <nav aria-label="Menu Principal">
          <ul className="space-y-1">
            {(Array.isArray(items) ? items : []).map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-lime-400/20 text-lime-300"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Link to="/profile" className="group flex items-center gap-3 border-t border-zinc-900 pt-6" aria-label="Acessar perfil">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 font-bold text-zinc-200 transition-all group-hover:border-lime-400">
          {username?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100">{username || "Usuario"}</p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Ver Perfil</p>
        </div>
      </Link>
    </aside>
  );
};

const Header = () => {
  const { username, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-900 bg-[#101218]/95 px-6 backdrop-blur lg:justify-end lg:px-8">
      <div className="text-lg font-black text-lime-400 lg:hidden">NEXT LEVEL</div>
      <div className="flex items-center gap-4">
        {isAdmin ? (
          <Link to="/admin/system-health" className="p-2 text-zinc-500 transition-colors hover:text-lime-400" aria-label="Painel admin">
            <ShieldIcon className="h-5 w-5" />
          </Link>
        ) : null}
        <Link to="/settings" className="p-2 text-zinc-500 transition-colors hover:text-lime-400" aria-label="Configuracoes">
          <SettingsIcon className="h-5 w-5" />
        </Link>
        <Link to="/profile" className="group flex items-center gap-2.5" aria-label="Menu do usuario">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-zinc-100 transition-colors group-hover:text-lime-400">{username || "Usuario"}</p>
            <p className="text-[9px] uppercase tracking-tighter text-zinc-500">Estrategico</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-xs font-black text-zinc-200 transition-all group-hover:border-lime-400">
            {username?.charAt(0).toUpperCase() || "U"}
          </div>
        </Link>
      </div>
    </header>
  );
};

const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-zinc-200 bg-white/95 p-2 backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/95" aria-label="Menu Mobile">
    {(Array.isArray(navItems) ? navItems : []).filter((item) => item.isPrimary).map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `relative flex w-1/4 flex-col items-center rounded-xl p-2 text-[10px] font-bold uppercase tracking-tight transition-all ${
            isActive ? "text-lime-500" : "text-zinc-500 dark:text-zinc-400"
          }`
        }
      >
        <item.icon className="h-5 w-5" />
        <span className="mt-1">{item.name}</span>
      </NavLink>
    ))}
  </nav>
);

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { name: "Nova Empresa", icon: BuildingIcon, path: "/companies" },
    { name: "Novo Relatorio", icon: BarChartIcon, path: "/reports" },
    { name: "Nova Conversa", icon: MessageSquareIcon, path: "/chat" },
  ];

  return (
    <div className="fixed bottom-24 right-5 z-50 lg:bottom-10 lg:right-10">
      {isOpen ? (
        <div className="mb-4 flex flex-col items-center space-y-4" role="menu">
          {actions.map((action) => (
            <Link
              key={action.name}
              to={action.path}
              onClick={() => setIsOpen(false)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-800 transition-all hover:scale-105 hover:border-lime-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              role="menuitem"
            >
              <action.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-zinc-900 shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-red-500 text-white" : "bg-lime-400"
        }`}
        aria-label={isOpen ? "Fechar menu de acoes" : "Abrir menu de acoes"}
        aria-expanded={isOpen}
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen overflow-x-hidden bg-[#040507] text-zinc-100">
    <Sidebar />
    <main className="min-h-screen min-h-0 flex-col lg:pl-64">
      <Header />
      <div className="mx-auto w-full max-w-7xl flex-1 min-h-0 overflow-x-hidden p-4 md:p-8">{children}</div>
    </main>
    <BottomNav />
    <FloatingActionButton />
  </div>
);

export default Layout;
