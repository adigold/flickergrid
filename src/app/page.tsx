'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ==================== Types ====================

interface GridConfig {
  spacing: number
  dotSize: number
  baseAlpha: number
  litAlphaMin: number
  litAlphaMax: number
  fadeInSpeed: number
  fadeOutSpeed: number
  onDurationMin: number
  onDurationMax: number
  offDurationMin: number
  offDurationMax: number
  percentLit: number
  bgColor: string
  dotColor: string
}

// ==================== Presets ====================

const PRESETS: { name: string; emoji: string; config: GridConfig }[] = [
  {
    name: 'Subtle Night', emoji: '🌙',
    config: {
      spacing: 10, dotSize: 1.5, baseAlpha: 0.01, litAlphaMin: 0.04, litAlphaMax: 0.16,
      fadeInSpeed: 0.5, fadeOutSpeed: 0.3, onDurationMin: 0.8, onDurationMax: 2.5,
      offDurationMin: 1.5, offDurationMax: 5, percentLit: 15, bgColor: '#0a0a1a', dotColor: '255,255,255',
    },
  },
  {
    name: 'Starfield', emoji: '✨',
    config: {
      spacing: 8, dotSize: 1, baseAlpha: 0.005, litAlphaMin: 0.03, litAlphaMax: 0.25,
      fadeInSpeed: 0.3, fadeOutSpeed: 0.15, onDurationMin: 1, onDurationMax: 4,
      offDurationMin: 2, offDurationMax: 8, percentLit: 10, bgColor: '#050510', dotColor: '200,210,255',
    },
  },
  {
    name: 'Matrix', emoji: '🟢',
    config: {
      spacing: 12, dotSize: 2, baseAlpha: 0.008, litAlphaMin: 0.05, litAlphaMax: 0.3,
      fadeInSpeed: 1.5, fadeOutSpeed: 0.8, onDurationMin: 0.2, onDurationMax: 0.8,
      offDurationMin: 0.5, offDurationMax: 3, percentLit: 20, bgColor: '#0a0f0a', dotColor: '0,255,100',
    },
  },
  {
    name: 'Ember', emoji: '🔥',
    config: {
      spacing: 10, dotSize: 1.5, baseAlpha: 0.01, litAlphaMin: 0.04, litAlphaMax: 0.2,
      fadeInSpeed: 0.4, fadeOutSpeed: 0.2, onDurationMin: 1, onDurationMax: 3,
      offDurationMin: 2, offDurationMax: 6, percentLit: 12, bgColor: '#1a0a0a', dotColor: '255,140,50',
    },
  },
  {
    name: 'Neon', emoji: '💜',
    config: {
      spacing: 8, dotSize: 1.5, baseAlpha: 0.01, litAlphaMin: 0.06, litAlphaMax: 0.35,
      fadeInSpeed: 1.2, fadeOutSpeed: 0.6, onDurationMin: 0.3, onDurationMax: 1.2,
      offDurationMin: 0.5, offDurationMax: 2.5, percentLit: 25, bgColor: '#0a0515', dotColor: '180,80,255',
    },
  },
  {
    name: 'Ocean', emoji: '🌊',
    config: {
      spacing: 14, dotSize: 1, baseAlpha: 0.008, litAlphaMin: 0.03, litAlphaMax: 0.12,
      fadeInSpeed: 0.2, fadeOutSpeed: 0.1, onDurationMin: 2, onDurationMax: 6,
      offDurationMin: 3, offDurationMax: 10, percentLit: 8, bgColor: '#040a14', dotColor: '80,180,255',
    },
  },
]

const DEFAULT = PRESETS[0].config

// ==================== Prompt & Code Generators ====================

function generatePrompt(c: GridConfig): string {
  return `Create an animated flickering dot grid background using HTML Canvas. The background should have these exact specifications:

VISUAL STYLE:
- A grid of tiny squares (${c.dotSize}px) spaced ${c.spacing}px apart
- Background color: ${c.bgColor}
- Dot color: rgba(${c.dotColor}, alpha)
- Most dots are very dim (base opacity: ${c.baseAlpha})
- About ${c.percentLit}% of dots are initially lit up

ANIMATION BEHAVIOR:
- Each dot independently and randomly turns ON and OFF with smooth fade transitions
- When turning ON: fade to opacity between ${c.litAlphaMin} and ${c.litAlphaMax}, fade duration ${c.fadeInSpeed}–${(c.fadeInSpeed * 2).toFixed(1)}s
- Stay lit for ${c.onDurationMin}–${c.onDurationMax}s before fading off
- When turning OFF: fade back to base opacity (${c.baseAlpha}), fade duration ${c.fadeOutSpeed}–${(c.fadeOutSpeed * 2).toFixed(1)}s
- Stay dim for ${c.offDurationMin}–${c.offDurationMax}s before possibly lighting up again
- The effect should feel organic and ambient — like distant stars flickering

TECHNICAL REQUIREMENTS:
- Use HTML5 Canvas with requestAnimationFrame for performance
- Support window resize (recalculate grid on resize)
- Use devicePixelRatio for sharp rendering on retina displays
- Each dot should have its own independent timer and fade state
- Use fillRect (not arc) for square dots
- The canvas should be absolutely positioned and fill its container
- Keep it lightweight — no external libraries needed

The overall effect should be a subtle, mesmerizing ambient background suitable for a dark-themed website hero section or dashboard.`
}

function generateCode(c: GridConfig): string {
  return `// FlickerGrid — Animated Dot Grid Background
// Generated at flickergrid.dev

export function FlickerGrid({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <canvas
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
      ref={(canvas) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const C = {
          spacing: ${c.spacing}, dotSize: ${c.dotSize}, baseAlpha: ${c.baseAlpha},
          litAlphaMin: ${c.litAlphaMin}, litAlphaMax: ${c.litAlphaMax},
          fadeInSpeed: ${c.fadeInSpeed}, fadeOutSpeed: ${c.fadeOutSpeed},
          onDurationMin: ${c.onDurationMin}, onDurationMax: ${c.onDurationMax},
          offDurationMin: ${c.offDurationMin}, offDurationMax: ${c.offDurationMax},
          percentLit: ${c.percentLit}, dotColor: '${c.dotColor}',
        }

        const dpr = window.devicePixelRatio || 1
        let w = 0, h = 0
        let dots: { x: number; y: number; opacity: number; targetOpacity: number; fadeSpeed: number; nextToggle: number }[] = []

        function init() {
          w = canvas.offsetWidth; h = canvas.offsetHeight
          canvas.width = w * dpr; canvas.height = h * dpr
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          const cols = Math.ceil(w / C.spacing) + 1, rows = Math.ceil(h / C.spacing) + 1
          const now = performance.now() / 1000; dots = []
          for (let r = 0; r < rows; r++) for (let c2 = 0; c2 < cols; c2++) {
            const on = Math.random() * 100 < C.percentLit
            dots.push({ x: c2 * C.spacing, y: r * C.spacing,
              opacity: on ? C.litAlphaMin + Math.random() * (C.litAlphaMax - C.litAlphaMin) : C.baseAlpha,
              targetOpacity: on ? C.litAlphaMin + Math.random() * (C.litAlphaMax - C.litAlphaMin) : C.baseAlpha,
              fadeSpeed: C.fadeInSpeed + Math.random() * 0.5, nextToggle: now + Math.random() * 3 })
          }
        }
        init(); window.addEventListener('resize', init)

        let frame: number
        function animate() {
          const t = performance.now() / 1000; ctx.clearRect(0, 0, w, h)
          for (const d of dots) {
            if (t >= d.nextToggle) {
              if (d.targetOpacity <= C.baseAlpha + 0.005) {
                d.targetOpacity = C.litAlphaMin + Math.random() * (C.litAlphaMax - C.litAlphaMin)
                d.fadeSpeed = C.fadeInSpeed + Math.random() * C.fadeInSpeed
                d.nextToggle = t + C.onDurationMin + Math.random() * (C.onDurationMax - C.onDurationMin)
              } else {
                d.targetOpacity = C.baseAlpha
                d.fadeSpeed = C.fadeOutSpeed + Math.random() * C.fadeOutSpeed
                d.nextToggle = t + C.offDurationMin + Math.random() * (C.offDurationMax - C.offDurationMin)
              }
            }
            const diff = d.targetOpacity - d.opacity, step = d.fadeSpeed / 60
            d.opacity = Math.abs(diff) < step ? d.targetOpacity : d.opacity + Math.sign(diff) * step
            ctx.fillStyle = \`rgba(\${C.dotColor}, \${d.opacity})\`
            ctx.fillRect(d.x, d.y, C.dotSize, C.dotSize)
          }
          frame = requestAnimationFrame(animate)
        }
        frame = requestAnimationFrame(animate)
        return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', init) }
      }}
    />
  )
}

// Usage:
// <div style={{ position: 'relative', background: '${c.bgColor}', minHeight: '100vh' }}>
//   <FlickerGrid />
//   <div style={{ position: 'relative', zIndex: 10 }}>Your content</div>
// </div>`
}

// ==================== Main Page ====================

export default function FlickerGridPage() {
  const [config, setConfig] = useState<GridConfig>(DEFAULT)
  const [panelOpen, setPanelOpen] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [exportView, setExportView] = useState<'prompt' | 'code' | null>(null)

  const update = (key: keyof GridConfig, value: number | string) => setConfig(p => ({ ...p, [key]: value }))

  const randomize = () => {
    const bgHue = Math.floor(Math.random() * 360)
    const dotHues = [
      `${150 + Math.floor(Math.random() * 106)},${150 + Math.floor(Math.random() * 106)},${150 + Math.floor(Math.random() * 106)}`,
      '255,255,255',
      `${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},255`,
    ]
    setConfig({
      spacing: 6 + Math.floor(Math.random() * 18),
      dotSize: 0.8 + Math.random() * 2.2,
      baseAlpha: 0.005 + Math.random() * 0.02,
      litAlphaMin: 0.03 + Math.random() * 0.08,
      litAlphaMax: 0.1 + Math.random() * 0.3,
      fadeInSpeed: 0.2 + Math.random() * 1.5,
      fadeOutSpeed: 0.1 + Math.random() * 1,
      onDurationMin: 0.2 + Math.random() * 2,
      onDurationMax: 1 + Math.random() * 5,
      offDurationMin: 0.5 + Math.random() * 4,
      offDurationMax: 2 + Math.random() * 12,
      percentLit: 5 + Math.floor(Math.random() * 30),
      bgColor: `hsl(${bgHue}, ${20 + Math.floor(Math.random() * 30)}%, ${3 + Math.floor(Math.random() * 8)}%)`,
      dotColor: dotHues[Math.floor(Math.random() * dotHues.length)],
    })
  }

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="h-screen flex" style={{ backgroundColor: config.bgColor }}>
      {/* Canvas */}
      <div className="flex-1 relative">
        <FlickerCanvas config={config} />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <h1 className="text-6xl font-black text-white/[0.04] tracking-tighter">flickergrid</h1>
        </div>

        {/* Logo */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/90 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="3" height="3" rx="0.5" fill="white" opacity="0.9" />
              <rect x="5.5" y="1" width="3" height="3" rx="0.5" fill="white" opacity="0.3" />
              <rect x="10" y="1" width="3" height="3" rx="0.5" fill="white" opacity="0.7" />
              <rect x="1" y="5.5" width="3" height="3" rx="0.5" fill="white" opacity="0.4" />
              <rect x="5.5" y="5.5" width="3" height="3" rx="0.5" fill="white" opacity="0.8" />
              <rect x="10" y="5.5" width="3" height="3" rx="0.5" fill="white" opacity="0.2" />
              <rect x="1" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.6" />
              <rect x="5.5" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.15" />
              <rect x="10" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.5" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white/50">flickergrid</span>
        </div>

        {/* Top right */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
          {!panelOpen && (
            <button onClick={() => setPanelOpen(true)}
              className="px-4 py-2 text-xs font-medium text-white/70 bg-white/[0.06] backdrop-blur-md border border-white/[0.1] rounded-full hover:bg-white/[0.12] hover:text-white transition-all shadow-lg">
              Open Controls
            </button>
          )}
          <a href="https://github.com/adigold/flickergrid" target="_blank" rel="noopener noreferrer"
            className="p-2.5 text-white/30 hover:text-white/70 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-full hover:bg-white/[0.1] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>

        {/* Bottom */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <p className="text-[11px] text-white/15">
            Free & open source by{' '}
            <a href="https://adigoldstein.com" target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-white/50 transition-colors underline underline-offset-2 decoration-white/10">
              Adi Goldstein
            </a>
          </p>
        </div>
      </div>

      {/* Panel */}
      {panelOpen && (
        <div className="w-[340px] flex flex-col flex-shrink-0 p-3 pl-3">
        <div className="flex-1 bg-[#0c0c18]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-7 h-14 border-b border-white/[0.06] flex-shrink-0">
            <span className="text-xs font-semibold text-white/70">Controls</span>
            <div className="flex items-center gap-1">
              <button onClick={randomize} title="Randomize"
                className="p-2 text-white/25 hover:text-white/70 rounded-lg hover:bg-white/[0.06] transition-all" >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              </button>
              <button onClick={() => setConfig(DEFAULT)} title="Reset"
                className="p-2 text-white/25 hover:text-white/70 rounded-lg hover:bg-white/[0.06] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
              </button>
              <button onClick={() => setPanelOpen(false)} title="Close"
                className="p-2 text-white/25 hover:text-white/70 rounded-lg hover:bg-white/[0.06] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="px-7 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => setConfig(p.config)}
                  className="group flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all active:scale-[0.97]">
                  <span className="text-base leading-none">{p.emoji}</span>
                  <span className="text-[10px] text-white/30 group-hover:text-white/70 transition-colors font-medium leading-none">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-7 py-5 space-y-6">
              <Group title="Grid">
                <Slider label="Spacing" value={config.spacing} min={4} max={30} step={1} onChange={v => update('spacing', v)} unit="px" />
                <Slider label="Size" value={config.dotSize} min={0.5} max={4} step={0.1} onChange={v => update('dotSize', v)} unit="px" />
                <Slider label="Lit %" value={config.percentLit} min={0} max={50} step={1} onChange={v => update('percentLit', v)} unit="%" />
              </Group>

              <Group title="Opacity">
                <Slider label="Base" value={config.baseAlpha} min={0} max={0.1} step={0.002} onChange={v => update('baseAlpha', v)} />
                <Slider label="Min" value={config.litAlphaMin} min={0.01} max={0.3} step={0.005} onChange={v => update('litAlphaMin', v)} />
                <Slider label="Max" value={config.litAlphaMax} min={0.05} max={0.6} step={0.01} onChange={v => update('litAlphaMax', v)} />
              </Group>

              <Group title="Fade">
                <Slider label="In" value={config.fadeInSpeed} min={0.1} max={3} step={0.05} onChange={v => update('fadeInSpeed', v)} unit="s" />
                <Slider label="Out" value={config.fadeOutSpeed} min={0.1} max={3} step={0.05} onChange={v => update('fadeOutSpeed', v)} unit="s" />
              </Group>

              <Group title="Duration">
                <Slider label="On ↓" value={config.onDurationMin} min={0.1} max={5} step={0.1} onChange={v => update('onDurationMin', v)} unit="s" />
                <Slider label="On ↑" value={config.onDurationMax} min={0.5} max={10} step={0.1} onChange={v => update('onDurationMax', v)} unit="s" />
                <Slider label="Off ↓" value={config.offDurationMin} min={0.1} max={10} step={0.1} onChange={v => update('offDurationMin', v)} unit="s" />
                <Slider label="Off ↑" value={config.offDurationMax} min={1} max={20} step={0.5} onChange={v => update('offDurationMax', v)} unit="s" />
              </Group>

              <Group title="Colors">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-[11px] text-white/30 w-10">BG</span>
                  <div className="flex items-center gap-3 flex-1">
                    <input type="color" value={config.bgColor} onChange={e => update('bgColor', e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/[0.1]" />
                    <span className="text-[11px] text-white/25 font-mono">{config.bgColor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-[11px] text-white/30 w-10">Dots</span>
                  <input type="text" value={config.dotColor} onChange={e => update('dotColor', e.target.value)}
                    placeholder="R,G,B"
                    className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-white/60 font-mono focus:outline-none focus:border-indigo-500/30 focus:bg-white/[0.06] transition-all" />
                </div>
              </Group>
              {/* Buttons */}
              <div className="mt-10 mb-4 space-y-4">
                <button onClick={randomize}
                  className="group w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-[13px] font-semibold hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.15] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-500"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                  Randomize
                </button>
                <div className="flex gap-2.5">
                  <button onClick={() => setExportView('prompt')}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 text-white text-[13px] font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:brightness-110 transition-all active:scale-[0.97]">
                    <span className="flex items-center justify-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      Prompt
                    </span>
                  </button>
                  <button onClick={() => setExportView('code')}
                    className="flex-1 h-12 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/60 text-[13px] font-bold hover:bg-white/[0.1] hover:text-white hover:border-white/[0.18] transition-all active:scale-[0.97]">
                    <span className="flex items-center justify-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                      Code
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Export Modal */}
      {exportView && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setExportView(null)}>
          <div className="bg-[#0e0e20] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${exportView === 'prompt' ? 'bg-indigo-600/20' : 'bg-white/[0.06]'}`}>
                  {exportView === 'prompt' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{exportView === 'prompt' ? 'AI Prompt' : 'React Component'}</h3>
                  <p className="text-[11px] text-white/30">
                    {exportView === 'prompt' ? 'Paste into Claude, Cursor, ChatGPT, or any AI agent' : 'Drop this component into your React project'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyText(exportView === 'prompt' ? generatePrompt(config) : generateCode(config), exportView)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${
                    copied === exportView
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                  }`}>
                  {copied === exportView ? '✓ Copied!' : 'Copy'}
                </button>
                <button onClick={() => setExportView(null)}
                  className="p-2 text-white/20 hover:text-white/60 rounded-lg hover:bg-white/[0.06] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-1">
              <pre className="p-5 text-[12px] leading-[1.7] text-white/50 font-mono whitespace-pre-wrap selection:bg-indigo-600/30">
                {exportView === 'prompt' ? generatePrompt(config) : generateCode(config)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== UI ====================

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <span className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em] block">{title}</span>
      <div className="space-y-3 pl-0.5">
        {children}
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange, unit }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/30 w-10 flex-shrink-0 font-medium">{label}</span>
      <div className="flex-1 relative">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0.45) ${pct}%, rgba(255,255,255,0.06) ${pct}%, rgba(255,255,255,0.06) 100%)`,
            borderRadius: '100px',
          }}
        />
      </div>
      <span className="text-[10px] text-white/35 font-mono w-14 text-right tabular-nums">
        {value % 1 === 0 ? value : value.toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1)}{unit || ''}
      </span>
    </div>
  )
}

// ==================== Canvas ====================

function FlickerCanvas({ config }: { config: GridConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const dotsRef = useRef<any[]>([])
  const configRef = useRef(config)
  configRef.current = config

  const initDots = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.offsetWidth, h = canvas.offsetHeight
    const cfg = configRef.current
    const cols = Math.ceil(w / cfg.spacing) + 1, rows = Math.ceil(h / cfg.spacing) + 1
    const now = performance.now() / 1000
    const dots: any[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = Math.random() * 100 < cfg.percentLit
        dots.push({
          x: c * cfg.spacing, y: r * cfg.spacing,
          opacity: on ? cfg.litAlphaMin + Math.random() * (cfg.litAlphaMax - cfg.litAlphaMin) : cfg.baseAlpha,
          targetOpacity: on ? cfg.litAlphaMin + Math.random() * (cfg.litAlphaMax - cfg.litAlphaMin) : cfg.baseAlpha,
          fadeSpeed: cfg.fadeInSpeed + Math.random() * 0.5,
          nextToggle: now + 0.2 + Math.random() * 3,
        })
      }
    }
    dotsRef.current = dots
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0
    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); initDots()
    }
    resize(); window.addEventListener('resize', resize)
    const animate = () => {
      const t = performance.now() / 1000; const cfg = configRef.current
      ctx.clearRect(0, 0, w, h)
      for (const d of dotsRef.current) {
        if (t >= d.nextToggle) {
          if (d.targetOpacity <= cfg.baseAlpha + 0.005) {
            d.targetOpacity = cfg.litAlphaMin + Math.random() * (cfg.litAlphaMax - cfg.litAlphaMin)
            d.fadeSpeed = cfg.fadeInSpeed + Math.random() * cfg.fadeInSpeed
            d.nextToggle = t + cfg.onDurationMin + Math.random() * (cfg.onDurationMax - cfg.onDurationMin)
          } else {
            d.targetOpacity = cfg.baseAlpha
            d.fadeSpeed = cfg.fadeOutSpeed + Math.random() * cfg.fadeOutSpeed
            d.nextToggle = t + cfg.offDurationMin + Math.random() * (cfg.offDurationMax - cfg.offDurationMin)
          }
        }
        const diff = d.targetOpacity - d.opacity, step = d.fadeSpeed / 60
        d.opacity = Math.abs(diff) < step ? d.targetOpacity : d.opacity + Math.sign(diff) * step
        ctx.fillStyle = `rgba(${cfg.dotColor}, ${d.opacity})`
        ctx.fillRect(d.x, d.y, cfg.dotSize, cfg.dotSize)
      }
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('resize', resize) }
  }, [initDots])

  useEffect(() => { initDots() }, [config.spacing, config.percentLit, initDots])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
