import React from 'react';
import { 
  CloudRain, 
  MapPin, 
  Music, 
  Coffee, 
  Compass, 
  Clock, 
  ChevronLeft, 
  Play, 
  Heart,
  Wind,
  Share2,
  Sparkles,
  Navigation,
  CheckCircle2,
  ListRestart,
  Sun,
  Cloud,
  X,
  Star,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  History,
  Home,
  BarChart2,
  User,
  Settings,
  Moon,
  Bell,
  Globe,
  Music2,
  LogOut,
  ChevronRight
} from "lucide-react";
import { HiddenGem, Song, Activity, ItineraryStep } from '../types';

// --- Dark Map Style ---
export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#020617" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#020617" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6366f1" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#020617" }] }
];

export const HIDDEN_GEMS: HiddenGem[] = [
  {
    id: '1',
    name: "Tepi Mahakam Loa Kulu",
    category: "Riverfront Cafe",
    rating: 4.8,
    description: "Nikmati kopi hangat dengan pemandangan kapal tongkang yang melintas perlahan. Sangat syahdu saat gerimis.",
    image: "https://images.unsplash.com/photo-1544739313-6fad02872377?q=80&w=600&auto=format&fit=crop",
    location: { lat: -0.4935, lng: 117.0658 }
  },
  {
    id: '2',
    name: "Puncak Bukit Biru",
    category: "Scenic Lookout",
    rating: 4.7,
    description: "Spot terbaik melihat kabut tipis yang menyelimuti Tenggarong dari ketinggian.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop",
    location: { lat: -0.4278, lng: 116.9450 }
  }
];

export const weatherCodeMap: Record<number, { label: string; iconType: 'sun' | 'cloud' | 'rain' | 'wind' }> = {
  0: { label: 'Cerah', iconType: 'sun' },
  1: { label: 'Cerah Berawan', iconType: 'sun' },
  2: { label: 'Berawan', iconType: 'cloud' },
  3: { label: 'Mendung', iconType: 'cloud' },
  45: { label: 'Berkabut', iconType: 'cloud' },
  48: { label: 'Berkabut Tebal', iconType: 'cloud' },
  51: { label: 'Gerimis Ringan', iconType: 'rain' },
  53: { label: 'Gerimis', iconType: 'rain' },
  55: { label: 'Gerimis Lebat', iconType: 'rain' },
  61: { label: 'Hujan Ringan', iconType: 'rain' },
  63: { label: 'Hujan', iconType: 'rain' },
  65: { label: 'Hujan Lebat', iconType: 'rain' },
  80: { label: 'Hujan Lokal', iconType: 'rain' },
  81: { label: 'Hujan Lokal', iconType: 'rain' },
  82: { label: 'Hujan Deras', iconType: 'rain' },
  95: { label: 'Badai Petir', iconType: 'rain' },
};

export const PLAYLIST: Song[] = [
  { id: '1', title: "Resah Jadi Luka", artist: "Daun Jatuh", duration: "4:20" },
  { id: '2', title: "Zona Nyaman", artist: "Fourtwnty", duration: "3:55" },
  { id: '3', title: "Untuk Perempuan Yang Sedang Dalam Pelukan", artist: "Payung Teduh", duration: "5:42" },
];

export const ACTIVITIES: Activity[] = [
  { id: '1', title: "Menyusuri Tepian Sungai", icon: <Navigation className="w-5 h-5" />, vibe: "Healing" },
  { id: '2', title: "Museum Mulawarman", icon: <Compass className="w-5 h-5" />, vibe: "Nostalgic" },
  { id: '3', title: "Coffee Hopping", icon: <Coffee className="w-5 h-5" />, vibe: "Cozy" },
];

export const ITINERARY: ItineraryStep[] = [
  { 
    time: "09:00", 
    location: "Big Mall Samarinda", 
    note: "Mulai perjalanan dari titik kumpul. Menuju rute pinggir sungai yang tenang.", 
    type: 'drive', 
    coord: { lat: -0.5215, lng: 117.1135 } 
  },
  { 
    time: "10:15", 
    location: "Tepi Mahakam Loa Kulu", 
    note: "Coffee stop di hidden gem. Menikmati suasana kapal melintas di tengah gerimis.", 
    type: 'stop', 
    coord: { lat: -0.4935, lng: 117.0658 } 
  },
  { 
    time: "11:45", 
    location: "Puncak Bukit Biru", 
    note: "Melihat kabut tipis menyelimuti lembah Tenggarong dari ketinggian.", 
    type: 'activity', 
    coord: { lat: -0.4278, lng: 116.9450 } 
  },
  { 
    time: "12:30", 
    location: "Taman Kota Raja", 
    note: "Tiba di tujuan akhir. Menikmati landmark ikonik Tenggarong di bawah langit mendung.", 
    type: 'activity', 
    coord: { lat: -0.4284, lng: 116.9830 } 
  },
];

export const TRANSLATIONS = {
  en: {
    landing: {
      findYour: "Find your",
      nextJourney: "Next Journey",
      byFeeling: "By Feeling.",
      description: "Leave the common routes. Let our AI synthesize a journey based on today's weather and your mood.",
      initializing: "Initializing Vibe Synthesis..."
    },
    login: {
      connecting: "Connecting...",
      continueWithGoogle: "Continue with Google",
      continueAsGuest: "Continue as Guest",
      agreement: "By continuing, you agree to discover life beyond the highway.",
      guestMode: "Native Google Login failed. Continuing in Guest Mode.",
      signInFailed: "Failed to sign in. Please try again."
    },
    prompt: {
      back: "Back",
      greeting: "Where are we heading today?",
      request: "Synthesis Request",
      intent: "The Intent.",
      receptor: "Vibe Receptor Active",
      synthesize: "Synthesize Route",
      placeholder: "Recommend a scenic and relaxing route to a cozy spot nearby, matching the weather and vibe today."
    },
    result: {
      newVibe: "New Vibe",
      liveSynthesis: "Live Synthesis",
      readyMessage: "I've synthesized the perfect route for your current vibe. Enjoy the discovery.",
      peakTime: "Peak Time",
      nav: "Start Navigation",
      orchestration: "AI Orchestration",
      curationResult: "Curation Result",
      highlights: "Itinerary Highlights",
      newRoute: "New Route",
      atmosphere: "Atmosphere",
      peak: "Peak",
      current: "Current",
      loadingText: "Loading...",
      stopsSuffix: "stops",
      readMore: "Read more",
      viewOnMaps: "View on Maps",
      modifyPlaceholder: "Modify route...",
      modifying: "Refining route based on feedback...",
      locationDeny: "Location permission is required to curate accurate routes."
    },
    analytics: {
      title: "Your Insights.",
      subtitle: "Measuring your journey vibes",
      weekly: "Weekly Vibe Flow",
      mostExplored: "Most explored vibes",
      gemsFound: "Gems Found",
      listening: "Listening",
      consistency: "Trip Consistency",
      consistencyDesc: "You've traveled 85% more syahdu routes than usual."
    },
    profile: {
      trips: "Trips",
      km: "KM",
      gems: "Gems",
      recent: "Recent Itineraries",
      saved: "Saved Vibes",
      back: "Back",
      signOut: "Sign Out",
      history: "History",
      noSaved: "No saved vibes yet",
      noSavedDesc: "Tap ❤️ on route results to save",
      noHistory: "No prompt history yet",
      savedVibeTitle: "Saved Vibe",
      curatedExperience: "Curated Experience",
      stops: "Stops",
      category: "Category",
      places: "Places"
    },
    settings: {
      title: "Preferences.",
      theme: "Theme Mode",
      currently: "Currently",
      weather: "Weather Alerts",
      weatherDesc: "Notify me about peak vibes",
      language: "Language",
      spotify: "Connect Spotify",
      sync: "Sync Playlists"
    },
    nav: {
      home: "Home",
      analytics: "Analytics",
      profile: "Profile",
      settings: "Settings"
    },
    map: {
      liveNav: "Live Navigation",
      simulation: "Simulation Mode",
      apiError: "Interactive maps require a Google Maps API Key. You can still view the route in the official app.",
      routeInfo: "Route Info",
      destination: "Destination",
      viewOnMaps: "View on Google Maps",
      start: "START",
      finish: "FINISH"
    },
    share: {
      summary: "Trip Summary",
      departure: "Departure",
      weather: "Weather",
      generating: "Generating Image...",
      saveImage: "Save as Image",
      copyLink: "Copy Share Link",
      webShareTitle: "VibeTrip Route",
      webShareText: "Check out this VibeTrip route!",
      dialogTitle: "Save or Share Route"
    },
    langSwitch: [
      "Updating regional context...",
      "Calibrating linguistic vibes...",
      "Applying localization..."
    ],
    aiStatus: [
      "Accessing current location...",
      "Detecting local weather...",
      "Analyzing venue review vibes...",
      "Curating soulful routes..."
    ],
    loading: [
      "Analyzing the atmosphere...",
      "Curating the perfect route...",
      "Harmonizing weather patterns...",
      "Selecting hidden gems...",
      "Almost there..."
    ]
  },
  id: {
    landing: {
      findYour: "Temuin",
      nextJourney: "Petualangan Seru",
      byFeeling: " Lewat Mood.",
      description: "Lupain rute mainstream. Biarin AI kita racikin perjalanan asik sesuai cuaca hari ini dan mood lo.",
      initializing: "Mulai Ngulik Vibe..."
    },
    login: {
      connecting: "Menghubungkan...",
      continueWithGoogle: "Masuk dengan Google",
      continueAsGuest: "Masuk sebagai Tamu",
      agreement: "Dengan melanjutkan, kamu setuju untuk menjelajahi petualangan di luar rute utama.",
      guestMode: "Login Google gagal. Masuk sebagai Tamu...",
      signInFailed: "Gagal masuk. Silakan coba lagi."
    },
    prompt: {
      back: "Balik",
      greeting: "Mau meluncur ke mana kita hari ini?",
      request: "Request Rute",
      intent: "Lagi Pengen Apa?",
      receptor: "Vibe Sensor Aktif",
      synthesize: "Rancang Rute Sekarang",
      placeholder: "Rekomendasiin rute perjalanan santai yang estetik ke tempat asik terdekat, pasin sama cuaca dan vibe hari ini ya."
    },
    result: {
      newVibe: "Vibe Baru",
      liveSynthesis: "Lagi Dirangkum",
      readyMessage: "Gue udah racikin rute paling pas buat vibe lo sekarang. Enjoy the trip!",
      peakTime: "Waktu Terbaik",
      nav: "Mulai Gas",
      orchestration: "AI Lagi Kerja",
      curationResult: "Hasil Kurasi",
      highlights: "Highlight Perjalanan",
      newRoute: "Rute Baru",
      atmosphere: "Atmosfer",
      peak: "Puncak",
      current: "Saat Ini",
      loadingText: "Memuat...",
      stopsSuffix: "titik",
      readMore: "Selengkapnya",
      viewOnMaps: "Lihat di Maps",
      modifyPlaceholder: "Modifikasi rute...",
      modifying: "Menyesuaikan rute sesuai masukan lo...",
      locationDeny: "Izin lokasi diperlukan untuk meracik rute yang akurat."
    },
    analytics: {
      title: "Insight Lo.",
      subtitle: "Ngelacak vibe perjalanan lo",
      weekly: "Vibe Flow Seminggu",
      mostExplored: "Vibe paling sering dicari",
      gemsFound: "Gems Ketemu",
      listening: "Dengerin",
      consistency: "Konsistensi Jalan",
      consistencyDesc: "Lo jalan 85% lebih sering ke rute syahdu dibanding biasanya."
    },
    profile: {
      trips: "Trip",
      km: "KM",
      gems: "Gems",
      recent: "Jalan-Jalan Terakhir",
      saved: "Vibe Disimpen",
      back: "Balik",
      signOut: "Log Out",
      history: "Riwayat",
      noSaved: "Belum ada Vibe yang disimpan",
      noSavedDesc: "Tap ❤️ di hasil rute untuk menyimpan",
      noHistory: "Belum ada riwayat prompt",
      savedVibeTitle: "Vibe Disimpan",
      curatedExperience: "Pengalaman Terkurasi",
      stops: "Pemberhentian",
      category: "Kategori",
      places: "Tempat"
    },
    settings: {
      title: "Pengaturan.",
      theme: "Mode Tema",
      currently: "Sekarang",
      weather: "Notif Cuaca",
      weatherDesc: "Kasih tau kalo ada vibe asik",
      language: "Bahasa",
      spotify: "Konek Spotify",
      sync: "Sync Playlist"
    },
    nav: {
      home: "Home",
      analytics: "Statistik",
      profile: "Profil",
      settings: "Setting"
    },
    map: {
      liveNav: "Navigasi Langsung",
      simulation: "Mode Simulasi",
      apiError: "Peta interaktif memerlukan Google Maps API Key. Anda masih bisa melihat rute langsung di aplikasi resmi.",
      routeInfo: "Info Rute",
      destination: "Tujuan",
      viewOnMaps: "Buka di Google Maps",
      start: "MULAI",
      finish: "SELESAI"
    },
    share: {
      summary: "Ringkasan Trip",
      departure: "Keberangkatan",
      weather: "Cuaca",
      generating: "Membuat Gambar...",
      saveImage: "Simpan Gambar",
      copyLink: "Salin Link",
      webShareTitle: "Rute VibeTrip",
      webShareText: "Lihat rute VibeTrip ini!",
      dialogTitle: "Simpan atau Bagikan Rute"
    },
    langSwitch: [
      "Menyesuaikan konteks regional...",
      "Mengkalibrasi bahasa...",
      "Menerapkan lokalisasi..."
    ],
    aiStatus: [
      "Ngecek lokasi sekarang...",
      "Ngeliat cuaca lokal...",
      "Nyari vibe tempat yang pas...",
      "Ngeracik rute syahdu..."
    ],
    loading: [
      "Menganalisis suasana...",
      "Milihin rute paling pas...",
      "Nyesuain sama cuaca...",
      "Nyari hidden gems...",
      "Bentar lagi beres..."
    ]
  }
};
