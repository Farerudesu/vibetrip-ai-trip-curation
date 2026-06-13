import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, X, Share2, Sparkles } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { weatherCodeMap } from '../data/constants';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

const getWeatherInfo = (code: number) => {
  return weatherCodeMap[code] || { label: `Kode ${code}`, iconType: 'cloud' as const };
};

export const ShareModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { t } = React.useContext(LanguageContext);
  const { theme } = React.useContext(ThemeContext);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, { cacheBust: true });
      
      if (Capacitor.isNativePlatform()) {
        const base64Data = dataUrl.split(',')[1];
        const fileName = `VibeTrip_${Date.now()}.png`;
        
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        
        await Share.share({
          title: t.share.webShareTitle || 'VibeTrip Route',
          text: t.share.webShareText || 'Check out this VibeTrip route!',
          url: savedFile.uri,
          dialogTitle: t.share.dialogTitle || 'Save or Share Route'
        });
      } else {
        const link = document.createElement('a');
        link.download = `VibeTrip-Tenggarong-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-sm border rounded-[40px] overflow-hidden flex flex-col shadow-2xl transition-colors duration-500 ${
              theme === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#0a0c10] text-white border-white/10'
            }`}
          >
            <div className={`p-6 border-b flex items-center justify-between transition-colors ${
              theme === 'light' ? 'border-slate-100' : 'border-white/5'
            }`}>
              <h3 className="font-display text-lg">{t.share.summary || "Trip Summary"}</h3>
              <button 
                onClick={onClose} 
                className={`p-2 rounded-full transition-colors ${
                  theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/5 text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
              {/* Preview Container (What will be captured) */}
              <div 
                ref={exportRef} 
                className={`aspect-[9/16] relative p-8 border rounded-[32px] flex flex-col gap-6 transition-colors duration-500 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0c10] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-display font-medium tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>VibeTrip</h2>
                    <p className={`text-[8px] uppercase tracking-widest font-bold ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                      {t.profile.curatedExperience || "Curated Experience"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className={`text-3xl font-display font-medium leading-[1.1] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {data?.route_plan?.title || (t.result.newRoute || "VibeTrip Route")}
                  </h1>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>
                    {data?.route_plan?.origin || "Unknown"} — {data?.route_plan?.destination || "Unknown"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>
                      {t.share.departure || "Departure"}
                    </p>
                    <p className="text-sm font-bold">{data?.route_plan?.peak_time || "Now"}</p>
                  </div>
                  <div className={`p-3 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>
                      {t.share.weather || "Weather"}
                    </p>
                    <p className="text-sm font-bold">
                      {data?.current_weather ? `${getWeatherInfo(data.current_weather.weathercode).label} • ${data.current_weather.temperature}°C` : "Clear"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className={`text-[10px] uppercase tracking-widest font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>
                     {t.result.highlights || "Itinerary Highlights"}
                   </p>
                   {(data?.curated_places || []).map((step: any, i: number) => (
                     <div key={i} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />
                        <div>
                          <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{step.name || step.location}</p>
                          <p className={`text-[10px] ${theme === 'light' ? 'text-slate-400' : 'opacity-40'}`}>{step.category}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className={`mt-4 pt-4 border-t flex items-center justify-between ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
                   <div className="flex -space-x-1.5">
                     {(data?.curated_places || []).slice(0, 3).map((gem: any, idx: number) => (
                       <div key={idx} className={`w-6 h-6 rounded-full border overflow-hidden flex items-center justify-center ${
                         theme === 'light' ? 'border-white bg-indigo-100 text-indigo-700' : 'border-[#0a0c10] bg-indigo-900 text-white'
                       }`}>
                         <span className="text-[8px] font-bold">{idx + 1}</span>
                       </div>
                     ))}
                   </div>
                   <p className={`text-[8px] uppercase tracking-widest font-mono ${theme === 'light' ? 'text-slate-300' : 'text-white/20'}`}>vibetripp.io</p>
                </div>
              </div>
            </div>

            <div className={`p-6 border-t flex flex-col gap-3 transition-colors ${
              theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5 backdrop-blur-xl'
            }`}>
              <button 
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full py-4 bg-indigo-600 text-white rounded-[20px] font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {isExporting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                {isExporting ? (t.share.generating || 'Generating Image...') : (t.share.saveImage || 'Save as Image')}
              </button>
              <button 
                className={`w-full py-4 border rounded-[20px] font-bold text-sm transition-colors ${
                  theme === 'light' 
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                    : 'border-white/10 hover:bg-white/5 text-white'
                }`}
              >
                {t.share.copyLink || "Copy Share Link"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
