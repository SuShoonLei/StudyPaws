# app/core/constants.py
# ─────────────────────────────────────────────────────────────────────────────
# Single source of truth for all StudyPaws domain constants.
# These mirror the ANIMALS object in the React frontend so that the backend
# can validate requests and generate server-side state without relying on the
# client to send animal metadata.
# ─────────────────────────────────────────────────────────────────────────────

from typing import Final

# ── Timer ─────────────────────────────────────────────────────────────────────
DEFAULT_DURATION_MINUTES: Final[int] = 25
MIN_DURATION_MINUTES: Final[int] = 1
MAX_DURATION_MINUTES: Final[int] = 180

# ── Game ──────────────────────────────────────────────────────────────────────
GAME_DURATION_SECONDS: Final[int] = 20
GAME_SPAWN_INTERVAL_MS: Final[int] = 1100
GAME_MAX_ITEMS: Final[int] = 9
GAME_ITEM_TTL_MS: Final[int] = 3200        # how long a food item lives on screen

# ── Pet happiness ─────────────────────────────────────────────────────────────
HAPPINESS_PER_FEED: Final[int] = 20        # each feed adds this much happiness
MAX_HAPPINESS: Final[int] = 100
MIN_HAPPINESS: Final[int] = 0

# ── Food inventory ────────────────────────────────────────────────────────────
MAX_FOOD_PER_ANIMAL: Final[int] = 20       # capacity shown on the progress bar

# ── Animals ───────────────────────────────────────────────────────────────────
# Each entry mirrors the corresponding ANIMALS[key] object in StudyPaws.jsx.
ANIMAL_DEFINITIONS: Final[dict] = {
    "koala": {
        "key":       "koala",
        "name":      "Koala",
        "emoji":     "🐨",
        "food":      "🍃",
        "food_name": "Eucalyptus",
        "color":     "#C8E6C9",
        "accent":    "#81C784",
        "msg":       "Let's study together!",
        "sleep_msg": "Zzz… good work! 🌙",
        "hunger_msgs": [
            "I'm hungry!",
            "Feed me! 🍃",
            "Eucalyptus please!",
        ],
        "scenes": [
            {"label": "Stretching", "activity": "Morning stretch!"},
            {"label": "Reading",    "activity": "Deep in the books…"},
            {"label": "Thinking",   "activity": "Processing ideas…"},
            {"label": "Writing",    "activity": "Taking notes…"},
            {"label": "Snacking",   "activity": "Eucalyptus break!"},
        ],
    },
    "panda": {
        "key":       "panda",
        "name":      "Panda",
        "emoji":     "🐼",
        "food":      "🎋",
        "food_name": "Bamboo",
        "color":     "#F8BBD0",
        "accent":    "#F48FB1",
        "msg":       "You can do it!",
        "sleep_msg": "Zzz… amazing! 🌸",
        "hunger_msgs": [
            "Need bamboo!",
            "Feed me! 🎋",
            "So hungry…",
        ],
        "scenes": [
            {"label": "Stretching", "activity": "Morning stretch!"},
            {"label": "Reading",    "activity": "Reading bamboo scrolls…"},
            {"label": "Thinking",   "activity": "Deep in thought…"},
            {"label": "Writing",    "activity": "Writing notes…"},
            {"label": "Snacking",   "activity": "Bamboo break!"},
        ],
    },
    "fox": {
        "key":       "fox",
        "name":      "Fox",
        "emoji":     "🦊",
        "food":      "🍇",
        "food_name": "Berries",
        "color":     "#FFE0B2",
        "accent":    "#FFCC80",
        "msg":       "Stay curious!",
        "sleep_msg": "Zzz… clever fox! 🌙",
        "hunger_msgs": [
            "Berries please!",
            "Feed me! 🍇",
            "I'm starving!",
        ],
        "scenes": [
            {"label": "Stretching", "activity": "Foxy stretch!"},
            {"label": "Research",   "activity": "Investigating…"},
            {"label": "Thinking",   "activity": "A-ha moments…"},
            {"label": "Writing",    "activity": "Clever ideas…"},
            {"label": "Break",      "activity": "Forest break!"},
        ],
    },
    "puppy": {
        "key":       "puppy",
        "name":      "Puppy",
        "emoji":     "🐶",
        "food":      "🦴",
        "food_name": "Bones",
        "color":     "#FFF9C4",
        "accent":    "#F9A825",
        "msg":       "Woof! Let's go!",
        "sleep_msg": "Zzz… dreaming of bones! 🌙",
        "hunger_msgs": [
            "Want a bone!",
            "Feed me! 🦴",
            "Woof woof hungry!",
        ],
        "scenes": [
            {"label": "Stretching", "activity": "Morning zoomies!"},
            {"label": "Reading",    "activity": "Studious pup…"},
            {"label": "Thinking",   "activity": "Woof… thinking…"},
            {"label": "Writing",    "activity": "Paw-writing notes…"},
            {"label": "Break",      "activity": "Ball break! Fetch!"},
        ],
    },
    "bunny": {
        "key":       "bunny",
        "name":      "Bunny",
        "emoji":     "🐰",
        "food":      "🥕",
        "food_name": "Carrots",
        "color":     "#E1BEE7",
        "accent":    "#CE93D8",
        "msg":       "Focus & flow!",
        "sleep_msg": "Zzz… fluffy dreams! 🌸",
        "hunger_msgs": [
            "Want carrots!",
            "Feed me! 🥕",
            "So hungry!",
        ],
        "scenes": [
            {"label": "Hopping",  "activity": "Bouncing in!"},
            {"label": "Reading",  "activity": "Textbooks time!"},
            {"label": "Thinking", "activity": "Bunny brain…"},
            {"label": "Writing",  "activity": "Scribble…"},
            {"label": "Break",    "activity": "Carrot break!"},
        ],
    },
    "bear": {
        "key":       "bear",
        "name":      "Bear",
        "emoji":     "🐻",
        "food":      "🍯",
        "food_name": "Honey",
        "color":     "#D7CCC8",
        "accent":    "#BCAAA4",
        "msg":       "Be steady!",
        "sleep_msg": "Zzz… hibernating! 🌙",
        "hunger_msgs": [
            "Need honey!",
            "Feed me! 🍯",
            "Growl… hungry!",
        ],
        "scenes": [
            {"label": "Roaring",  "activity": "Grr let's go!"},
            {"label": "Reading",  "activity": "Bear study…"},
            {"label": "Thinking", "activity": "Steady focus…"},
            {"label": "Writing",  "activity": "Paw-writing…"},
            {"label": "Break",    "activity": "Honey break!"},
        ],
    },
}

VALID_ANIMAL_KEYS: Final[set] = set(ANIMAL_DEFINITIONS.keys())
