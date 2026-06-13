<div align="center">
  <img width="1200" height="475" alt="VibeTrip Banner" src="https://i.ibb.co.com/gb7Yfr1N/Screenshot-2026-06-14-005837.png" />

  #  VibeTrip

  **AI-Powered Trip Curation Based on Your Vibe**

  Tell the AI how you're feeling, and it curates a personalized trip route  -  complete with real places, live weather, air quality, and vibe-matched destinations.

  Built with React · Gemini AI · Google Maps · Firebase · Capacitor

  [Features](#-features) · [Getting Started](#-getting-started) · [Android Build](#-android-build) · [Contributing](#contributing)
</div>

---

##  Features

-  **AI Route Curation**  -  Describe your mood or vibe, and Gemini AI generates a curated multi-stop route with real places
-  **Interactive Google Maps**  -  Full map view with polyline routes, place markers, and navigation links
-  **Real-Time Weather**  -  Current conditions, hourly forecasts, air quality index, and pollen data for your route
-  **Route Refinement**  -  Chat with the AI to modify your route on the fly
-  **Saved Vibes**  -  Bookmark your favorite routes and revisit them later
-  **Prompt History**  -  Every curation is saved so you can look back at past trips
-  **Analytics Dashboard**  -  Track your travel stats, vibe categories, and trip patterns
-  **Share as Image**  -  Export beautiful trip summaries as 9:16 portrait cards
-  **Dark & Light Themes**  -  Full theme support persisted across sessions
-  **Bilingual (EN/ID)**  -  Complete English and Indonesian translations
-  **Google Sign-In**  -  Firebase authentication on both web and Android
-  **Native Android App**  -  Full APK build via Capacitor

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6, TailwindCSS 4 |
| Animation | Framer Motion |
| Backend | Express.js (dev server with API proxy) |
| AI | Google Gemini AI |
| Maps | Google Maps Platform (Maps, Places, Routes, Weather, Air Quality, Pollen) |
| Auth & DB | Firebase Auth + Cloud Firestore |
| Mobile | Capacitor 8 → Android |
| Icons | Lucide React |

---
 📸 Screenshots
Here is a look at the interface of VibeTrip:
<div align="center">
  <table style="border: none;">
    <tr>
      <td width="33%" align="center">
        <strong>Login Screen</strong><br/>
        <img src="https://github.com/user-attachments/assets/0161ebe0-1ce9-4d97-9df7-6b2f4ffcfc87" alt="Login Screen" width="240" style="border-radius: 12px; margin-top: 8px;"/>
      </td>
      <td width="33%" align="center">
        <strong>Vibe Curation</strong><br/>
        <img src="https://github.com/user-attachments/assets/214d9f0b-b897-432f-97bd-a22938500afa" alt="Vibe Curation" width="240" style="border-radius: 12px; margin-top: 8px;"/>
      </td>
      <td width="33%" align="center">
        <strong>Map & Directions</strong><br/>
        <img src="https://github.com/user-attachments/assets/e5e934b8-9cc1-493d-bbf5-af68ec8ffa1b" alt="Map View" width="240" style="border-radius: 12px; margin-top: 8px;"/>
      </td>
    </tr>
    <tr>
      <td width="33%" align="center">
        <strong>Analytics</strong><br/>
        <img src="https://github.com/user-attachments/assets/53f749a7-716f-4874-a571-6dc857940c2c" alt="Analytics View" width="240" style="border-radius: 12px; margin-top: 8px;"/>
      </td>
      <td width="33%" align="center">
        <strong>Saved Vibes</strong><br/>
        <img src="https://github.com/user-attachments/assets/ced4245f-8876-4cab-a756-7448358edb69" alt="Saved Vibes" width="240" style="border-radius: 12px; margin-top: 8px;"/>
      </td>
      <td width="33%" align="center">
        <strong>9:16 Export Card</strong><br/>
        <img src="https://github.com/user-attachments/assets/727e769c-66ad-44b6-86c4-9b893b0ba1f5" alt="Share Card" width="240" style="border-radius: 12px; margin-top: 8px;"/>
      </td>
    </tr>
  </table>
</div>
---
##  Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Google Cloud](https://console.cloud.google.com/) project with billing enabled
- A [Firebase](https://console.firebase.google.com/) project

### 1. Clone & Install

```bash
git clone https://github.com/Farerudesu/vibetrip.git
cd vibetrip
npm install
```

### 2. Get Your API Keys

#### Gemini AI Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key

#### Google Maps Platform Key
1. Go to [Google Cloud Console → APIs & Services](https://console.cloud.google.com/apis/credentials)
2. Create an API key and enable these APIs:
   - Maps JavaScript API
   - Places API (New)
   - Routes API
   - Weather API
   - Air Quality API
   - Pollen API

#### Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. **Authentication** → Enable **Google** sign-in provider
4. **Firestore Database** → Create a database
5. **Project Settings → General → Your Apps** → Add a **Web app** → Copy the config values
6. **Project Settings → General → Your Apps** → Note the **Web client ID** from the Google sign-in provider

### 3. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in all your keys. See the comments in `.env.example` for guidance on where to find each value.

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Android Build

### Additional Prerequisites

- [Android Studio](https://developer.android.com/studio) with SDK installed
- JDK 17+

### 1. Firebase Android Setup

1. In Firebase Console → **Project Settings → General → Your Apps** → Add an **Android app**
2. Package name: `com.vibetrip.app`
3. Download `google-services.json` and place it in `android/app/`

### 2. Configure Native Server Host

In your `.env`, set `VITE_SERVER_HOST` to your computer's local network IP:

```bash
# Find your IP:
# Windows: ipconfig → look for IPv4 Address
# Mac/Linux: ifconfig or ip addr

VITE_SERVER_HOST="192.168.1.100"  # Replace with your actual IP
```

> **Why?** The Android app runs on your phone/emulator and needs to reach the dev server on your computer over the local network.

### 3. Build & Run

```bash
npm run build                  # Build the web assets
npx cap sync android           # Sync to Android project
cd android
./gradlew assembleDebug        # Build debug APK
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

##  Project Structure

```
vibetrip/
├── src/
│   ├── App.tsx                 # Main app  -  orchestrates all views & state
│   ├── firebase.ts             # Firebase init, auth helpers
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles & glassmorphism
│   ├── components/
│   │   ├── LoginScreen.tsx     # Google auth with animations
│   │   ├── LoadingScreen.tsx   # AI synthesis loading states
│   │   ├── MapOverlay.tsx      # Interactive Google Maps view
│   │   ├── ProfileView.tsx     # User profile, saved vibes, history
│   │   ├── SettingsView.tsx    # Theme, language, notifications
│   │   ├── AnalyticsView.tsx   # Trip stats & charts
│   │   ├── ShareModal.tsx      # Export trip as image
│   │   ├── BottomNav.tsx       # Tab navigation
│   │   ├── AIStatus.tsx        # AI step indicators
│   │   ├── GlassCard.tsx       # Reusable glass card
│   │   ├── Toast.tsx           # Notification toasts
│   │   ├── VibeChart.tsx       # Recharts visualization
│   │   └── WeatherIcon.tsx     # Weather icon mapper
│   ├── contexts/
│   │   ├── ThemeContext.tsx     # Dark/light theme provider
│   │   └── LanguageContext.tsx  # EN/ID language provider
│   ├── data/
│   │   └── constants.tsx       # Translations, icons, hidden gems
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── server.ts                   # Express backend  -  Gemini + Maps proxy
├── android/                    # Capacitor Android project
├── capacitor.config.ts         # Capacitor configuration
├── vite.config.ts              # Vite build configuration
├── .env.example                # Environment template (safe to commit)
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License  -  see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ and AI vibes</sub>
</div>
