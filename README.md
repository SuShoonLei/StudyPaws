# StudyPaws Frontend 🐾

> **A cute, pastel-themed study timer app with animated animal companions, a reward mini-game, and a pet feeding system — built with React.**

<br/>

![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-8A2BE2?style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [App Screens](#app-screens)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Animal Companions](#animal-companions)
- [Timer Accuracy](#timer-accuracy)
- [Connecting to the Backend](#connecting-to-the-backend)
- [Roadmap](#roadmap)

---

## Overview

StudyPaws turns a Pomodoro timer into a tiny pet-care game. Pick your animal study buddy, focus for a set duration, then play a quick food-collection game to earn treats. Feed your pet and watch their happiness grow. 🌸

The app is built as a **single React component file** with three fully animated screens:

```
Welcome → Study Timer → Reward Game → Feed Your Pet
```

The backend lives in [`studypaws-backend`](../studypaws-backend) (Python · FastAPI).

---

## Features

- 🐾 **6 animal companions** — each with unique pastel theme, food, scenes, and personality
- ⏱️ **Accurate study timer** — wall-clock based, immune to JS interval drift
- 🎬 **Animated scenes** — animal cycles through 5 activities while you study, then sleeps when done
- 🎮 **Reward mini-game** — tap falling food items before they vanish in 20 seconds
- 🍱 **Food inventory bar** — always-visible tally of collected food per animal
- 🐶 **Pet feeding screen** — feed your pet, watch the happiness bar fill, get emoji reactions
- 🎀 **Pastel design** — soft gradients, frosted glass cards, floating emoji bubbles, spring animations
- 📱 **Responsive** — works on desktop and mobile

---

## App Screens

### 1 — Welcome Screen
Choose your study buddy from 6 animals. The selected animal waves, changes the card's colour theme, and shows a speech bubble with their catchphrase. Click **Let's Start Studying!** to begin.

### 2 — Study Timer Screen
- Circular SVG progress ring fills as time counts down
- Animal animates inside the ring — breathes while running, shakes when done
- Activity label cycles every 30 seconds through the animal's 5 scenes (Stretching → Reading → Thinking → Writing → Break)
- Scene dots at the bottom show which activity is active
- Click the time display to edit the duration (1–180 min, default 25)
- **▶ Start / ⏸ Pause / ↺ Reset** controls
- When time's up: animal sleeps 😴, a golden **Collect Rewards!** button appears

### 3 — Reward Game + Feeding Screen
Four phases:

| Phase | Description |
|-------|-------------|
| **Intro** | Rules card, swinging food emoji, Start button |
| **Playing** | Food items pop onto the arena — tap them before they vanish. Timer bar drains at the top. Live HUD shows Caught / Time / Missed |
| **Result** | Score card with caught vs missed, then **Feed [Name]!** button |
| **Feeding** | Pet in the centre with a speech bubble. Feed button deducts food and fills the happiness bar. Pet face changes at 40, 60, 80 points |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or your preferred package manager)
- A running instance of the [StudyPaws backend](../studypaws-backend) on `localhost:8000` *(optional — the app works standalone with local state)*

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/studypaws-frontend.git
cd studypaws-frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
studypaws-frontend/
│
├── src/
│   ├── App.jsx                 ← Root app — screen router + shared state
│   │
│   ├── components/
│   │   ├── Welcome.jsx         ← Screen 1: animal picker + entry
│   │   ├── StudyTimer.jsx      ← Screen 2: countdown + animated animal
│   │   └── RewardScreen.jsx    ← Screen 3: game + feeding
│   │
│   ├── constants/
│   │   └── animals.js          ← ANIMALS data — all 6 companions defined here
│   │
│   └── index.css               ← Global keyframe animations + utility classes
│
├── index.html
├── package.json
└── README.md
```

> **Note:** The current version ships as a single `StudyPaws.jsx` file for simplicity. The structure above is the recommended layout when splitting into components.

---

## Animal Companions

| Key | Animal | Food | Theme |
|-----|--------|------|-------|
| `koala` | 🐨 Koala | 🍃 Eucalyptus | Mint green |
| `panda` | 🐼 Panda | 🎋 Bamboo | Soft pink |
| `fox`   | 🦊 Fox   | 🍇 Berries   | Warm amber |
| `puppy` | 🐶 Puppy | 🦴 Bones     | Sunny yellow |
| `bunny` | 🐰 Bunny | 🥕 Carrots   | Lavender |
| `bear`  | 🐻 Bear  | 🍯 Honey     | Warm grey |

Each animal has:
- A unique pastel colour pair (`color` + `accent`) applied to the card, ring, and inventory bar
- 5 study scenes with labels and activity messages
- 3 hunger messages shown in the feeding speech bubble
- A unique sleep message displayed when the timer ends

---

## Timer Accuracy

The timer uses **wall-clock time** instead of counting interval ticks, which prevents drift when the browser tab is backgrounded or the device throttles JS:

```js
// On Start: record the epoch-ms and the remaining seconds at that moment
const startTime = Date.now();
const startRem  = remRef.current;

// Every 500 ms: compute remaining from real elapsed time
const next = startRem - Math.floor((Date.now() - startTime) / 1000);
setRem(next);
```

This means a 1-minute timer always finishes in exactly 60 real-world seconds, regardless of how many times React re-renders or whether the tab was backgrounded.

When connected to the backend, `/timer/session/{id}/validate` can be called every ~30 seconds to snap the UI to the server's authoritative value.

---

## Connecting to the Backend

The app works fully offline with local React state. To wire it up to the [StudyPaws backend](../studypaws-backend):

### Start a timer session

```js
const BASE = "http://localhost:8000";

// When the user clicks ▶ Start
const { session_id } = await fetch(`${BASE}/timer/session`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ animal_key: "koala", duration_minutes: 25 }),
}).then(r => r.json());

await fetch(`${BASE}/timer/session/${session_id}/start`, { method: "POST" });
```

### Replace the local poll with a server poll

```js
// Every 500 ms instead of calculating locally:
const state = await fetch(`${BASE}/timer/session/${sessionId}`).then(r => r.json());
setRem(state.remaining_seconds);
setSceneIdx(state.current_scene_index);   // no local scene math needed
if (state.status === "done") goToRewardScreen();
```

### Save food after the game

```js
// End the game and get the authoritative caught count
const result = await fetch(`${BASE}/game/${gameId}/end`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ game_id: gameId, client_caught: caught, client_missed: missed, ended_at_ms: Date.now() }),
}).then(r => r.json());

// Credit food to inventory
await fetch(`${BASE}/pets/inventory/add`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ animal_key: "koala", amount: result.food_earned }),
});
```

### Feed the pet

```js
const feed = await fetch(`${BASE}/pets/${animalKey}/feed`, {
  method: "POST",
}).then(r => r.json());

setHappiness(feed.happiness);      // 0–100
setInventory(feed.inventory);      // updated counts for all animals
```

---

## Key Design Decisions

**Pastel glass-morphism cards** — every card uses `background: rgba(255,255,255,0.65)` with `backdrop-filter: blur(20px)` and a soft coloured shadow derived from the active animal's accent colour.

**Wall-clock timer** — `Date.now()` at start, `Math.floor((now - start) / 1000)` on each tick. No accumulated counter means no drift.

**Spring animations** — interactive elements use `cubic-bezier(0.34, 1.56, 0.64, 1)` — a slight overshoot that gives a bouncy, toy-like feel consistent with the app's personality.

**Per-animal theming** — every colour in the UI (card background, progress ring, inventory badge, food bar, button) derives from the active animal's `color` and `accent` fields, so switching animals feels like a complete theme change.

**Scene rotation** — the animal's activity label changes every 30 seconds of running time. `scene_index = Math.floor(elapsed / (duration / numScenes))` so scenes are evenly spread across the session regardless of duration.

---

## Roadmap

- [ ] Connect all screens to the FastAPI backend
- [ ] Persist food inventory to `localStorage` (offline) or backend (online)
- [ ] Study streak tracker on the home screen
- [ ] Sound effects — soft chimes on collection, purring when feeding
- [ ] Break timer between Pomodoro sessions
- [ ] Settings screen — custom durations, mute sounds, choose theme

---

## License

MIT ... just keep the paws. 🐾
