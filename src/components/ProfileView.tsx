import React, { useState } from 'react';
import { ChevronLeft, Navigation, Heart, LogOut, Sparkles, MapPin, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { auth, logout } from '../firebase';

interface ProfileViewProps {
  savedVibes: any[];
  history?: any[];
  onViewVibe: (item: any) => void;
  onViewResult?: (result: any) => void;
  onLogout?: () => void;
}

export const ProfileView = ({ savedVibes, history = [], onViewVibe, onViewResult, onLogout }: ProfileViewProps) => {
  const { theme } = React.useContext(ThemeContext);
  const { t } = React.useContext(LanguageContext);
  const [selectedVibe, setSelectedVibe] = useState<any>(null);

  const user = auth.currentUser;
  const displayName = user?.displayName || (user?.isAnonymous ? 'Traveler' : 'VibeTrip User');
  const email = user?.email || (user?.isAnonymous ? 'Anonymous Login' : '');
  const photoURL = user?.photoURL || null;

  const totalPlaces = savedVibes.reduce((acc: number, v: any) => acc + (v.places?.length || 0), 0);

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) onLogout();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');

  if (selectedVibe) {
    const vibePlaces = selectedVibe.places || [];
    return (
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-center bg-transparent">
          <button onClick={() => setSelectedVibe(null)} className={`flex items-center gap-2 transition-opacity ${theme === 'light' ? 'text-slate-600 font-bold' : 'opacity-40 hover:opacity-100'}`}>
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-widest">{t.profile.back}</span>
          </button>
          <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">{t.profile.savedVibeTitle || "Saved Vibe"}</span>
          </div>
        </header>

        <div className={`p-8 rounded-[40px] border ${theme === 'dark' ? 'bg-[#0a0c10] border-white/10' : 'bg-white border-slate-200 shadow-xl'} flex flex-col gap-6`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-display font-medium tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>VibeTrip</h2>
              <p className="text-[8px] uppercase tracking-widest text-indigo-500 font-bold">{t.profile.curatedExperience || "Curated Experience"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className={`text-3xl font-display font-medium leading-[1.1] ${theme === 'light' ? 'text-slate-950 italic' : 'text-white italic'}`}>{selectedVibe.title}</h1>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>{selectedVibe.date || 'Saved Trip'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'} p-3 rounded-2xl border`}>
              <p className={`text-[10px] uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>{t.profile.stops || "Stops"}</p>
              <p className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{vibePlaces.length} {t.profile.places || "Places"}</p>
            </div>
            <div className={`${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'} p-3 rounded-2xl border`}>
              <p className={`text-[10px] uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>{t.profile.category || "Category"}</p>
              <p className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedVibe.category || 'Explore'}</p>
            </div>
          </div>

          {vibePlaces.length > 0 && (
            <div className="space-y-4">
              <p className={`text-[10px] uppercase tracking-widest font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>{t.result.highlights || "Itinerary Highlights"}</p>
              {vibePlaces.map((place: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />
                  <div>
                    <p className={`text-xs font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white/80'}`}>{place.name}</p>
                    <p className={`text-[10px] font-medium ${theme === 'light' ? 'text-slate-400' : 'opacity-40'}`}>{place.category || place.description?.substring(0, 50) || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-indigo-500/10 flex items-center justify-between">
             <div className="flex -space-x-1.5">
               {vibePlaces.slice(0, 5).map((place: any, i: number) => (
                 <div key={i} className={`w-7 h-7 rounded-full border-2 ${theme === 'light' ? 'border-white' : 'border-[#0a0c10]'} overflow-hidden shadow-sm flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                   {place.image ? (
                     <img 
                       src={place.image} 
                       className="w-full h-full object-cover" 
                       alt={place.name}
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                       }}
                     />
                   ) : (
                     <MapPin className="w-3 h-3 text-indigo-400" />
                   )}
                 </div>
               ))}
             </div>
             <p className={`text-[8px] uppercase tracking-widest font-mono ${theme === 'light' ? 'text-slate-300' : 'text-white/20'}`}>vibetrip</p>
          </div>
        </div>

        <button 
          onClick={() => {
            onViewVibe(selectedVibe);
            setSelectedVibe(null);
          }}
          className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-bold text-lg active:scale-95 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
        >
          <Navigation className="w-5 h-5 fill-white" />
          {t.result.nav}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-4">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse" />
          <div className="relative w-full h-full rounded-[48px] overflow-hidden border-2 border-white/20">
            {photoURL ? (
              <img 
                src={photoURL} 
                className="w-full h-full object-cover" 
                alt="Profile"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={`absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 ${theme === 'dark' ? 'border-gray-950' : 'border-slate-50'} shadow-xl`}>
            <Sparkles className="w-5 h-5 text-white fill-current" />
          </div>
        </div>
        <h2 className={`text-3xl font-display font-medium tracking-tight ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>{displayName}</h2>
        <p className={`text-sm italic ${theme === 'light' ? 'text-indigo-600 font-medium' : 'opacity-50'}`}>{email}</p>
        <div className="flex gap-4 mt-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{savedVibes.length}</span>
            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">{t.profile.trips}</span>
          </div>
          <div className={`w-[1px] h-8 ${theme === 'dark' ? 'bg-white/10' : 'bg-indigo-500/20'}`} />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{history.length}</span>
            <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">{t.profile.history || "History"}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 px-2 pb-2 mb-4">
        <button 
          onClick={() => setActiveTab('saved')}
          className={`text-xs font-bold uppercase tracking-[0.1em] transition-colors ${activeTab === 'saved' ? (theme === 'light' ? 'text-indigo-600' : 'text-indigo-400') : (theme === 'light' ? 'text-slate-400' : 'text-white/40')}`}
        >
          {t.profile.saved || 'Saved Vibes'}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`text-xs font-bold uppercase tracking-[0.1em] transition-colors ${activeTab === 'history' ? (theme === 'light' ? 'text-indigo-600' : 'text-indigo-400') : (theme === 'light' ? 'text-slate-400' : 'text-white/40')}`}
        >
          {t.profile.history || 'History'}
        </button>
      </div>

      {activeTab === 'saved' ? (
        <>
          {savedVibes.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {savedVibes.map((item: any, i: number) => (
                <GlassCard 
                  key={i} 
                  className="mb-0 p-4 cursor-pointer active:scale-95 transition-transform"
                  onClick={() => setSelectedVibe(item)}
                >
                  <div className={`w-10 h-10 mb-3 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-600'} rounded-2xl flex items-center justify-center border shadow-sm`}>
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-xs font-bold leading-tight">{item.title}</p>
                  <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-1">{item.category}</p>
                  <p className={`text-[9px] mt-1 ${theme === 'dark' ? 'text-white/25' : 'text-slate-400'}`}>{item.date}</p>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="flex flex-col items-center py-8">
              <Heart className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-white/15' : 'text-slate-300'}`} />
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.profile.noSaved || "Belum ada Vibe yang disimpan"}</p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'}`}>{t.profile.noSavedDesc || "Tap ❤️ di hasil rute untuk menyimpan"}</p>
            </GlassCard>
          )}
        </>
      ) : (
        <>
          {history.length > 0 ? (
            <div className="flex flex-col gap-3">
              {history.map((item: any, i: number) => (
                <GlassCard 
                  key={i} 
                  className="p-4 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => onViewResult && onViewResult(item.result)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.title}</p>
                      <p className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-white/40'}`}>"{item.prompt}"</p>
                      <p className={`text-[8px] font-bold uppercase tracking-widest mt-2 ${theme === 'light' ? 'text-indigo-400' : 'text-indigo-500'}`}>
                        {new Date(item.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${theme === 'light' ? 'text-slate-300' : 'text-white/20'}`} />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="flex flex-col items-center py-8">
              <Sparkles className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-white/15' : 'text-slate-300'}`} />
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.profile.noHistory || "Belum ada riwayat prompt"}</p>
            </GlassCard>
          )}
        </>
      )}
      
      <button 
        onClick={handleLogout}
        className="flex items-center justify-center gap-3 text-red-500 font-bold group pt-4"
      >
        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        <span className="text-xs uppercase tracking-widest">{t.profile.signOut}</span>
      </button>
    </div>
  );
};
