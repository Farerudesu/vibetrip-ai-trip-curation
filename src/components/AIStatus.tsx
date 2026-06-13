import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

export const AIStatus = () => {
  const { theme } = React.useContext(ThemeContext);
  const { t } = React.useContext(LanguageContext);
  const [steps, setSteps] = useState([
    { text: t.aiStatus[0], done: false },
    { text: t.aiStatus[1], done: false },
    { text: t.aiStatus[2], done: false },
    { text: t.aiStatus[3], done: false }
  ]);

  useEffect(() => {
    setSteps(s => s.map((item, i) => ({ ...item, text: t.aiStatus[i] })));
    
    const timer1 = setTimeout(() => setSteps(s => s.map((item, i) => i === 0 ? { ...item, done: true } : item)), 600);
    const timer2 = setTimeout(() => setSteps(s => s.map((item, i) => i === 1 ? { ...item, done: true } : item)), 1200);
    const timer3 = setTimeout(() => setSteps(s => s.map((item, i) => i === 2 ? { ...item, done: true } : item)), 1800);
    const timer4 = setTimeout(() => setSteps(s => s.map((item, i) => i === 3 ? { ...item, done: true } : item)), 2400);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
  }, [t.aiStatus]);

  return (
    <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-indigo-200 shadow-sm'} p-5 rounded-[24px] backdrop-blur-sm mb-6 relative overflow-hidden group border`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent opacity-50" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${theme === 'light' ? 'text-indigo-600' : 'opacity-50'}`}>{t.result.orchestration}</span>
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-[11px]"
          >
            {step.done ? (
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-spin">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
              </div>
            )}
            <span className={`font-bold tracking-wide ${step.done ? (theme === 'light' ? 'text-slate-900' : 'text-white opacity-90') : (theme === 'light' ? 'text-slate-400' : 'opacity-30')}`}>{step.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
