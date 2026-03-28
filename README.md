# FlickerGrid

**Beautiful animated flickering dot grid backgrounds — generated in seconds.**

[flickergrid.vercel.app](https://flickergrid.vercel.app) is a free, open-source tool that lets you create and customize animated dot grid backgrounds (like the ones used by Linear, Vercel, and Efficient.app) with a visual editor. Export as code or as an AI prompt you can paste into any code agent.


---

## What is it?

A tiny squares grid where individual dots randomly fade in and out — creating a subtle, mesmerizing ambient background. It's a popular design pattern used by top SaaS companies for hero sections, dashboards, and dark-themed websites.

FlickerGrid gives you full control over every parameter with real-time preview, so you can nail the exact look you want.

## Features

- **Real-time preview** — see changes instantly as you adjust sliders
- **12 parameters** — spacing, dot size, opacity, fade speed, timing, colors
- **6 presets** — Subtle Night, Starfield, Matrix Rain, Warm Ember, Neon Pulse, Deep Ocean
- **AI Prompt export** — generates a detailed prompt you can paste into Claude, Cursor, ChatGPT, or any AI code agent to recreate the exact background
- **Code export** — generates a ready-to-use React component with your exact settings
- **No dependencies** — pure HTML5 Canvas, no external libraries needed
- **Performant** — uses `requestAnimationFrame` and `devicePixelRatio` for smooth 60fps on retina displays

## How to use

1. Go to [flickergrid.vercel.app](https://flickergrid.vercel.app)
2. Adjust the sliders until you like the effect
3. Click **"Prompt"** to get an AI-ready prompt, or **"Code"** to get a React component
4. Paste into your project

### AI Prompt

The **Prompt** button generates a detailed natural-language description of your exact configuration. Paste it into any AI code agent (Claude Code, Cursor, ChatGPT, Windsurf, etc.) and it will build the background for you in whatever framework you're using — React, Vue, Svelte, vanilla JS, or anything else.

### Code Export

The **Code** button generates a self-contained React component (`<FlickerGrid />`) with your exact settings baked in. Drop it into your project, wrap your content in a relative container, and you're done.

## Run locally

```bash
git clone https://github.com/adigold/flickergrid.git
cd flickergrid
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- [Next.js](https://nextjs.org/) 15 (App Router)
- [Tailwind CSS](https://tailwindcss.com/) 4
- HTML5 Canvas
- TypeScript

## Parameters

| Parameter | Description | Range |
|-----------|-------------|-------|
| Spacing | Distance between dots | 4–30px |
| Dot Size | Size of each square dot | 0.5–4px |
| % Lit | Percentage of dots initially lit | 0–50% |
| Base Alpha | Opacity of dim (off) dots | 0–0.1 |
| Lit Min | Minimum opacity when lit | 0.01–0.3 |
| Lit Max | Maximum opacity when lit | 0.05–0.6 |
| Fade In | Speed of fade-in transition | 0.1–3s |
| Fade Out | Speed of fade-out transition | 0.1–3s |
| On Duration | How long dots stay lit | 0.1–10s |
| Off Duration | How long dots stay dim | 0.1–20s |
| BG Color | Background color | Any hex |
| Dot Color | Dot RGB color | Any RGB |

## License

MIT — use it however you want.

---

## Author

Built by [Adi Goldstein](https://adigoldstein.com) — indie developer building tools for creators.

### Other projects

- [PromoTrack.me](https://promotrack.me) — AI music marketing platform
- [PromoLinks.me](https://promolinks.me) — Smart links & artist pages for musicians
- [MakeCanvas.me](https://makecanvas.me) — Design tool
- [MakeForm.me](https://makeform.me) — Form builder
- [Ambinote.me](https://ambinote.me) — Note-taking app
- [TrackTag.me](https://tracktag.me) — Music Tagging tool
- [Rehunt.me](https://rehunt.me) — ProductHunt Email Digest Tool
- [AGwatermark.com](https://agwatermark.com) — Watermarking tool
