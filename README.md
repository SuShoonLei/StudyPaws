# StudyPaws Backend 🐾

Python · FastAPI · Pydantic v2

---

## Project Structure

```
studypaws-backend/
├── app/
│   ├── main.py                   ← FastAPI app, CORS, router mounts
│   ├── core/
│   │   └── constants.py          ← All domain constants (mirrors frontend ANIMALS)
│   ├── models/
│   │   └── schemas.py            ← All Pydantic request/response models
│   ├── services/
│   │   ├── timer_service.py      ← Wall-clock study timer logic
│   │   ├── game_service.py       ← Reward mini-game logic
│   │   ├── pet_service.py        ← Inventory & feeding logic
│   │   └── animal_service.py     ← Animal catalogue (read-only)
│   └── routers/
│       ├── animals.py            ← GET /animals
│       ├── timer.py              ← /timer/session/*
│       ├── game.py               ← /game/*
│       └── pets.py               ← /pets/*
├── requirements.txt
└── README.md
```

---

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the dev server
uvicorn app.main:app --reload --port 8000

# 3. Open interactive docs
open http://localhost:8000/docs
```

---

## API Reference

### Health
| Method | Path      | Description        |
|--------|-----------|--------------------|
| GET    | `/health` | Liveness check     |

---

### Animals  `/animals`
| Method | Path               | Description                    |
|--------|--------------------|--------------------------------|
| GET    | `/animals`         | List all 6 animals             |
| GET    | `/animals/{key}`   | Get one animal (koala, panda…) |

---

### Timer  `/timer`

The timer uses **wall-clock time**, not tick-counting, so it is immune to
interval drift even when the browser tab is backgrounded.

| Method | Path                              | Description                        |
|--------|-----------------------------------|------------------------------------|
| POST   | `/timer/session`                  | Create idle session                |
| POST   | `/timer/session/{id}/start`       | Start the countdown                |
| POST   | `/timer/session/{id}/pause`       | Pause (send `paused_at_ms`)        |
| POST   | `/timer/session/{id}/resume`      | Resume (send `resumed_at_ms`)      |
| POST   | `/timer/session/{id}/reset`       | Reset to idle                      |
| POST   | `/timer/session/{id}/complete`    | Mark as done                       |
| GET    | `/timer/session/{id}`             | Poll current state (every 1s)      |
| POST   | `/timer/session/{id}/validate`    | Drift check — send client value    |
| DELETE | `/timer/session/{id}`             | Delete from memory                 |

**TimerStateResponse** key fields:
```json
{
  "session_id": "uuid",
  "status": "running",
  "remaining_seconds": 1234,
  "progress": 0.31,
  "current_scene_index": 1,
  "formatted_remaining": "20:34"
}
```

**Drift validation** — send this every ~30 s from the frontend:
```json
POST /timer/session/{id}/validate
{
  "session_id": "uuid",
  "client_remaining_seconds": 1230,
  "client_timestamp_ms": 1718000000000
}
```
Response includes `drift_seconds` and `authoritative_remaining` to snap the UI.

---

### Game  `/game`

| Method | Path                  | Description                                  |
|--------|-----------------------|----------------------------------------------|
| POST   | `/game/start`         | Start a new 20-second game round             |
| GET    | `/game/{id}/spawn`    | Request next food item (call every 1100 ms)  |
| POST   | `/game/{id}/collect`  | Register a tap (sends `item_id`, timestamp)  |
| POST   | `/game/{id}/end`      | Finalise — get authoritative caught/missed   |
| GET    | `/game/{id}/state`    | Lightweight status poll                      |

**Collect tap payload:**
```json
{
  "game_id": "uuid",
  "item_id": "uuid",
  "collected_at_ms": 1718000005123
}
```

**GameResultResponse:**
```json
{
  "caught": 12,
  "missed": 3,
  "food_earned": 12,
  "accuracy_percent": 80.0
}
```

---

### Pets & Inventory  `/pets`

| Method | Path                          | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/pets/inventory`             | All food counts + pet states       |
| GET    | `/pets/{key}`                 | Single pet state                   |
| POST   | `/pets/inventory/add`         | Add food after a game round        |
| POST   | `/pets/{key}/feed`            | Feed one unit → happiness +20      |
| POST   | `/pets/{key}/reset-happiness` | Reset happiness to 0               |

**FeedPetResponse:**
```json
{
  "animal_key": "koala",
  "food_remaining": 7,
  "happiness": 60,
  "happiness_emoji": "😊",
  "happiness_msg": "Loving it!",
  "happiness_gained": 20
}
```

---

## Wiring up the React Frontend

### 1. Create a session when the user picks their animal

```js
const res = await fetch("http://localhost:8000/timer/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ animal_key: "koala", duration_minutes: 25 }),
});
const { session_id } = await res.json();
```

### 2. Start / pause / resume map directly to buttons

```js
// ▶ Start
await fetch(`/timer/session/${sessionId}/start`, { method: "POST" });

// ⏸ Pause  (send client epoch ms)
await fetch(`/timer/session/${sessionId}/pause`, {
  method: "POST",
  body: JSON.stringify({ session_id: sessionId, paused_at_ms: Date.now() }),
});
```

### 3. Poll for remaining time (replaces the local interval)

```js
// Every 1 second:
const state = await fetch(`/timer/session/${sessionId}`).then(r => r.json());
setRem(state.remaining_seconds);
setSceneIdx(state.current_scene_index);
if (state.status === "done") triggerRewardScreen();
```

### 4. After the game, save food then feed

```js
// Save earned food
await fetch("/pets/inventory/add", {
  method: "POST",
  body: JSON.stringify({ animal_key: "koala", amount: caught }),
});

// Feed button tap
const feed = await fetch(`/pets/koala/feed`, { method: "POST" }).then(r => r.json());
setHappiness(feed.happiness);
setInventory(feed.inventory);
```

---

## Timer Accuracy Design

The server never accumulates a counter. Instead:

1. `started_at_ms` records the epoch-ms when the user clicks ▶.
2. Pauses are tracked as intervals in `total_paused_ms`.
3. On every poll: `elapsed = (now_ms - started_at_ms - total_paused_ms) / 1000`
4. `remaining = duration_seconds - elapsed`

This means a 1-minute timer will always finish in **exactly 60 real-world seconds**
regardless of server load, GC pauses, or browser tab throttling.
