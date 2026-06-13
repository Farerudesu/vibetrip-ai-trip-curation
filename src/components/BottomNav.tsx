import React from 'react';
import { motion } from 'motion/react';
import { Home, BarChart2, User, Settings } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';

export const BottomNav = ({ active, onTabChange, theme }: { 
  active: string, 
  onTabChange: (v: any) => void,
  theme: 'dark' | 'light'
}) => {
  const { t } = React.useContext(LanguageContext);
  const tabs = [
    { id: 'home', icon: Home, label: t.nav.home },
    { id: 'analytics', icon: BarChart2, label: t.nav.analytics },
    { id: 'profile', icon: User, label: t.nav.profile },
    { id: 'settings', icon: Settings, label: t.nav.settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-6 pt-3">
      <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-gradient-to-t from-gray-950/90 via-gray-950/50 to-transparent' : 'bg-gradient-to-t from-slate-50/90 via-slate-50/50 to-transparent'}`} />
      <div className={`max-w-xs mx-auto relative ${theme === 'dark' ? 'glass' : 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'} rounded-2xl px-2 py-2 flex items-center justify-around`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-300"
            >
              {isActive && (
                <motion.div 
                  layoutId="navPill"
                  className={`absolute inset-0 ${theme === 'light' ? 'bg-indigo-50' : 'bg-indigo-500/15'} rounded-xl`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-[18px] h-[18px] relative z-10 transition-colors duration-200 ${
                isActive 
                  ? 'text-indigo-500'
                  : theme === 'dark' ? 'text-white/30' : 'text-slate-400'
              }`} />
              <span className={`text-[8px] font-semibold uppercase tracking-wider relative z-10 transition-colors duration-200 ${
                isActive 
                  ? 'text-indigo-500'
                  : theme === 'dark' ? 'text-white/20' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
