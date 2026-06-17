# ⚔️ Battle Engineers

A turn-based multiplayer artillery strategy game built with React and HTML5 Canvas. Destroy terrain, pick your arsenal, and outplay your opponents across procedurally generated battlefields.

**[▸ Play Now](https://battleengineers.vercel.app)**

---

## About

Battle Engineers is a local multiplayer game inspired by classics like *Worms* and *Scorched Earth*. Players take turns aiming and firing projectiles across destructible terrain, managing movement, switching weapons, and even building terrain for cover — all rendered in real-time on Canvas 2D with WebGL particle effects.

### Features

- **2–4 Player Local Multiplayer** — hot-seat gameplay with named players and color-coded tanks
- **8 Unique Weapons** — Cannon Shot, Bouncer, Tire Roll, Lightning Strike, Cluster Rockets, Napalm, Drone Kill, and Chemical Rain — each with distinct physics and behavior
- **Destructible Terrain** — explosions carve craters; build mode lets you raise terrain for cover
- **5 Themed Maps** — Research Lab, Mars Colony, Abandoned Factory, University Campus, and random generation
- **Weapon Draft System** — each player picks 5 weapons before battle (each fires twice = 10 shots total)
- **Cinematic VFX** — screen shake, slow-motion on impact, freeze frames, muzzle flash, GPU-accelerated particle explosions (WebGL)
- **Procedural Sound** — all sound effects synthesized in real-time via Web Audio API (no audio files)
- **Responsive Design** — full desktop and mobile support with adaptive controls and landscape orientation hints

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| Rendering | HTML5 Canvas 2D |
| Particle FX | WebGL (custom GPU particle system) |
| Audio | Web Audio API (procedural synthesis) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm

### Installation

```bash
git clone https://github.com/NavneetManwal28/battle-engineers.git
cd battle-engineers
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## How to Play

1. **Setup** — Choose 2–4 players, name them, and pick a map theme (or go random)
2. **Weapon Draft** — Each player selects 5 weapons from the arsenal. Each weapon gets 2 shots.
3. **Battle** — Players take turns:
   - **Move** — Use ◀ ▶ or `A` / `D` keys to reposition your tank
   - **Aim** — Adjust angle and power with sliders or Arrow keys
   - **Fire** — Press the FIRE button, `Space`, or `Enter`
   - **Build** — Toggle to Build mode (`B` key) to raise terrain instead of attacking
4. **Win** — Last player standing wins!

### Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move | `A` / `D` | ◀ ▶ buttons |
| Adjust Angle | `←` / `→` | Angle slider |
| Adjust Power | `↑` / `↓` | Power slider |
| Fire | `Space` / `Enter` | FIRE button |
| Toggle Build | `B` | BLD/ATK button |
| Switch Weapon | In-game UI | ◀ ▶ weapon selector |

---

## Weapons Guide

| Weapon | Icon | Type | Description |
|--------|------|------|-------------|
| Cannon Shot | 💣 | Arc | Standard projectile — reliable damage |
| Bouncer | 🔴 | Bounce | Bounces 3 times before detonating |
| Tire Roll | ⭕ | Arc → Roll | Arcs then rolls along terrain on fire |
| Lightning | ⚡ | Arc → Strike | Arcs to a point then calls a lightning bolt |
| Cluster Rockets | 🚀 | Rapid | Fires 3 rockets in quick succession |
| Napalm | 🔥 | Pool | Creates a fire pool that burns for 3 turns |
| Drone Kill | 🛸 | Hover + Drop | Hovers over target and drops 3 bombs |
| Chemical Rain | ☣️ | Hover + Rain | Hovers and rains 5 acid drops over a wide area |

---

## Project Structure

```
battle-engineers/
├── index.html          # Entry HTML
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite configuration
├── vercel.json         # Vercel deployment config
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # Main game UI (menu, weapon picker, HUD, controls)
    ├── App.css         # Global styles & neumorphic theme
    ├── engine.js       # Game engine (physics, terrain, rendering, game loop)
    ├── sounds.js       # Procedural sound effects (Web Audio API)
    └── vfx.js          # WebGL GPU particle system (explosions, bloom)
```

---

## License

This project is open source. Feel free to fork, modify, and build upon it.

---

## Author

**Navneet Manwal** — [GitHub](https://github.com/NavneetManwal28)
