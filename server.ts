import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

import cors from 'cors';

// 1. Cek Konfigurasi ENV: Pastikan package dotenv dipanggil di baris paling atas
dotenv.config();

const app = express();
const PORT = parseInt(process.env.SERVER_PORT || '3000', 10);

app.use(cors());
app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
});

// Proxy endpoint for Google Maps Photos to avoid exposing API key
app.get("/api/photo", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') return res.status(400).send("Name required");
    
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";
    const url = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_API_KEY}`;
    
    const photoRes = await fetch(url);
    if (!photoRes.ok) return res.status(404).send("Not found");
    
    const contentType = photoRes.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    
    const arrayBuffer = await photoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (e) {
    console.error("Photo proxy error:", e);
    res.status(500).send("Error fetching photo");
  }
});

// Endpoint /api/vibe-route
app.post("/api/vibe-route", async (req, res) => {
  try {
    const { prompt, location, history, lang } = req.body;
    const outputLanguage = lang === 'en' ? 'English' : 'Bahasa Indonesia';
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log(`\n[API /vibe-route] Menerima prompt: "${prompt}"`);

    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_MAPS_PLATFORM_KEY is missing in .env");
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: "THE DECISION BRAIN" — Gemini translates vibe → search keywords
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[PIPELINE] Starting VibeTrip Curation Pipeline`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`[STEP 1] Decision Brain: Translating user vibe to search keywords...`);
    console.log(`[STEP 1] User prompt: "${prompt}"`);
    console.log(`[STEP 1] User location: lat=${location?.lat}, lng=${location?.lng}`);

    let searchQuery = prompt;
    try {
      const extractResult = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: `You are a search query translator for Google Places API.

Your job: Convert the user's emotional/conversational travel request into 2-4 SHORT search keywords that Google Places can understand.

RULES:
- Output ONLY the search keywords, nothing else
- Keywords should describe TYPES of places (cafe, restaurant, park, museum, etc.)
- Include the CITY NAME if mentioned
- If the user wants unique, hidden, or non-mainstream places, append "hidden gem" or "unik" to the keywords.
- Do NOT include emotional words like "healing", "sedih", "galau"
- Keep it under 6 words

EXAMPLES:
- "Aku pengen healing yang sepi dan hujan-hujanan" → "cafe indoor cozy Samarinda"
- "Cari tempat nongkrong malam yang santai di Samarinda" → "tempat nongkrong malam Samarinda"
- "Pengen jalan-jalan sore ke wisata alam Tenggarong" → "wisata alam Tenggarong"
- "I want a quiet riverside coffee spot" → "riverside cafe Samarinda"

${history ? `PREVIOUS ROUTE CONTEXT: The user previously received a route titled "${history.route_plan?.title}". Their new instruction is a follow-up.` : ''}
User request: "${prompt}"` }] }],
      });
      const extracted = extractResult.text?.trim().replace(/"/g, '');
      if (extracted && extracted.length > 3 && extracted.length < 80) {
        searchQuery = extracted;
        console.log(`[STEP 1] ✅ Decision Brain extracted: "${searchQuery}"`);
      } else {
        console.warn(`[STEP 1] ⚠️ Extraction result invalid (length=${extracted?.length}): "${extracted}"`);
        searchQuery = prompt.substring(0, 50);
        console.log(`[STEP 1] ⚠️ Falling back to truncated: "${searchQuery}"`);
      }
    } catch (e: any) {
      console.error(`[STEP 1] ❌ Decision Brain failed: ${e.message}`);
      if (e.status === 429 || e.message?.includes('Quota') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        throw e; // Lemparkan ke atas biar UI nangkep error limit-nya
      }
      searchQuery = prompt.substring(0, 50);
      console.log(`[STEP 1] ⚠️ Falling back to truncated: "${searchQuery}"`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Fetch real-world context data (Weather + Places)
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n[STEP 2] Fetching real-world context...`);
    console.log(`[STEP 2] → Weather API (Google Weather)`);
    console.log(`[STEP 2] → Places API (Google) with query: "${searchQuery}"`);
    
    // Fetch context data in parallel using REAL API
    const [weather, airQuality, pollen, hiddenGems] = await Promise.all([
      fetchWeather(location, GOOGLE_API_KEY),
      fetchAirQuality(location, GOOGLE_API_KEY),
      fetchPollen(location, GOOGLE_API_KEY),
      findHiddenGems(searchQuery, location, GOOGLE_API_KEY)
    ]);

    // Log weather results
    if (weather?.current_weather) {
      console.log(`[STEP 2] ✅ Weather: ${weather.current_weather.temperature}°C, code=${weather.current_weather.weathercode}, wind=${weather.current_weather.windspeed}km/h`);
    } else {
      console.warn(`[STEP 2] ⚠️ Weather data unavailable`);
    }

    const contextContext = {
      timestamp: new Date().toISOString(),
      userLocation: location,
      environmentalData: { weather, airQuality, pollen },
      relevantPlaces: hiddenGems
    };

    let forecastContext = '';
    if (weather?.hourly_forecast) {
      const nowHour = new Date(new Date().toLocaleString('en-US', { timeZone: weather?.timezone || 'Asia/Makassar' })).getHours();
      const hourlyData = weather.hourly_forecast || [];
      for (let i = 0; i < hourlyData.length && i < 12; i++) {
        const hData = hourlyData[i];
        forecastContext += `Jam ${hData.time} -> Suhu ${hData.temp}°C, Kode Cuaca ${hData.weathercode}\n    `;
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Build clean place data for the Curator AI
    // ═══════════════════════════════════════════════════════════════
    const realPlaces = (contextContext.relevantPlaces?.places || []).map((p: any, i: number) => ({
      id: String(i + 1),
      name: p.displayName?.text || 'Unknown',
      address: p.formattedAddress || '',
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      rating: p.rating ?? null,
      types: p.types || [],
      reviews: (p.reviews || []).slice(0, 2).map((r: any) => r.text?.text).filter(Boolean)
    }));

    // Inject history places so the AI doesn't lose context of the previous route
    if (history?.curated_places) {
      history.curated_places.forEach((hp: any) => {
        if (!realPlaces.find((p: any) => p.name === hp.name)) {
          realPlaces.push({
            id: hp.id || `HISTORY_${Math.random().toString(36).substring(7)}`,
            name: hp.name,
            address: hp.description || "Previous curated place",
            lat: hp.location?.lat || 0,
            lng: hp.location?.lng || 0,
            rating: hp.rating || 5.0,
            types: ["history_place"],
            reviews: []
          });
        }
      });
    }

    // Inject User's Starting Location so the AI can use it for round trips
    if (location?.lat && location?.lng) {
      realPlaces.unshift({
        id: "START_POINT",
        name: location.name || "Titik Awal (Lokasi Anda Saat Ini)",
        address: "Lokasi asal Anda sekarang",
        lat: location.lat,
        lng: location.lng,
        rating: 5.0,
        types: ["starting_point"],
        reviews: ["Titik kumpul keberangkatan awal"]
      });
    }

    console.log(`\n[STEP 3] Places pipeline result:`);
    console.log(`[STEP 3] Total places found: ${realPlaces.length}`);
    if (realPlaces.length > 0) {
      realPlaces.forEach((p, i) => {
        console.log(`[STEP 3]   ${i+1}. "${p.name}" (${p.lat}, ${p.lng}) ★${p.rating || 'N/A'}`);
      });
    } else {
      console.error(`[STEP 3] ❌ NO PLACES FOUND — AI will have nothing to curate!`);
      console.error(`[STEP 3]    Check: Is Google Places API (New) enabled for your API key?`);
      console.error(`[STEP 3]    Check: Was the search query "${searchQuery}" too specific?`);
    }

    const systemInstruction = `You are "VibeTrip", a travel route AI assistant.

STRICT RULES:
1. Respond with ONLY a valid JSON object. No text before or after.
2. You MUST pick 2-4 places from the AVAILABLE_PLACES array below. Do NOT invent places.
3. For each picked place, copy the name, lat, and lng EXACTLY as given.
4. **ROUND TRIP EXPLICIT RULE**: If the user asks for a "round trip" (pergi lalu kembali ke asal) or "back to the same point", you MUST pick "Titik Awal (Lokasi Anda Saat Ini)" as the FIRST and LAST destination in your \`curated_places\` array.
5. **HIDDEN GEMS PRIORITY**: Choose the most interesting, highly-rated, or unique places from the list. Avoid boring/generic places if better ones exist.
6. **LANGUAGE RULE**: You MUST write the "vibe_summary", the route "title", and the places "description" values in ${outputLanguage}. Do NOT write in any other language.

AVAILABLE_PLACES:
${JSON.stringify(realPlaces, null, 2)}

USER CONTEXT:
- Current temperature: ${weather?.current_weather?.temperature ?? '?'}°C
- Wind: ${weather?.current_weather?.windspeed ?? '?'} km/h
- Weather code: ${weather?.current_weather?.weathercode ?? '?'}
- Local time: ${new Date().toLocaleString('id-ID', { timeZone: weather?.timezone || 'Asia/Makassar' })}
- User GPS: ${contextContext.userLocation?.lat}, ${contextContext.userLocation?.lng}
${history ? `
CRITICAL REFINEMENT INSTRUCTION:
The user is asking to REFINE their existing route, NOT create a brand new one!
PREVIOUS ROUTE: ${JSON.stringify(history.curated_places?.map((p: any) => p.name))}
USER'S REFINEMENT REQUEST: "${prompt}"

RULES FOR REFINING:
1. You MUST keep the majority of the places from the PREVIOUS ROUTE. 
2. Only swap, add, or remove 1-2 places to satisfy the user's request. 
3. Do NOT build a completely new route from scratch.
4. If the previous route started and ended at "Titik Awal" (round trip), your refined route MUST also start and end at "Titik Awal".` : ''}

OUTPUT FORMAT (valid JSON only):
{
  "vibe_summary": "A friendly greeting mentioning the actual temperature (${weather?.current_weather?.temperature ?? '?'}°C) and trip vibe. Write in ${outputLanguage}.",
  "route_plan": {
    "title": "Creative 2-3 word route name",
    "origin": "Name of first place from AVAILABLE_PLACES",
    "destination": "Name of last place from AVAILABLE_PLACES",
    "travel_info": "Estimated travel time and distance",
    "navigation_url": "",
    "peak_time": "Best time based on weather (e.g. 16:00)"
  },
  "curated_places": [
    {
      "id": "1",
      "name": "EXACT name from AVAILABLE_PLACES",
      "category": "Place category",
      "description": "Short reason why this place fits the user's vibe. Write in ${outputLanguage}.",
      "image": "",
      "location": { "lat": -0.1234, "lng": 117.1234 },
      "vibe_check": "Calm/Busy/Moderate",
      "rating": 4.5
    }
  ]
}`;

    const contents = [
      { role: "user", parts: [{ text: prompt }] }
    ];

    let result;
    try {
      result = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });
    } catch (tryError: any) {
      if (tryError.status === 429) {
        console.log("Quota exceeded for gemini-3-flash-preview, trying gemini-flash-latest...");
        result = await ai.models.generateContent({
          model: "gemini-flash-latest", 
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          }
        });
      } else {
        throw tryError;
      }
    }

    const responseText = result.text;
    
    // Robust JSON parsing
    let parsedResponse;
    const start = responseText.indexOf('{');
    let end = responseText.lastIndexOf('}');
    let lastError;

    while (end > start) {
      const candidate = responseText.substring(start, end + 1);
      try {
        parsedResponse = JSON.parse(candidate);
        break;
      } catch (e) {
        lastError = e;
        end = responseText.lastIndexOf('}', end - 1);
      }
    }

    if (!parsedResponse) {
      console.error("\n[API /vibe-route] Failed to parse JSON. Raw response:", responseText);
      throw new Error("AI did not return valid JSON format");
    }

    const places = contextContext.relevantPlaces?.places || [];

    // Resolve Locations robustly
    const resolveLocation = async (name: string) => {
      if (!name) return name;
      if (/^-?\d+\.\d+,-?\d+\.\d+$/.test(name)) return name;

      const match = places.find((rp: any) => 
        rp.displayName?.text?.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(rp.displayName?.text?.toLowerCase())
      );
      if (match) return `${match.location.latitude},${match.location.longitude}`;

      // Geocoding fallback
      try {
        const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
        const searchRes = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask': 'places.location'
          },
          body: JSON.stringify({
            textQuery: name,
            locationBias: {
              circle: {
                center: { latitude: contextContext.userLocation.lat, longitude: contextContext.userLocation.lng },
                radius: 500000.0
              }
            },
            maxResultCount: 1
          })
        });
        const searchData = await searchRes.json();
        if (searchData.places?.[0]) {
          const loc = searchData.places[0].location;
          return `${loc.latitude},${loc.longitude}`;
        }
      } catch (err) {
        console.error("Geocoding fallback failed for:", name, err);
      }
      return name;
    };

    if (parsedResponse.route_plan && parsedResponse.route_plan.navigation_url) {
      // Enrichment map url if needed, assuming the AI already sets origin/dest
    }

    // Enrich curated_places locations
    if (parsedResponse.curated_places) {
      parsedResponse.curated_places = await Promise.all(parsedResponse.curated_places.map(async (p: any) => {
        const match = places.find((rp: any) => 
          rp.displayName?.text?.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(rp.displayName?.text?.toLowerCase())
        );
        
        let imageUrl = p.image || `https://loremflickr.com/600/400/${encodeURIComponent(p.category || 'landscape')}`;
        
        if (match) {
          if (match.photos && match.photos.length > 0) {
            imageUrl = `/api/photo?name=${encodeURIComponent(match.photos[0].name)}`;
          }
          return { 
            ...p, 
            location: { lat: match.location.latitude, lng: match.location.longitude },
            image: imageUrl 
          };
        }
        
        // Ensure even unmatched places get a placeholder
        return { ...p, image: imageUrl };
      }));
    }

    // Attach weather + timezone data for frontend
    const userTimezone = weather?.timezone || 'Asia/Makassar';
    parsedResponse.current_weather = weather?.current_weather;
    parsedResponse.timezone = userTimezone;
    parsedResponse.local_time = new Date().toLocaleString('id-ID', { timeZone: userTimezone });

    if (weather?.hourly_forecast) {
      parsedResponse.hourly_forecast = weather.hourly_forecast;
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Pipeline Complete — Final output logging
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n[STEP 4] Curator AI response:`);
    console.log(`[STEP 4] Title: "${parsedResponse.route_plan?.title || 'N/A'}"`);
    console.log(`[STEP 4] Origin: "${parsedResponse.route_plan?.origin || 'N/A'}"`);
    console.log(`[STEP 4] Destination: "${parsedResponse.route_plan?.destination || 'N/A'}"`);
    console.log(`[STEP 4] Peak time: "${parsedResponse.route_plan?.peak_time || 'N/A'}"`);
    console.log(`[STEP 4] Curated places: ${parsedResponse.curated_places?.length || 0}`);
    (parsedResponse.curated_places || []).forEach((p: any, i: number) => {
      console.log(`[STEP 4]   ${i+1}. "${p.name}" at (${p.location?.lat}, ${p.location?.lng})`);
    });
    console.log(`[STEP 4] Weather attached: ${parsedResponse.current_weather?.temperature || 'N/A'}°C`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`[PIPELINE] ✅ Done! Sending response to frontend.`);
    console.log(`${'═'.repeat(60)}\n`);
    
    res.json(parsedResponse);

  } catch (error: any) {
    // 3. Perbaiki Error Handling: Tambahkan console.error(error) secara detail
    console.error("\n[CRITICAL ERROR] Failed in /api/vibe-route:", error);
    // Kirimkan status error 500 beserta pesan error aslinya ke frontend, BUKAN merespons dengan data dummy
    res.status(500).json({ 
      error: "Context Orchestration Error", 
      message: error.message || String(error)
    });
  }
});

/** Context Helpers (REAL API CALLS) */
async function fetchWeather(loc: any, key: string) {
  if (!loc) return null;
  try {
    const currentUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${key}&location.latitude=${loc.lat}&location.longitude=${loc.lng}`;
    const hourlyUrl = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${key}&location.latitude=${loc.lat}&location.longitude=${loc.lng}&hours=3`;
    
    const [currRes, hourRes] = await Promise.all([ fetch(currentUrl), fetch(hourlyUrl) ]);
    if (!currRes.ok || !hourRes.ok) return null;
    
    const currData = await currRes.json();
    const hourData = await hourRes.json();
    
    const mapGoogleWeatherCode = (condStr: string) => {
      if (!condStr) return 0;
      if (condStr.includes('CLEAR')) return 0; 
      if (condStr === 'PARTLY_CLOUDY') return 1;
      if (condStr === 'MOSTLY_CLOUDY') return 2;
      if (condStr === 'CLOUDY') return 3;
      if (condStr === 'DRIZZLE') return 51;
      if (condStr === 'RAIN') return 63;
      if (condStr === 'HEAVY_RAIN') return 65;
      if (condStr === 'THUNDERSTORM') return 95;
      if (condStr === 'SNOW') return 71;
      if (condStr === 'FOG' || condStr === 'HAZE') return 45;
      return 2; 
    };

    const resultData = {
      timezone: currData.timeZone?.id || 'Asia/Makassar',
      current_weather: {
        temperature: currData.temperature?.degrees || 0,
        windspeed: currData.wind?.speed?.value || 0,
        weathercode: mapGoogleWeatherCode(currData.weatherCondition?.type)
      },
      hourly_forecast: (hourData.forecastHours || []).map((h: any, i: number) => {
        const date = new Date(h.interval?.startTime || Date.now());
        return {
          time: i === 0 ? 'Sekarang' : `${String(date.getHours()).padStart(2,'0')}:00`,
          temp: Math.round(h.temperature?.degrees || 0),
          weathercode: mapGoogleWeatherCode(h.weatherCondition?.type),
          isCurrent: i === 0
        };
      })
    };
    
    console.log(`[Google Weather] Temp: ${resultData.current_weather.temperature}°C, Code: ${resultData.current_weather.weathercode}`);
    return resultData;
  } catch (err) { 
    console.error("fetchWeather Error:", err);
    return null; 
  }
}

async function fetchAirQuality(loc: any, key: string) {
  if (!loc || !key) return null;
  try {
    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ location: { latitude: loc.lat, longitude: loc.lng } })
    });
    return res.ok ? await res.json() : null;
  } catch (err) { 
    console.error("fetchAirQuality Error:", err);
    return null; 
  }
}

async function fetchPollen(loc: any, key: string) {
  if (!loc || !key) return null;
  try {
    const url = `https://pollen.googleapis.com/v1/forecast:lookup?key=${key}&location.latitude=${loc.lat}&location.longitude=${loc.lng}&days=1`;
    const res = await fetch(url);
    return res.ok ? await res.json() : null;
  } catch (err) { 
    console.error("fetchPollen Error:", err);
    return null; 
  }
}

async function findHiddenGems(query: string, loc: any, key: string) {
  if (!key) return null;
  try {
    const url = `https://places.googleapis.com/v1/places:searchText`;
    console.log(`[Places] Searching for: "${query}" near ${loc?.lat},${loc?.lng}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.reviews,places.types,places.photos'
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: loc ? {
          circle: {
            center: { latitude: loc.lat, longitude: loc.lng },
            radius: 50000.0
          }
        } : undefined,
        maxResultCount: 10,
        languageCode: 'id'
      })
    });
    const data = res.ok ? await res.json() : null;
    console.log(`[Places] API returned ${data?.places?.length || 0} places`);
    if (data?.places?.length) {
      console.log(`[Places] Names:`, data.places.map((p: any) => p.displayName?.text).join(', '));
    } else {
      console.warn(`[Places] No results! Response status: ${res.status}`);
      if (!res.ok) {
        const errBody = await res.text().catch(() => 'N/A');
        console.error(`[Places] Error body:`, errBody);
      }
    }
    return data;
  } catch (err) { 
    console.error("findHiddenGems Error:", err);
    return null; 
  }
}

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server & Frontend berjalan terpadu di http://localhost:${PORT}`);
  });
}

startServer();
