# Fantasy Portfolio - Project Setup

This is the immersive 3D interactive portfolio project, built with React, React Three Fiber, Three.js, and GSAP. 

The architecture is designed to support a scalable, modular fantasy-themed environment that leads visitors on a cinematic journey.

---

## 1. Project Architecture

The architecture utilizes a clean separation of concerns:
- **Presentation Layer**: Renders the 3D Canvas and environment configurations (`src/components/`, `src/scenes/`).
- **Core Logic**: Reusable state hooks, mathematical/physical helpers (`src/hooks/`, `src/utils/`).
- **Animation Layer**: GSAP timelines and transitions (`src/animations/`).
- **Static Assets**: Structured model categories, hdri skyboxes, sound assets, and textures (`public/`).

---

## 2. Folder Structure Purpose

```text
portfolio-app/
├── public/                     # Static assets served directly
│   ├── models/                 # 3D models grouped by cinematic scene
│   │   ├── books/              # Book model and details
│   │   ├── castle/             # Castle scene meshes
│   │   ├── environment/        # Terrain, pathways, sky assets
│   │   └── props/              # Small, reusable props
│   ├── textures/               # Custom image textures
│   ├── audio/                  # Background music and spatial sound effects
│   └── hdri/                   # High Dynamic Range Images for lighting
│
├── src/                        # React source code
│   ├── assets/                 # SVGs, images, and other compiled resources
│   ├── components/             # Reusable UI/3D wrappers (e.g. CanvasContainer)
│   ├── scenes/                 # Individual 3D scenes (e.g. IntroScene)
│   ├── hooks/                  # Custom React hooks (e.g., useAssetLoader)
│   ├── animations/             # GSAP animation timeline builders
│   ├── utils/                  # Helper math, raycasting, and formatting scripts
│   ├── constants/              # Fixed values (color schemes, camera configs)
│   ├── styles/                 # Project styling and global CSS rules
│   ├── App.jsx                 # Application layout root
│   └── main.jsx                # Application mounting entry point
│
├── docs/                       # Project specs and architectural documentation
├── references/                 # Asset attribution, styling inspiration, reference links
└── prompts/                    # Claude AI system prompts and instructions
```

---

## 3. Installed Libraries

The project is built using a minimal, highly optimized tech stack:
- **`react` & `react-dom`**: Frontend library and DOM renderer.
- **`three`**: Core WebGL 3D rendering library.
- **`@react-three/fiber`**: React wrapper for Three.js.
- **`@react-three/drei`**: Curated helper library containing useful shaders, helpers, and camera controls (e.g., `<OrbitControls />`).
- **`gsap`**: Greensock Animation Platform for orchestrating high-performance cinematic animations.
- **`vite`**: Ultrafast build tool and local dev server.

---

## 4. How to Run the Project

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation
From the root directory, run:
```bash
npm install
```

### Running Locally
To launch the development server with automatic file reloading:
```bash
npm run dev
```

### Building for Production
To bundle the project for production deployment:
```bash
npm run build
```

### Previewing Production Build
To view the production bundle locally:
```bash
npm run preview
```

---

## 5. Development Workflow

1. **Incremental Milestone Building**: Each milestone should focus on a single scene (e.g., Intro, Book, Castle, Library) rather than building all parts at once.
2. **Modular Components**: Keep components functional, simple, and under 200 lines whenever possible.
3. **Environment Checks**: Utilize `import.meta.env.DEV` to render debugging tools like `<OrbitControls />` and axis helpers only during local development.
4. **Asset Management**: Place raw 3D assets in `public/models/` and optimize them (using tool chains like `gltf-pipeline` or `gltfjsx`) before loading.
