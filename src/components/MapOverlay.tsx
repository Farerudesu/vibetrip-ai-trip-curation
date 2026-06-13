import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'MY_GOOGLE_MAPS_KEY';

function RouteDisplay({ origin, destination, intermediates }: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  intermediates: any[];
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin: {
        location: {
          lat: origin.lat,
          lng: origin.lng
        }
      },
      destination: {
        location: {
          lat: destination.lat,
          lng: destination.lng
        }
      },
      intermediates: intermediates.map(gem => ({
        location: {
          lat: gem.location.lat,
          lng: gem.location.lng
        }
      })),
      travelMode: 'DRIVING',
      routingPreference: 'TRAFFIC_AWARE',
      polylineQuality: 'HIGH_QUALITY',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#818cf8',
            strokeOpacity: 0.9,
            strokeWeight: 5,
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) {
           const bounds = new google.maps.LatLngBounds();
           bounds.extend(origin);
           bounds.extend(destination);
           intermediates.forEach(gem => bounds.extend(gem.location));
           map.fitBounds(bounds, { top: 80, right: 40, bottom: 80, left: 40 });
        }
      }
    }).catch((err: any) => console.error("Router error:", err));

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination, intermediates]);

  return null;
}

export const MapOverlay = ({ isOpen, onClose, googleMapsUrl, activePlaces, origin, destination }: { isOpen: boolean, onClose: () => void, googleMapsUrl: string, activePlaces: any[], origin: any, destination: any }) => {
  const { t } = React.useContext(LanguageContext);
  const { theme } = React.useContext(ThemeContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className={`fixed inset-0 z-50 overflow-hidden flex flex-col transition-colors duration-500 ${
            theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#020617] text-white'
          }`}
        >
          {/* Map Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between pointer-events-none">
            <button 
              onClick={onClose}
              className={`w-12 h-12 backdrop-blur-md border rounded-2xl flex items-center justify-center pointer-events-auto shadow-2xl transition-colors ${
                theme === 'light' 
                  ? 'bg-white/80 border-slate-200 text-slate-800' 
                  : 'bg-white/10 border-white/10 text-white'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
            <div className={`border px-5 py-2.5 rounded-2xl backdrop-blur-md pointer-events-auto flex items-center gap-2 shadow-xl ${
              theme === 'light'
                ? 'bg-indigo-50 border-indigo-200/80 text-indigo-600'
                : 'bg-indigo-500/40 border-indigo-500/50 text-white'
            }`}>
              <Sparkles className={`w-4 h-4 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-200'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] leading-none ${theme === 'light' ? 'text-indigo-600' : 'text-white'}`}>
                {t.map.liveNav}
              </span>
            </div>
            <div className="w-12" />
          </div>

          <div className="flex-1 relative">
            {!hasValidKey ? (
              <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center transition-colors ${
                theme === 'light' ? 'bg-slate-100' : 'bg-slate-950'
              }`}>
                <MapPin className="w-16 h-16 text-indigo-500 mb-6 opacity-20" />
                <h2 className="text-2xl font-display font-bold mb-2">{t.map.simulation}</h2>
                <p className={`text-sm mb-8 max-w-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-white/50'}`}>
                  {t.map.apiError}
                </p>
                
                <div className={`w-full max-w-xs rounded-3xl p-6 border mb-8 ${
                  theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">{t.map.routeInfo}</span>
                  </div>
                  <div className="space-y-3 text-left">
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>
                      <span className="opacity-40">{t.map.start}:</span> {t.result.current || "Your Location"}
                    </p>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>
                      <span className="opacity-40">{t.map.destination}:</span> {destination?.name || 'Destination'}
                    </p>
                  </div>
                </div>

                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`px-10 py-4 rounded-[20px] flex items-center gap-3 font-bold text-sm shadow-2xl hover:scale-105 transition-transform ${
                    theme === 'light'
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                      : 'bg-white text-black'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.map.viewOnMaps}
                </a>
              </div>
            ) : (
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={origin}
                  defaultZoom={11}
                  mapId="7284699569ed9129"
                  className="w-full h-full"
                  disableDefaultUI
                  gestureHandling={'greedy'}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  <RouteDisplay 
                    origin={origin} 
                    destination={destination}
                    intermediates={activePlaces}
                  />
                  
                  {activePlaces.map(gem => (
                    <AdvancedMarker 
                      key={gem.id || gem.name} 
                      position={gem.location}
                      title={gem.name}
                    >
                      <div className="relative group p-4">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500/40 blur-lg rounded-full" />
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="relative bg-slate-900 border border-indigo-400/30 backdrop-blur-xl p-2 rounded-2xl flex items-center gap-2 shadow-2xl"
                        >
                          <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                            {gem.image && <img src={gem.image} className="w-full h-full object-cover" alt={gem.name} />}
                          </div>
                          <div className="flex flex-col pr-1">
                             <span className="text-[10px] font-bold text-white leading-none mb-1">{gem.name}</span>
                             <span className="text-[8px] text-indigo-300 font-bold tracking-widest uppercase">Gems {gem.id || ''}</span>
                          </div>
                        </motion.div>
                      </div>
                    </AdvancedMarker>
                  ))}

                  {/* Start Point Marker */}
                  <AdvancedMarker position={origin}>
                    <div className="flex flex-col items-center">
                       <div className="px-3 py-1 bg-white text-black text-[9px] font-bold rounded-full mb-1 shadow-xl">START</div>
                       <Pin background="#fff" glyphColor="#000" scale={0.7} />
                    </div>
                  </AdvancedMarker>

                  {/* End Point Marker */}
                  <AdvancedMarker position={destination}>
                    <div className="flex flex-col items-center">
                       <div className="px-3 py-1 bg-indigo-500 text-white text-[9px] font-bold rounded-full mb-1 shadow-xl">FINISH</div>
                       <Pin background="#6366f1" glyphColor="#fff" scale={0.7} />
                    </div>
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            )}
          </div>

          <div className={`p-8 pb-12 border-t rounded-t-[48px] z-10 transition-colors duration-500 ${
            theme === 'light' 
              ? 'bg-white border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]' 
              : 'bg-[#020617] border-white/5 shadow-[0_-30px_60px_rgba(0,0,0,0.8)]'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block ${
                  theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  {t.result.curationResult || "Curation Result"}
                </span>
                <h4 className={`text-2xl font-display font-medium italic ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {t.share.summary || "The Trip"}
                </h4>
                <p className={`text-sm font-medium ${
                  theme === 'light' ? 'text-slate-400' : 'text-white/30'
                }`}>
                  {theme === 'light' ? 'Navigating your curated route' : 'Navigating your curated route'}
                </p>
              </div>
            </div>
            
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full font-bold py-5 rounded-[24px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all ${
                theme === 'light'
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'
                  : 'bg-white text-slate-950 hover:bg-white/90 shadow-[0_20px_40px_rgba(255,255,255,0.05)]'
              }`}
            >
              <Navigation className={`w-5 h-5 ${theme === 'light' ? 'fill-white text-white' : 'fill-slate-950 text-slate-950'}`} />
              {t.result.nav || "Navigate with Google Maps"}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
