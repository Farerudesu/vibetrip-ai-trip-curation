import React, { useState } from 'react';
import { Moon, Sun, Bell, Globe, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

export const SettingsView = ({ theme, setTheme }: { theme: 'dark' | 'light', setTheme: (v: 'dark' | 'light') => void }) => {
  const [notifications, setNotifications] = useState(true);
  const { lang, setLang, t } = React.useContext(LanguageContext);

  return (
    <div className="flex flex-col gap-6 pt-4 pb-20">
      <h2 className={`text-3xl font-display font-medium italic ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>{t.settings.title}</h2>
      
      <div className="space-y-4">
        <GlassCard className="mb-0 cursor-pointer" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-200'} rounded-xl flex items-center justify-center border`}>
                 {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
               </div>
               <div>
                 <h4 className="text-sm font-bold text-current">{t.settings.theme}</h4>
                 <p className="text-[10px] opacity-50">{t.settings.currently}: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
               </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="mb-0 cursor-pointer" onClick={() => setNotifications(!notifications)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-200'} rounded-xl flex items-center justify-center border`}>
                 <Bell className="w-5 h-5 text-indigo-400" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-current">{t.settings.weather}</h4>
                 <p className="text-[10px] opacity-50">{t.settings.weatherDesc}</p>
               </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="mb-0 cursor-pointer" onClick={() => setLang(lang === 'en' ? 'id' : 'en')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-200'} rounded-xl flex items-center justify-center border font-bold text-xs text-indigo-500`}>
                 {lang.toUpperCase()}
               </div>
               <div>
                 <h4 className="text-sm font-bold">{t.settings.language}</h4>
                 <p className="text-[10px] opacity-50">{lang === 'en' ? 'English (EN)' : 'Bahasa Indonesia (ID)'}</p>
               </div>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 opacity-20" />
              <ChevronRight className="w-4 h-4 opacity-20" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
