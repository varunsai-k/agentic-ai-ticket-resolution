import React from 'react';
import { Home, Ticket, LogOut, Cpu, User, Languages } from 'lucide-react';
import { Button } from './ui';
import { useTranslation } from '../utils/i18n';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'tickets';
  setActiveTab: (tab: 'home' | 'tickets') => void;
  username: string;
  onLogout: () => void;
}

export const Layout = ({ children, activeTab, setActiveTab, username, onLogout }: LayoutProps) => {
  const { t, toggleLanguage, language } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      
      {/* ==========================================
          DESKTOP SIDEBAR
          ========================================== */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 glass p-6 space-y-8 shrink-0">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Cpu size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none text-foreground">{t('nav.brand')}</h1>
            <span className="text-[10px] text-primary font-semibold tracking-wider uppercase">{t('nav.enterprise')}</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Home size={18} />
            <span>{t('nav.dashboard')}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Ticket size={18} />
            <span>{t('nav.tickets')}</span>
          </button>
        </nav>

        {/* User Card, Language Toggle & Logout */}
        <div className="border-t border-border/40 pt-4 flex flex-col space-y-3">
          {/* Language Switcher button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleLanguage}
            className="w-full h-11 justify-start border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 px-4"
          >
            <Languages size={16} className="mr-2 text-primary" />
            <span>{language === 'en' ? 'Español' : 'English'}</span>
          </Button>

          <div className="flex items-center space-x-3 px-2 py-1.5 rounded-lg bg-accent/30 border border-border/20">
            <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold uppercase">
              {username ? username.slice(0, 2) : 'US'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate">{username}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t('nav.agent')}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onLogout} className="justify-start w-full text-muted-foreground hover:text-destructive active:scale-95">
            <LogOut size={16} className="mr-2" />
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      {/* ==========================================
          MOBILE TOP NAVBAR & NAVIGATION
          ========================================== */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-card/60 glass border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25">
            <Cpu size={18} />
          </div>
          <span className="font-bold text-sm tracking-tight">{t('nav.brand')}</span>
        </div>
        
        {/* Mobile active user info & language switch */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={toggleLanguage} 
            className="p-2 rounded-full border border-border/40 hover:bg-accent text-muted-foreground active:scale-95 h-10 w-10 flex items-center justify-center cursor-pointer"
          >
            <Languages size={15} className="text-primary" />
          </button>
          
          <div className="flex items-center space-x-2 text-xs font-medium bg-accent/40 px-3 py-1.5 rounded-full border border-border/30">
            <User size={12} className="text-primary" />
            <span className="max-w-[70px] truncate">{username}</span>
          </div>
          <button 
            onClick={onLogout} 
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-destructive cursor-pointer h-10 w-10 flex items-center justify-center border border-border/20 active:scale-95"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0 overflow-y-auto max-h-screen">
        <div className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION (Touch-First, accessible)
          ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-20 bg-card/85 glass border-t border-border flex items-center justify-around px-4 pb-safe shadow-2xl backdrop-blur-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-20 h-14 rounded-xl transition-all duration-200 ${
            activeTab === 'home'
              ? 'text-primary scale-105'
              : 'text-muted-foreground'
          }`}
        >
          <Home size={22} className={activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[10px] font-semibold mt-1">{t('nav.dashboard')}</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex flex-col items-center justify-center w-20 h-14 rounded-xl transition-all duration-200 ${
            activeTab === 'tickets'
              ? 'text-primary scale-105'
              : 'text-muted-foreground'
          }`}
        >
          <Ticket size={22} className={activeTab === 'tickets' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[10px] font-semibold mt-1">{t('nav.tickets')}</span>
        </button>
      </nav>

    </div>
  );
};
