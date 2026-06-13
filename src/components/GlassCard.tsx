import React from 'react';
import { motion } from 'motion/react';
import { ThemeContext } from '../contexts/ThemeContext';

export const GlassCard = ({ children, className = "", delay = 0, ...props }: { children: React.ReactNode, className?: string, delay?: number } & any) => {
  const { theme } = React.useContext(ThemeContext);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
      className={`${
        theme === 'dark' 
          ? 'glass text-white' 
          : 'glass-light text-slate-900 shadow-[0_2px_24px_rgb(0,0,0,0.04)]'
      } rounded-2xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
};
