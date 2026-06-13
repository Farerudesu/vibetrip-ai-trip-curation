import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, Navigation, Share2, Heart, Clock, Star, MapPin, ExternalLink, Send } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { auth, db, loginWithGoogle, loginAnonymously, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { ThemeContext } from './contexts/ThemeContext';
import { LanguageContext } from './contexts/LanguageContext';
import { TRANSLATIONS, HIDDEN_GEMS, weatherCodeMap } from './data/constants';

import { GlassCard } from './components/GlassCard';
import { AIStatus } from './components/AIStatus';
import { LoadingScreen } from './components/LoadingScreen';
import { MapOverlay } from './components/MapOverlay';
import { ShareModal } from './components/ShareModal';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { WeatherIcon } from './components/WeatherIcon';
import { ToastContainer, ToastProps, ToastType } from './components/Toast';

const getWeatherInfo = (code: number) => {
  return weatherCodeMap[code] || { label: `Kode ${code}`, iconType: 'cloud' as const };
};

// Build API URL dynamically — uses env vars for native builds, relative path for web
const getApiUrl = (path: string) => {
  if (Capacitor.isNativePlatform()) {
    const host = import.meta.env.VITE_SERVER_HOST || 'localhost';
    const port = import.meta.env.VITE_SERVER_PORT || '3000';
    return `http://${host}:${port}${path}`;
  }
  return path;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'profile' | 'settings'>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('vibetrip_theme') as 'dark' | 'light') || 'dark';
  });
  const [lang, setLang] = useState<'en' | 'id'>(() => {
    return (localStorage.getItem('vibetrip_lang') as 'en' | 'id') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('vibetrip_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('vibetrip_lang', lang);
  }, [lang]);

  const [view, setView] = useState<'landing' | 'prompt' | 'result'>('landing');
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [savedVibes, setSavedVibes] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('vibetrip_saved') || '[]');
    } catch { return []; }
  });
  
  const [history, setHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('vibetrip_history') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    // Safety timeout: If Firebase takes too long to load (e.g. network issue or database connection blocked),
    // bypass the splash screen after 4 seconds so the user isn't stuck on "Menyiapkan".
    const timeoutId = setTimeout(() => {
      setIsFirebaseLoaded(true);
      console.warn("Firebase initialization timed out, bypassing splash screen.");
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeoutId);
      if (user) {
        setIsAuthenticated(true);
        setIsConnecting(false);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.savedVibes) {
              setSavedVibes(prev => {
                const combined = [...prev, ...data.savedVibes];
                return Array.from(new Map(combined.map(item => [item.id, item])).values());
              });
            }
            if (data.history) {
              setHistory(prev => {
                const combined = [...prev, ...data.history];
                return Array.from(new Map(combined.map(item => [item.id, item])).values())
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              });
            }
          }
        } catch (e) {
          console.error("Error loading user data", e);
        }
        setIsFirebaseLoaded(true);
      } else {
        setIsFirebaseLoaded(true);
        setIsAuthenticated(false);
        setIsConnecting(false);
      }
    });
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSwitchingLang, setIsSwitchingLang] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showShare, setShowShare] = useState(false);
  
  const [promptInput, setPromptInput] = useState("");
  const [curationResult, setCurationResult] = useState<any>(null);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const fallbackDest = { lat: -0.4284, lng: 116.9830 };
  const activePlaces = curationResult?.curated_places?.length ? curationResult.curated_places : HIDDEN_GEMS;
  
  const mapOrigin = userLoc || (activePlaces.length > 0 ? activePlaces[0].location : fallbackDest);
  const mapDestination = activePlaces.length > 0 ? activePlaces[activePlaces.length - 1].location : fallbackDest;
  
  const originStr = `${mapOrigin.lat},${mapOrigin.lng}`;
  const destStr = `${mapDestination.lat},${mapDestination.lng}`;
  
  const waypointsStr = activePlaces.length > 1 
    ? activePlaces.slice(0, -1).map((gem: any) => `${gem.location.lat},${gem.location.lng}`).join('|')
    : '';
    
  const dynamicMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}${waypointsStr ? `&waypoints=${waypointsStr}` : ''}&travelmode=driving`;

  const currentVibeId = curationResult?.route_plan?.title
    ? curationResult.route_plan.title.toLowerCase().replace(/\s+/g, '-')
    : null;

  const isCurrentVibeSaved = currentVibeId ? savedVibes.some(v => v.id === currentVibeId) : false;

  useEffect(() => {
    localStorage.setItem('vibetrip_saved', JSON.stringify(savedVibes));
    localStorage.setItem('vibetrip_history', JSON.stringify(history));
    if (auth.currentUser && isFirebaseLoaded) {
      setDoc(doc(db, 'users', auth.currentUser.uid), { savedVibes, history }, { merge: true })
        .catch(e => console.error("Error saving to Firestore", e));
    }
  }, [savedVibes, history, isFirebaseLoaded]);

  const toggleSaveCurrentVibe = () => {
    if (!curationResult || !currentVibeId) return;
    if (isCurrentVibeSaved) {
      setSavedVibes(prev => prev.filter(v => v.id !== currentVibeId));
    } else {
      setSavedVibes(prev => [...prev, {
        id: currentVibeId,
        title: curationResult.route_plan?.title || 'Untitled Vibe',
        category: curationResult.curated_places?.[0]?.category || 'Explore',
        vibe: curationResult.vibe_summary?.substring(0, 80) || '',
        date: new Date().toLocaleDateString('id-ID'),
        places: curationResult.curated_places || [],
        prompt: promptInput
      }]);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, view]);

  const t = TRANSLATIONS[lang];
  const prefilledPrompt = t.prompt.placeholder;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.body.className = theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900';
  }, [theme]);

  const handleLogin = async () => {
    setIsConnecting(true);
    setLoginError(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        setIsAuthenticated(true);
      } else {
        setLoginError(t.login?.guestMode || "Native Google Login failed. Continuing in Guest Mode.");
        setTimeout(() => setIsAuthenticated(true), 1500);
      }
      setIsConnecting(false);
    } catch (e: any) {
      console.error(e);
      setLoginError(e.message || t.login?.signInFailed || "Failed to sign in. Please try again.");
      setIsConnecting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsConnecting(true);
    setLoginError(null);
    try {
      const user = await loginAnonymously();
      if (user) {
        setIsAuthenticated(true);
      } else {
        setLoginError(t.login?.signInFailed || "Failed to sign in. Please try again.");
      }
      setIsConnecting(false);
    } catch (e: any) {
      console.error(e);
      setLoginError(e.message || t.login?.signInFailed || "Failed to sign in. Please try again.");
      setIsConnecting(false);
    }
  };

  const handleStartCuration = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setApiError(null);
    
    let currentLoc: any;
    try {
      const position = await Geolocation.getCurrentPosition({ timeout: 8000, enableHighAccuracy: true });
      currentLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      // Reverse Geocoding to get location name
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${currentLoc.lat}&lon=${currentLoc.lng}`);
        const geoData = await geoRes.json();
        const addr = geoData.address || {};
        const placeName = addr.amenity || addr.road || addr.neighbourhood || addr.suburb || addr.village || addr.city || "Lokasi Anda saat ini";
        currentLoc.name = placeName;
      } catch (e) {
        currentLoc.name = "Lokasi Anda saat ini";
      }
      
      setUserLoc(currentLoc);
    } catch (e) {
      console.warn("Capacitor Geolocation failed or denied", e);
      setIsLoading(false);
      addToast(t.result.locationDeny || "Izin lokasi diperlukan untuk meracik rute yang akurat.", "error");
      return; 
    }
    
    try {
      const apiUrl = getApiUrl('/api/vibe-route');
        
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptInput || prefilledPrompt, 
          location: currentLoc,
          lang: lang
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || "Gagal membuat rute");
      }
      
      setCurationResult(data);
      setExpandedCards({});
      
      const newHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        title: data.route_plan?.title || 'Untitled',
        prompt: promptInput || prefilledPrompt,
        date: new Date().toISOString(),
        result: data
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      
      setTimeout(() => {
        setView('result');
        setIsLoading(false);
      }, 1500);
      
    } catch (err: any) {
      console.error("Failed to fetch vibe route:", err);
      setIsLoading(false);
      
      const errMsg = err.message || "";
      if (err.name === 'AbortError') {
        setApiError(lang === 'id' 
          ? "Gagal terhubung ke server (Timeout 45 detik). Pastikan server menyala dan koneksi internet stabil."
          : "Failed to connect to server (Timeout 45s). Please make sure the server is running and internet is connected."
        );
      } else if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        setApiError(lang === 'id'
          ? "Ups! Otak AI VibeTrip lagi kepenuhan (API Limit tercapai). Coba lagi beberapa detik/menit ya."
          : "Oops! VibeTrip AI is currently busy (API Limit reached). Please try again in a few seconds."
        );
      } else {
        setApiError(lang === 'id' ? `Gagal meracik rute: ${errMsg}` : `Failed to curate route: ${errMsg}`);
      }
    }
  };

  const handleRefineCuration = async () => {
    if (isRefining || !refinePrompt.trim()) return;
    setIsRefining(true);
    setApiError(null);
    
    try {
      const apiUrl = getApiUrl('/api/vibe-route');
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: refinePrompt, 
          location: userLoc,
          history: curationResult,
          lang: lang
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || "Gagal memodifikasi rute");
      }
      
      setCurationResult(data);
      setRefinePrompt("");
      setExpandedCards({});
      
      const newHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        title: data.route_plan?.title || 'Refined Route',
        prompt: refinePrompt,
        date: new Date().toISOString(),
        result: data
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      console.error(e);
      setApiError(e.message || (lang === 'id' ? "Gagal memodifikasi rute." : "Failed to modify route."));
    } finally {
      setIsRefining(false);
    }
  };

  const changeLang = (newLang: 'en' | 'id') => {
    setIsSwitchingLang(true);
    setTimeout(() => {
      setLang(newLang);
      setIsSwitchingLang(false);
    }, 1500);
  };
  // ─── Landing View ────────────────────────────────────────
  const userName = auth.currentUser?.displayName?.split(' ')[0] || 
                   (auth.currentUser?.isAnonymous ? 'Traveler' : 'Explorer');

  const renderLanding = () => (
    <div className="min-h-[85vh] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Welcome greeting */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <p className={`text-sm font-medium ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400/80'}`}>
            {lang === 'id' ? `Hai, selamat datang` : `Hey, welcome back`} 👋
          </p>
          <h2 className={`text-2xl font-display font-semibold tracking-tight mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {userName}
          </h2>
        </motion.div>

        {/* Badge */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8 bg-indigo-500/60" />
          <span className="text-[9px] uppercase font-semibold tracking-[0.5em] text-indigo-400/80 font-mono">
            Curator v2.6
          </span>
        </div>
        
        {/* Headline */}
        <h1 className={`text-5xl font-display font-medium leading-[0.9] tracking-tight mb-10 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
          <span className="italic">{t.landing.findYour}</span> <br/>
          <span className={`${theme === 'light' ? 'text-slate-400' : 'text-white/15'}`}>{t.landing.nextJourney}</span> <br/>
          <span className="relative">
            {t.landing.byFeeling}
            <span className="absolute bottom-1 left-0 right-0 h-2 bg-indigo-500/20 rounded-full -z-10" />
          </span>
        </h1>
        
        {/* Description */}
        <p className={`text-sm leading-relaxed max-w-[260px] mb-12 ${theme === 'light' ? 'text-slate-500' : 'text-white/30'}`}>
          {t.landing.description}
        </p>

        {/* Progress bar */}
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
            onAnimationComplete={() => setView('prompt')}
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full relative"
          />
        </div>
        <motion.p 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[9px] uppercase tracking-[0.4em] font-medium text-indigo-400/60 mt-4 text-center"
        >
          {t.landing.initializing}
        </motion.p>
      </motion.div>
    </div>
  );

  // ─── Prompt View ─────────────────────────────────────────
  const renderPrompt = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-[85vh] pt-2"
    >
      {/* Back button */}
      <nav className="mb-8">
        <button 
          onClick={() => setView('landing')} 
          className={`flex items-center gap-2 group ${theme === 'light' ? 'text-slate-500' : 'text-white/40'} hover:text-indigo-400 transition-colors`}
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-[10px] uppercase font-semibold tracking-[0.15em]">{t.prompt.back}</span>
        </button>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <motion.p 
          initial={{ opacity: 0, x: -8 }} 
          animate={{ opacity: 1, x: 0 }}
          className="text-indigo-400 font-display italic text-base mb-1"
        >
          {t.prompt.greeting}
        </motion.p>
        <h2 className={`text-3xl font-display font-medium tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
          {t.prompt.intent}
        </h2>
      </div>

      {/* Input Card */}
      <GlassCard className="flex-1 min-h-[140px] max-h-[180px] flex flex-col gap-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/15 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${theme === 'dark' ? 'text-white/25' : 'text-slate-400'}`}>
            {t.prompt.receptor}
          </span>
        </div>
        <textarea 
          id="prompt-input"
          name="prompt-input"
          className={`flex-1 w-full bg-transparent border-none text-lg font-sans font-normal leading-relaxed focus:ring-0 resize-none p-0 ${theme === 'light' ? 'placeholder:text-slate-300 text-slate-800' : 'placeholder:text-white/20 text-white'}`}
          placeholder={prefilledPrompt}
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
        />
      </GlassCard>

      {/* Error */}
      {apiError && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}
        >
          <span className="mt-0.5 text-base">⚠️</span>
          <p className="flex-1 leading-relaxed text-xs">{apiError}</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="mt-6 mb-4">
        <button 
          onClick={handleStartCuration}
          disabled={isLoading}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-semibold text-sm active:scale-[0.97] transition-all shadow-[0_8px_32px_rgba(99,102,241,0.3)]"
        >
          {t.prompt.synthesize} {isLoading ? "..." : ""}
        </button>
      </div>
    </motion.div>
  );

  // ─── Result View ─────────────────────────────────────────
  const renderResult = () => (
    <div className="flex flex-col gap-5">
      <MapOverlay 
        isOpen={showMap} 
        onClose={() => setShowMap(false)} 
        googleMapsUrl={dynamicMapsUrl} 
        activePlaces={activePlaces} 
        origin={mapOrigin} 
        destination={mapDestination} 
      />
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} data={curationResult} />
      
      {/* Header */}
      <header className="pt-2">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setView('prompt')} 
            className={`flex items-center gap-2 group ${theme === 'light' ? 'text-slate-500' : 'text-white/40'} hover:text-indigo-400 transition-colors`}
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase">{t.result.newVibe}</span>
          </button>
          <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${theme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
            <Sparkles className="w-2.5 h-2.5" />
            <span className="text-[8px] font-semibold tracking-[0.15em] uppercase">{t.result.liveSynthesis}</span>
          </div>
        </div>

        {/* Route Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className={`text-3xl font-display font-medium tracking-tight leading-tight mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {curationResult?.route_plan?.title || t.result.newRoute || "Rute Baru"}
          </h1>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-500' : 'text-white/40'}`}>
              {curationResult?.route_plan?.origin || "Samarinda"} → {curationResult?.route_plan?.destination || "Tenggarong"}
            </p>
          </div>
          <p className={`text-xs leading-relaxed max-w-[300px] ${theme === 'light' ? 'text-slate-500' : 'text-white/35'}`}>
            {curationResult?.vibe_summary || t.result.readyMessage}
          </p>
        </motion.div>
      </header>

      <AIStatus />

      {/* Relative container wrapping Weather Card and Destinations for partial loading loader */}
      <div className="relative">
        <AnimatePresence>
          {isRefining && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-20 backdrop-blur-[3px] rounded-3xl flex flex-col items-center justify-center p-6 ${
                theme === 'light' ? 'bg-slate-50/70' : 'bg-gray-950/70'
              }`}
            >
              <div className={`p-6 rounded-2xl border flex flex-col items-center gap-3 shadow-lg ${
                theme === 'light' ? 'bg-white border-slate-100' : 'bg-white/5 border-white/10'
              }`}>
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
                  />
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 absolute" />
                </div>
                <p className={`text-xs font-semibold tracking-wide text-center animate-pulse ${
                  theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  {t.result.modifying || "Menyesuaikan rute..."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weather Card */}
        <GlassCard delay={0.15} className={`${theme === 'light' ? 'bg-indigo-50/60 border-indigo-100' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>
              {t.result.atmosphere || "Atmosfer"}
            </h3>
            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-md ${theme === 'light' ? 'bg-white text-slate-500' : 'bg-white/5 text-white/40'}`}>
              {t.result.peak || "Puncak"}: {curationResult?.route_plan?.peak_time || 'Sekarang'}
            </span>
          </div>
          <div className="flex gap-4">
            {/* Current Weather */}
            <div className="flex-1 flex flex-col gap-1 border-r border-indigo-500/10 pr-4">
              <p className={`text-[9px] uppercase font-semibold ${theme === 'dark' ? 'text-white/25' : 'text-slate-400'}`}>{t.result.current || "Saat Ini"}</p>
            {curationResult?.current_weather ? (
              <div className="flex items-end gap-2">
                <span className="text-2xl font-light leading-none">{Math.round(curationResult.current_weather.temperature)}°</span>
                <WeatherIcon type={getWeatherInfo(curationResult.current_weather.weathercode).iconType} className={`w-4 h-4 mb-0.5 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`} />
              </div>
            ) : (
              <span className="text-sm font-medium">--°</span>
            )}
            <p className={`text-[9px] mt-0.5 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>
              {curationResult?.current_weather ? getWeatherInfo(curationResult.current_weather.weathercode).label : (t.result.loadingText || 'Memuat...')}
            </p>
          </div>
          {/* Forecast */}
          <div className="flex-[1.5] grid grid-cols-2 gap-2">
            {(curationResult?.hourly_forecast || [
              { time: '--:--', temp: '--', weathercode: 2 },
              { time: '--:--', temp: '--', weathercode: 2 }
            ]).slice(1, 3).map((w: any, i: number) => {
              const wInfo = getWeatherInfo(w.weathercode);
              return (
                <div key={i} className={`flex flex-col gap-0.5 p-2 rounded-lg ${theme === 'light' ? 'bg-white/70' : 'bg-white/5'}`}>
                  <span className={`text-[8px] font-semibold ${theme === 'dark' ? 'text-white/25' : 'text-slate-400'}`}>{w.time}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{w.temp}°</span>
                    <WeatherIcon type={wInfo.iconType} className="w-3 h-3 opacity-50" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Destinations Timeline */}
      <div>
        <h3 className={`text-[10px] font-semibold uppercase tracking-[0.15em] mb-4 ml-1 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>
          {t.profile.places || "Destinasi"} • {(curationResult?.curated_places || HIDDEN_GEMS).length} {t.result.stopsSuffix || "titik"}
        </h3>
        <div className="flex flex-col gap-3">
          {(curationResult?.curated_places || HIDDEN_GEMS).map((gem: any, idx: number) => {
            const isExpanded = expandedCards[gem.id || idx];
            const totalPlaces = (curationResult?.curated_places || HIDDEN_GEMS).length;
            return (
              <motion.div 
                key={gem.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
                className={`relative rounded-2xl overflow-hidden border ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'} transition-all duration-300`}
              >
                {/* Step number indicator */}
                <div className="flex">
                  {/* Left timeline strip */}
                  <div className="flex flex-col items-center py-4 px-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      idx === 0 ? 'bg-indigo-500 text-white' : 
                      idx === totalPlaces - 1 ? 'bg-emerald-500 text-white' :
                      theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </div>
                    {idx < totalPlaces - 1 && (
                      <div className={`w-px flex-1 mt-2 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-3 pr-4">
                    <div className="flex items-start gap-3">
                      {/* Image */}
                      <img 
                        src={gem.image || `https://loremflickr.com/200/200/${encodeURIComponent(gem.category || 'landscape')}`} 
                        className={`h-16 w-16 object-cover rounded-xl flex-shrink-0 ${theme === 'light' ? 'bg-slate-100' : 'bg-white/5'}`} 
                        alt={gem.name}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('ui-avatars')) {
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gem.name)}&background=6366f1&color=fff&size=200&font-size=0.33`;
                          }
                        }}
                      />
                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[8px] text-indigo-400 font-semibold uppercase tracking-[0.1em]">{gem.category || "Hidden Gem"}</span>
                          {gem.rating && (
                            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {gem.rating}
                            </span>
                          )}
                        </div>
                        <h4 className={`font-medium text-sm mt-0.5 leading-snug ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          {gem.name}
                        </h4>
                        
                        {/* Expandable description */}
                        <div 
                          className="cursor-pointer mt-1"
                          onClick={() => setExpandedCards(prev => ({...prev, [gem.id || idx]: !isExpanded}))}
                        >
                          <p className={`text-[11px] leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-2'} ${theme === 'light' ? 'text-slate-500' : 'text-white/45'}`}>
                            {gem.description}
                          </p>
                          {!isExpanded && gem.description?.length > 70 && (
                            <span className="text-[9px] font-semibold text-indigo-400 mt-0.5 inline-block">{t.result.readMore || "Selengkapnya"}</span>
                          )}
                        </div>

                        {/* Google Maps link */}
                        <a 
                          href={gem.location?.lat ? `https://www.google.com/maps/search/?api=1&query=${gem.location.lat},${gem.location.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gem.name)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-400 mt-2 hover:text-indigo-300 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          {t.result.viewOnMaps || "Lihat di Maps"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 pt-2 pb-2">
        {/* Refinement Chat Box */}
        <div className={`p-2 pl-4 rounded-2xl border flex gap-2 items-center ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <textarea 
            placeholder={t.result.modifyPlaceholder || "Modifikasi rute..."}
            className={`flex-1 bg-transparent border-none text-sm font-sans resize-none py-2 h-10 focus:ring-0 leading-tight ${theme === 'light' ? 'text-slate-800 placeholder:text-slate-300' : 'text-white placeholder:text-white/20'}`}
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRefineCuration();
              }
            }}
          />
          <button 
            onClick={handleRefineCuration}
            disabled={isRefining || !refinePrompt.trim()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              !refinePrompt.trim() 
                ? theme === 'dark' ? 'bg-white/5 text-white/20' : 'bg-slate-100 text-slate-300'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            {isRefining ? <span className="text-xs animate-pulse">•••</span> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Error display for refinement */}
        {apiError && (
          <motion.div 
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl text-xs font-medium ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/15 text-red-400' : 'bg-red-50 border border-red-200 text-red-500'}`}
          >
            ⚠️ {apiError}
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <a 
            href={dynamicMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
          >
            <Navigation className="w-4 h-4 fill-white" />
            {t.result.nav}
          </a>
          <button 
            onClick={() => setShowShare(true)} 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.08]' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
          >
            <Share2 className={`w-4 h-4 ${theme === 'light' ? 'text-slate-500' : 'text-white/35'}`} />
          </button>
          <button 
            onClick={toggleSaveCurrentVibe}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.08]' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${isCurrentVibeSaved ? 'text-rose-500 fill-current scale-110' : (theme === 'light' ? 'text-slate-500 hover:text-rose-400' : 'text-white/35 hover:text-rose-400')}`} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      <ThemeContext.Provider value={{ theme }}>
        <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
          {/* Ambient background glow */}
          {theme === 'dark' && (
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-[-20%] right-[-15%] w-[60%] h-[60%] bg-indigo-600/[0.06] blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/[0.04] blur-[100px] rounded-full" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isFirebaseLoaded ? (
              <motion.div
                key="splash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-[100] flex items-center justify-center transition-colors duration-500 ${
                  theme === 'light' ? 'bg-slate-50' : 'bg-[#020617]'
                }`}
              >
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <span className={`font-display font-bold tracking-widest text-xs uppercase transition-colors duration-500 ${
                    theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
                  }`}>
                    {lang === 'id' ? 'Menyiapkan' : 'Initializing'}
                  </span>
                </div>
              </motion.div>
            ) : !isAuthenticated ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60]"
              >
                <LoginScreen onLogin={handleLogin} onGuestLogin={handleGuestLogin} isConnecting={isConnecting} error={loginError} />
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-5"
              >
                <header className="flex justify-between items-center py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Navigation className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-display font-bold text-lg tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      VibeTrip.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => changeLang(lang === 'id' ? 'en' : 'id')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${theme === 'dark' ? 'bg-white/10 text-white/60 hover:text-white hover:bg-white/15' : 'bg-slate-200 text-slate-500 hover:text-slate-800'}`}
                    >
                      {lang === 'id' ? 'ID' : 'EN'}
                    </button>
                    <button 
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-200 hover:bg-slate-300'}`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`} />
                    </button>
                  </div>
                </header>

                <main className="flex-1 flex flex-col">
                  <div className="flex-1 relative">
                    <div className={`pb-28 ${activeTab === 'home' ? 'block' : 'hidden'}`}>
                      <AnimatePresence mode="wait">
                        {view === 'landing' && <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderLanding()}</motion.div>}
                        {view === 'prompt' && <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPrompt()}</motion.div>}
                        {view === 'result' && <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderResult()}</motion.div>}
                      </AnimatePresence>
                    </div>

                    <div className={`pb-28 ${activeTab === 'analytics' ? 'block' : 'hidden'}`}>
                      <AnalyticsView savedVibes={savedVibes} />
                    </div>

                    <div className={`pb-28 ${activeTab === 'profile' ? 'block' : 'hidden'}`}>
                      <ProfileView 
                        savedVibes={savedVibes} 
                        history={history}
                        onViewVibe={(item) => {
                          setCurationResult({
                            route_plan: { 
                              title: item.title, 
                              origin: item.places?.[0]?.name || '', 
                              destination: item.places?.[item.places?.length - 1]?.name || '' 
                            },
                            vibe_summary: item.vibe,
                            curated_places: item.places || []
                          });
                          if (item.prompt) setPromptInput(item.prompt);
                          setActiveTab('home');
                          setView('result');
                        }} 
                        onViewResult={(result) => {
                          setCurationResult(result);
                          setView('result');
                          setActiveTab('home');
                        }}
                      />
                    </div>

                    <div className={`pb-28 ${activeTab === 'settings' ? 'block' : 'hidden'}`}>
                      <SettingsView theme={theme} setTheme={setTheme} />
                    </div>
                  </div>
                </main>

                {view !== 'landing' && !isLoading && (
                  <BottomNav 
                    active={activeTab} 
                    onTabChange={setActiveTab} 
                    theme={theme} 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {isLoading && <LoadingScreen />}
            {isSwitchingLang && <LoadingScreen isLangSwitch={true} />}
          </AnimatePresence>
          <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}
