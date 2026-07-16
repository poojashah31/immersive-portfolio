# Fantasy Portfolio - Project Setup Specification

## Project Overview

This project is an immersive 3D interactive portfolio built using React and React Three Fiber.

The portfolio should feel like entering a fantasy world instead of browsing a traditional website.

The development philosophy is to build the project in small milestones, beginning with a single cinematic scene.

At this stage DO NOT build the portfolio.

ONLY setup the project architecture.

---

# Tech Stack

Framework
- React
- Vite

3D
- Three.js
- React Three Fiber
- Drei

Animation
- GSAP

Language
- JavaScript (NOT TypeScript)

Package Manager
- npm

Version Control
- Git

IDE
- Cursor

AI Assistant
- Claude Code (via Antigravity)

---

# Goals for Setup

Create a clean, scalable architecture suitable for a large cinematic React Three Fiber project.

Do NOT implement any portfolio UI.

Do NOT create animations.

Do NOT create scenes.

Do NOT generate placeholder code beyond basic boilerplate.

The objective is to produce a professional foundation.

---

# Required Folder Structure

portfolio-app/

public/

    models/
        books/
        castle/
        environment/
        props/

    textures/

    audio/

    hdri/

src/

    assets/

    components/

    scenes/

    hooks/

    animations/

    utils/

    constants/

    styles/

    App.jsx

    main.jsx

docs/

references/

prompts/

---

# Install Required Packages

Only install:

react

react-dom

vite

three

@react-three/fiber

@react-three/drei

gsap

Do NOT install additional packages unless absolutely required.

---

# Project Requirements

Configure React Three Fiber correctly.

Create a basic Canvas component.

Render a blank scene.

Configure shadows.

Configure color management.

Configure OrbitControls for development only.

Keep the code modular.

Do NOT hardcode values.

---

# Initial Scene

The app should only display:

A React Three Fiber Canvas

Perspective Camera

Ambient Light

Directional Light

Orbit Controls

Empty Scene component

Nothing else.

---

# Code Architecture

Create reusable folders.

Separate concerns.

No large files.

Use descriptive names.

Keep every component under approximately 200 lines whenever possible.

---

# Suggested File Structure

src/

components/

    CanvasContainer.jsx

scenes/

    IntroScene.jsx

hooks/

animations/

utils/

constants/

styles/

---

# Coding Standards

Use functional components.

Use React hooks.

Avoid duplicated code.

Write readable variable names.

Add comments where architecture decisions are made.

Keep formatting clean.

---

# Future Development

The setup should make it easy to add:

Book Scene

Castle Scene

Library Scene

Particle System

Audio Manager

Camera Controller

Animation Manager

Scene Manager

Lighting Manager

Asset Loader

without restructuring the project.

---

# Deliverables

Create:

1. Complete folder structure

2. package.json

3. Install all required dependencies

4. Configure React Three Fiber

5. Create reusable CanvasContainer component

6. Create empty IntroScene

7. App renders Canvas successfully

8. Development server starts without errors

9. Git initialized

10. Add a comprehensive README.md explaining:
    - project architecture
    - folder purpose
    - how to run the project
    - installed libraries
    - development workflow

Do NOT proceed beyond setup.
Stop after setup is complete.