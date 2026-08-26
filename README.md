# ⛅ AetherCast — Soft Neo-Brutalist Live Weather Dashboard

An aesthetic, responsive, and tactile weather dashboard built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and the **Open-Meteo API**. Designed with a soft, eye-friendly Neo-Brutalist aesthetic featuring adaptive weather palettes, high-contrast dark mode, and granular forecast insights.

---

## ✨ Features

- 🎨 **Soft Neo-Brutalist Aesthetics**: Warm creamy tones (`#FAF7F0`) in light mode, deep obsidian (`#0B0C10`) in dark mode, crisp borders, hard offset drop-shadows, and tactile click states.
- 🌈 **Atmospheric Adaptive Palettes**: Cards adapt their color accents and badges based on real-time weather conditions (sunny, rainy, foggy, stormy, snowy, or twilight night).
- 🕒 **24-Hour Hourly Forecast Scroller**: Interactive horizontal timeline displaying hourly temperature trends, weather icons, and precipitation chances.
- 📅 **5-Day Meteorological Outlook**: Concise daily forecast tracking high/low temperature ranges and conditions.
- 🧠 **Contextual Weather Badges**: Smart situational stickers offering immediate recommendations (e.g. 🧣 "Freezing cold • Heavy coat recommended", ☀️ "High UV Alert", 🌧️ "Rainy • Bring an umbrella").
- 📊 **Key Metrics**: Real-time tracking of Feels Like, Relative Humidity, Wind Speed & Direction, and UV Index.
- 📍 **GPS Geolocation**: Instant "My Location" detector to fetch local weather with one click.
- 🔍 **Debounced Search with Popover Dropdown**: Floating search bar with rapid popular city shortcuts (Cairo, Tokyo, London, Paris, New York, Dubai).
- 🌙 **High-Contrast Dark Mode**: Deep obsidian dark theme with vivid, legible cards and badges.
- 💾 **LocalStorage Persistence**: Cities, preferred temperature units (°C / °F), and color themes persist across browser sessions.
- ⚡ **Real-Time 15s Auto-Sync**: Background polling with manual refresh capability.

---

## 🚀 Tech Stack

- **Framework**: React 19 + Vite 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Custom Neo-Brutalist tokens
- **Icons**: Lucide React
- **API**: Open-Meteo Weather & Geocoding APIs (No API key required)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm / yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Adham-Kishawi/AetherCast.git

# Navigate to project directory
cd AetherCast

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 📄 License
MIT
