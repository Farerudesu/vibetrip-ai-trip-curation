import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Sparkles } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { TRANSLATIONS } from '../data/constants';

export const LoadingScreen = ({ isLangSwitch = false }: { isLangSwitch?: boolean }) => {
  const [textIndex, setTextIndex] = useState(0);
  const { lang } = React.useContext(LanguageContext);
  const { theme } = React.useContext(ThemeContext);

  // Determine target language context. When switching languages, 'lang' is still the old language
  const displayLang = isLangSwitch ? (lang === 'en' ? 'id' : 'en') : lang;
  const displayT = TRANSLATIONS[displayLang];

  const loadingTexts = isLangSwitch 
    ? displayT.langSwitch 
    : displayT.loading;

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loadingTexts.length, isLangSwitch]);

  const titleMain = isLangSwitch 
    ? (displayLang === 'id' ? "Menyelaraskan" : "Re-calibrating")
    : (displayLang === 'id' ? "Meracik" : "Synthesizing Your");

  const titleSub = isLangSwitch 
    ? (displayLang === 'id' ? "Bahasa Anda" : "Linguistics")
    : (displayLang === 'id' ? "Petualangan Seru" : "Next Journey");

  const warningText = displayLang === 'id'
    ? "Proses AI membutuhkan waktu sekitar 10-15 detik. Harap bersabar ya."
    : "AI synthesis takes about 10-15 seconds. Please be patient.";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center overflow-hidden transition-colors duration-500 ${
        theme === 'light' ? 'bg-slate-50' : 'bg-[#020617]'
      }`}
    >
      {/* Dynamic Background Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.4,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: [null, Math.random() * -100 - 50],
            opacity: [null, 0],
          }}
          transition={{ 
            duration: Math.random() * 3 + 2, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className={`absolute w-1 h-1 rounded-full ${
            theme === 'light' ? 'bg-indigo-400/40' : 'bg-indigo-500'
          }`}
        />
      ))}

      <div className="z-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <div className="relative w-28 h-28 mb-8 mx-auto">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1], 
                rotate: [0, 360],
                borderWidth: ["2px", "4px", "2px"]
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className={`absolute inset-0 border-dashed rounded-full ${
                theme === 'light' ? 'border-indigo-500/20' : 'border-indigo-500/30'
              }`}
            />
            <div className="absolute inset-4 bg-indigo-600 rounded-[24px] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] backdrop-blur-sm">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {isLangSwitch ? (
                  <Globe className="w-10 h-10 text-white" />
                ) : (
                  <Sparkles className="w-10 h-10 text-white fill-current" />
                )}
              </motion.div>
            </div>
          </div>
          
          <h2 className={`text-4xl font-display font-medium tracking-tighter italic mb-2 transition-colors duration-500 ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {titleMain} <br/>
            <span className={`not-italic transition-colors duration-500 ${
              theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
            }`}>{titleSub}</span>
          </h2>
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${displayLang}-${isLangSwitch}-${textIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-6"
          >
            <p className={`text-lg font-display font-light italic tracking-wide h-8 transition-colors duration-500 ${
              theme === 'light' ? 'text-slate-500' : 'text-white/50'
            }`}>
              {loadingTexts[textIndex]}
            </p>
            
            <div className="flex gap-2 items-end h-8">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [8, 32, 8],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
              ))}
            </div>

            {!isLangSwitch && (
              <p className={`text-[10px] max-w-[200px] mt-4 leading-relaxed font-medium transition-colors duration-500 ${
                theme === 'light' ? 'text-slate-400/80' : 'text-white/30'
              }`}>
                {warningText}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
