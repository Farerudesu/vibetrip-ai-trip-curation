import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

export const LoginScreen = ({ 
  onLogin, 
  onGuestLogin, 
  isConnecting, 
  error 
}: { 
  onLogin: () => void, 
  onGuestLogin: () => void, 
  isConnecting: boolean, 
  error?: string | null 
}) => {
  const { t } = React.useContext(LanguageContext);
  const { theme } = React.useContext(ThemeContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0, filter: 'blur(4px)' },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 25, stiffness: 140 }
    }
  };

  return (
    <div className={`h-screen relative flex flex-col overflow-hidden transition-colors duration-500 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-gray-950 text-white'}`}>
      {/* Static Ambient glow - High performance, no constant repaint/layout loops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className={`absolute top-[-30%] right-[-20%] w-[80%] h-[80%] blur-[100px] rounded-full transition-colors duration-500 ${
            theme === 'light' ? 'bg-indigo-600/10' : 'bg-indigo-600/25'
          }`}
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.2 }}
          className={`absolute bottom-[-20%] left-[-15%] w-[70%] h-[70%] blur-[120px] rounded-full transition-colors duration-500 ${
            theme === 'light' ? 'bg-violet-500/5' : 'bg-violet-500/15'
          }`}
        />
      </div>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center px-8 z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="mb-16 flex flex-col items-center"
        >
          {/* Logo */}
          <div className="relative w-12 h-16 mb-8">
            <motion.svg 
              viewBox="0 0 60 80" 
              fill="none" 
              className="w-full h-full"
            >
              <motion.path 
                d="M10 10L30 70L50 10" 
                stroke="url(#logoGrad)" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="logoGrad" x1="10" y1="10" x2="50" y2="70">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>
          
          <h1 className={`text-3xl font-display font-medium tracking-tight mb-2 transition-colors duration-500 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>VibeTrip</h1>
          <p className={`text-sm font-light text-center max-w-[280px] transition-colors duration-500 ${theme === 'light' ? 'text-slate-500' : 'text-white/30'}`}>
            {t.landing.description.split('.')[0]}.
          </p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="w-full max-w-xs space-y-4"
        >
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={onLogin}
            disabled={isConnecting}
            className={`w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all relative overflow-hidden ${
              theme === 'light'
                ? 'bg-white text-slate-800 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:bg-slate-50'
                : 'bg-white text-gray-900 shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:bg-white/95'
            } disabled:opacity-50`}
          >
            {isConnecting ? (
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
                <span className="text-xs uppercase tracking-widest text-indigo-500">
                  {t.login?.connecting || "Connecting..."}
                </span>
              </div>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs uppercase tracking-[0.15em] font-bold">
                  {t.login?.continueWithGoogle || "Continue with Google"}
                </span>
              </>
            )}
          </motion.button>
          
          {/* Continue as Guest Button */}
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={onGuestLogin}
            disabled={isConnecting}
            className={`w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all border ${
              theme === 'light'
                ? 'bg-slate-100/60 hover:bg-slate-200/50 text-slate-600 border-slate-200/80'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10 hover:text-white'
            } disabled:opacity-50`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs uppercase tracking-[0.15em] font-bold">
              {t.login?.continueAsGuest || "Continue as Guest"}
            </span>
          </motion.button>
          
          <p className={`text-[10px] text-center leading-relaxed pt-2 transition-colors duration-500 ${theme === 'light' ? 'text-slate-400' : 'text-white/15'}`}>
            {t.login?.agreement || "By continuing, you agree to discover life beyond the highway."}
          </p>

          {/* Inline Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-200/80 leading-relaxed font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>
      </motion.main>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-6 text-center"
      >
         <span className={`text-[9px] font-mono tracking-[0.3em] transition-colors duration-500 ${theme === 'light' ? 'text-slate-300' : 'text-white/10'}`}>VIBETRIP v2.6</span>
      </motion.footer>
    </div>
  );
};
