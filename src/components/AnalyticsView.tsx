import React from 'react';
import { Sparkles, Compass, Music2, History } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { VibeChart } from './VibeChart';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

export const AnalyticsView = ({ savedVibes = [] }: { savedVibes: any[] }) => {
  const { theme } = React.useContext(ThemeContext);
  const { t, lang } = React.useContext(LanguageContext);

  // Compute consistency data from real savedVibes
  const categoryCount: Record<string, number> = {};
  savedVibes.forEach(v => {
    const cat = v.category || 'Explore';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  const topCatName = topCategory ? topCategory[0] : null;
  const topCatPercent = topCategory && savedVibes.length > 0 
    ? Math.round((topCategory[1] / savedVibes.length) * 100) 
    : 0;

  const consistencyTitle = savedVibes.length > 0 
    ? (lang === 'id' ? 'Gaya Jalan Lo' : 'Your Travel Style')
    : (lang === 'id' ? 'Belum Ada Data' : 'No Data Yet');
  
  const consistencyDesc = savedVibes.length > 0 
    ? (lang === 'id' 
        ? `${topCatPercent}% trip lo bertema "${topCatName}" — itu vibe dominan lo!`
        : `${topCatPercent}% of your trips are "${topCatName}" — that's your dominant vibe!`)
    : (lang === 'id'
        ? 'Mulai bikin trip dan save buat ngeliat statistik lo di sini.'
        : 'Start creating trips and save them to see your stats here.');

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col">
        <h2 className={`text-3xl font-display font-medium italic ${theme === 'light' ? 'text-slate-950 tracking-tight' : 'text-white'}`}>{t.analytics.title}</h2>
        <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-600 font-medium' : 'opacity-50'}`}>{t.analytics.subtitle}</p>
      </div>
      
      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-500">{t.analytics.weekly}</h3>
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>
        <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'opacity-50'}`}>{t.analytics.mostExplored}: <span className="font-bold">{savedVibes.length > 0 ? Array.from(new Set(savedVibes.map(v => v.category))).join(', ') : (lang === 'id' ? 'Belum ada' : 'None yet')}</span></p>
        <VibeChart savedVibes={savedVibes} />
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="mb-0">
          <Compass className="w-5 h-5 text-indigo-500 mb-3" />
          <p className="text-2xl font-bold">{savedVibes.reduce((acc, v) => acc + (v.places?.length || 0), 0)}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">{t.analytics.gemsFound}</p>
        </GlassCard>
        <GlassCard className="mb-0">
          <Music2 className="w-5 h-5 text-emerald-500 mb-3" />
          <p className="text-2xl font-bold">{savedVibes.length}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Total Trips</p>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-200'} rounded-2xl flex items-center justify-center border`}>
            <History className={`w-6 h-6 ${theme === 'dark' ? 'text-white/40' : 'text-indigo-500/60'}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold">{consistencyTitle}</h4>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'opacity-50'}`}>{consistencyDesc}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
