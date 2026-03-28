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

const PRESETS: { name: string; config: GridConfig }[] = [
  {
    name: 'Subtle Night',
    config: {
      spacing: 10, dotSize: 1.5, baseAlpha: 0.01, litAlphaMin: 0.04, litAlphaMax: 0.16,
      fadeInSpeed: 0.5, fadeOutSpeed: 0.3, onDurationMin: 0.8, onDurationMax: 2.5,
      offDurationMin: 1.5, offDurationMax: 5, percentLit: 15, bgColor: '#0a0a1a', dotColor: '255,255,255',
    },
  },
  {
    name: 'Starfield',
    config: {
      spacing: 8, dotSize: 1, baseAlpha: 0.005, litAlphaMin: 0.03, litAlphaMax: 0.25,
      fadeInSpeed: 0.3, fadeOutSpeed: 0.15, onDurationMin: 1, onDurationMax: 4,
      offDurationMin: 2, offDurationMax: 8, percentLit: 10, bgColor: '#050510', dotColor: '200,210,255',
    },
  },
  {
    name: 'Matrix Rain',
    config: {
      spacing: 12, dotSize: 2, baseAlpha: 0.008, litAlphaMin: 0.05, litAlphaMax: 0.3,
      fadeInSpeed: 1.5, fadeOutSpeed: 0.8, onDurationMin: 0.2, onDurationMax: 0.8,
      offDurationMin: 0.5, offDurationMax: 3, percentLit: 20, bgColor: '#0a0f0a', dotColor: '0,255,100',
    },
  },
  {
    name: 'Warm Ember',
    config: {
      spacing: 10, dotSize: 1.5, baseAlpha: 0.01, litAlphaMin: 0.04, litAlphaMax: 0.2,
      fadeInSpeed: 0.4, fadeOutSpeed: 0.2, onDurationMin: 1, onDurationMax: 3,
      offDurationMin: 2, offDurationMax: 6, percentLit: 12, bgColor: '#1a0a0a', dotColor: '255,140,50',
    },
  },
  {
    name: 'Neon Pulse',
    config: {
      spacing: 8, dotSize: 1.5, baseAlpha: 0.01, litAlphaMin: 0.06, litAlphaMax: 0.35,
      fadeInSpeed: 1.2, fadeOutSpeed: 0.6, onDurationMin: 0.3, onDurationMax: 1.2,
      offDurationMin: 0.5, offDurationMax: 2.5, percentLit: 25, bgColor: '#0a0515', dotColor: '180,80,255',
    },
  },
  {
    name: 'Deep Ocean',
    config: {
      spacing: 14, dotSize: 1, baseAlpha: 0.008, litAlphaMin: 0.03, litAlphaMax: 0.12,
      fadeInSpeed: 0.2, fadeOutSpeed: 0.1, onDurationMin: 2, onDurationMax: 6,
      offDurationMin: 3, offDurationMax: 10, percentLit: 8, bgColor: '#040a14', dotColor: '80,180,255',
    },
  },
]

const DEFAULT = PRESETS[0].config

// ==================== Prompt Generator ====================

function generatePrompt(config: GridConfig): string {
  return `Create an animated flickering dot grid background using HTML Canvas. The background should have these exact specifications:

VISUAL STYLE:
- A grid of tiny squares (${config.dotSize}px) spaced ${config.spacing}px apart
- Background color: ${config.bgColor}
- Dot color: rgba(${config.dotColor}, alpha)
- Most dots are very dim (base opacity: ${config.baseAlpha})
- About ${config.percentLit}% of dots are initially lit up

ANIMATION BEHAVIOR:
- Each dot independently and randomly turns ON and OFF with smooth fade transitions
- When turning ON: fade to opacity between ${config.litAlphaMin} and ${config.litAlphaMax}, fade duration ${config.fadeInSpeed}–${config.fadeInSpeed * 2}s
- Stay lit for ${config.onDurationMin}–${config.onDurationMax}s before fading off
- When turning OFF: fade back to base opacity (${config.baseAlpha}), fade duration ${config.fadeOutSpeed}–${config.fadeOutSpeed * 2}s
- Stay dim for ${config.offDurationMin}–${config.offDurationMax}s before possibly lighting up again
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

// ==================== Code Generator ====================

function generateCode(config: GridConfig): string {
  return `// FlickerGrid — Animated Dot Grid Background
// Generated at flickergrid.dev

export function FlickerGrid({
  className = '',
  style = {},
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <canvas
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
      ref={(canvas) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const CONFIG = ${JSON.stringify({
          spacing: config.spacing,
          dotSize: config.dotSize,
          baseAlpha: config.baseAlpha,
          litAlphaMin: config.litAlphaMin,
          litAlphaMax: config.litAlphaMax,
          fadeInSpeed: config.fadeInSpeed,
          fadeOutSpeed: config.fadeOutSpeed,
          onDurationMin: config.onDurationMin,
          onDurationMax: config.onDurationMax,
          offDurationMin: config.offDurationMin,
          offDurationMax: config.offDurationMax,
          percentLit: config.percentLit,
          dotColor: config.dotColor,
        }, null, 10).replace(/\n          /g, '\n        ')}

        const dpr = window.devicePixelRatio || 1
        let w = 0, h = 0

        interface Dot {
          x: number; y: number; opacity: number
          targetOpacity: number; fadeSpeed: number; nextToggle: number
        }

        let dots: Dot[] = []

        function initDots() {
          w = canvas.offsetWidth
          h = canvas.offsetHeight
          canvas.width = w * dpr
          canvas.height = h * dpr
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

          const cols = Math.ceil(w / CONFIG.spacing) + 1
          const rows = Math.ceil(h / CONFIG.spacing) + 1
          const now = performance.now() / 1000
          dots = []

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const isOn = Math.random() * 100 < CONFIG.percentLit
              dots.push({
                x: c * CONFIG.spacing,
                y: r * CONFIG.spacing,
                opacity: isOn ? CONFIG.litAlphaMin + Math.random() * (CONFIG.litAlphaMax - CONFIG.litAlphaMin) : CONFIG.baseAlpha,
                targetOpacity: isOn ? CONFIG.litAlphaMin + Math.random() * (CONFIG.litAlphaMax - CONFIG.litAlphaMin) : CONFIG.baseAlpha,
                fadeSpeed: CONFIG.fadeInSpeed + Math.random() * 0.5,
                nextToggle: now + Math.random() * 3,
              })
            }
          }
        }

        initDots()
        window.addEventListener('resize', initDots)

        let frame: number
        function animate() {
          const t = performance.now() / 1000
          ctx.clearRect(0, 0, w, h)

          for (const dot of dots) {
            if (t >= dot.nextToggle) {
              const turningOn = dot.targetOpacity <= CONFIG.baseAlpha + 0.005
              if (turningOn) {
                dot.targetOpacity = CONFIG.litAlphaMin + Math.random() * (CONFIG.litAlphaMax - CONFIG.litAlphaMin)
                dot.fadeSpeed = CONFIG.fadeInSpeed + Math.random() * CONFIG.fadeInSpeed
                dot.nextToggle = t + CONFIG.onDurationMin + Math.random() * (CONFIG.onDurationMax - CONFIG.onDurationMin)
              } else {
                dot.targetOpacity = CONFIG.baseAlpha
                dot.fadeSpeed = CONFIG.fadeOutSpeed + Math.random() * CONFIG.fadeOutSpeed
                dot.nextToggle = t + CONFIG.offDurationMin + Math.random() * (CONFIG.offDurationMax - CONFIG.offDurationMin)
              }
            }

            const diff = dot.targetOpacity - dot.opacity
            const step = dot.fadeSpeed * (1 / 60)
            dot.opacity = Math.abs(diff) < step ? dot.targetOpacity : dot.opacity + Math.sign(diff) * step

            ctx.fillStyle = \`rgba(\${CONFIG.dotColor}, \${dot.opacity})\`
            ctx.fillRect(dot.x, dot.y, CONFIG.dotSize, CONFIG.dotSize)
          }

          frame = requestAnimationFrame(animate)
        }
        frame = requestAnimationFrame(animate)

        return () => {
          cancelAnimationFrame(frame)
          window.removeEventListener('resize', initDots)
        }
      }}
    />
  )
}

// Usage:
// <div style={{ position: 'relative', background: '${config.bgColor}', minHeight: '100vh' }}>
//   <FlickerGrid />
//   <div style={{ position: 'relative', zIndex: 10 }}>Your content here</div>
// </div>`
}

// ==================== Main Page ====================

export default function FlickerGridPage() {
  const [config, setConfig] = useState<GridConfig>(DEFAULT)
  const [panelOpen, setPanelOpen] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [exportView, setExportView] = useState<'prompt' | 'code' | null>(null)

  const update = (key: keyof GridConfig, value: number | string) => {
    setConfig(p => ({ ...p, [key]: value }))
  }

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="h-screen flex" style={{ backgroundColor: config.bgColor }}>
      {/* Canvas Preview */}
      <div className="flex-1 relative">
        <FlickerCanvas config={config} />

        {/* Center branding */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white/[0.07] tracking-tight select-none">flickergrid</h1>
          </div>
        </div>

        {/* Top-left logo */}
        <div className="absolute top-5 left-5 z-20">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
            <span className="text-sm font-semibold text-white/60 group-hover:text-white/90 transition-colors">flickergrid</span>
          </a>
        </div>

        {/* GitHub link */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
          {!panelOpen && (
            <button onClick={() => setPanelOpen(true)}
              className="px-3 py-2 text-xs font-medium text-white/60 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm">
              Open Controls
            </button>
          )}
          <a href="https://github.com/adigold/flickergrid" target="_blank" rel="noopener noreferrer"
            className="p-2 text-white/40 hover:text-white/80 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>

        {/* Bottom attribution */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <p className="text-[11px] text-white/20">
            Free & open source by <a href="https://adigoldstein.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">Adi Goldstein</a>
          </p>
        </div>
      </div>

      {/* Controls Panel */}
      {panelOpen && (
        <div className="w-80 bg-[#0d0d1a]/95 backdrop-blur-md border-l border-white/[0.06] overflow-y-auto flex flex-col flex-shrink-0">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <h2 className="text-xs font-bold text-white/80 uppercase tracking-wider">Controls</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfig(DEFAULT)} className="text-[10px] text-white/30 hover:text-white/70 px-2 py-1 bg-white/5 rounded transition-colors">
                Reset
              </button>
              <button onClick={() => setPanelOpen(false)} className="text-white/30 hover:text-white/70 p-1 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="p-4 border-b border-white/[0.06]">
            <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Presets</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => setConfig(p.config)}
                  className="px-2.5 py-2 text-[11px] text-white/50 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.12] transition-all text-left">
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <Section title="Grid">
              <Slider label="Spacing" value={config.spacing} min={4} max={30} step={1} onChange={v => update('spacing', v)} unit="px" />
              <Slider label="Dot Size" value={config.dotSize} min={0.5} max={4} step={0.1} onChange={v => update('dotSize', v)} unit="px" />
              <Slider label="% Lit" value={config.percentLit} min={0} max={50} step={1} onChange={v => update('percentLit', v)} unit="%" />
            </Section>

            <Section title="Opacity">
              <Slider label="Base" value={config.baseAlpha} min={0} max={0.1} step={0.002} onChange={v => update('baseAlpha', v)} />
              <Slider label="Lit Min" value={config.litAlphaMin} min={0.01} max={0.3} step={0.005} onChange={v => update('litAlphaMin', v)} />
              <Slider label="Lit Max" value={config.litAlphaMax} min={0.05} max={0.6} step={0.01} onChange={v => update('litAlphaMax', v)} />
            </Section>

            <Section title="Fade Speed">
              <Slider label="In" value={config.fadeInSpeed} min={0.1} max={3} step={0.05} onChange={v => update('fadeInSpeed', v)} unit="s" />
              <Slider label="Out" value={config.fadeOutSpeed} min={0.1} max={3} step={0.05} onChange={v => update('fadeOutSpeed', v)} unit="s" />
            </Section>

            <Section title="Duration">
              <Slider label="On Min" value={config.onDurationMin} min={0.1} max={5} step={0.1} onChange={v => update('onDurationMin', v)} unit="s" />
              <Slider label="On Max" value={config.onDurationMax} min={0.5} max={10} step={0.1} onChange={v => update('onDurationMax', v)} unit="s" />
              <Slider label="Off Min" value={config.offDurationMin} min={0.1} max={10} step={0.1} onChange={v => update('offDurationMin', v)} unit="s" />
              <Slider label="Off Max" value={config.offDurationMax} min={1} max={20} step={0.5} onChange={v => update('offDurationMax', v)} unit="s" />
            </Section>

            <Section title="Colors">
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-white/30 w-14">BG</label>
                <input type="color" value={config.bgColor} onChange={e => update('bgColor', e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" />
                <span className="text-[11px] text-white/20 font-mono">{config.bgColor}</span>
              </div>
              <div>
                <label className="text-[11px] text-white/30">Dot RGB</label>
                <input type="text" value={config.dotColor} onChange={e => update('dotColor', e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded text-xs text-white/70 font-mono focus:outline-none focus:border-indigo-500/50" />
              </div>
            </Section>
          </div>

          {/* Export Buttons */}
          <div className="p-4 border-t border-white/[0.06] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setExportView(exportView === 'prompt' ? null : 'prompt')}
                className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${exportView === 'prompt' ? 'bg-indigo-600 text-white' : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.08]'}`}>
                Prompt
              </button>
              <button onClick={() => setExportView(exportView === 'code' ? null : 'code')}
                className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${exportView === 'code' ? 'bg-indigo-600 text-white' : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.08]'}`}>
                Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setExportView(null)}>
          <div className="bg-[#111122] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white">{exportView === 'prompt' ? 'AI Prompt' : 'React Component'}</h3>
                <p className="text-[11px] text-white/30 mt-0.5">
                  {exportView === 'prompt' ? 'Paste this into any AI code agent (Claude, Cursor, ChatGPT, etc.)' : 'Drop this React component into your project'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyText(exportView === 'prompt' ? generatePrompt(config) : generateCode(config), exportView)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors">
                  {copied === exportView ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => setExportView(null)} className="p-1.5 text-white/30 hover:text-white/70 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <pre className="p-4 text-[12px] leading-relaxed text-white/60 font-mono whitespace-pre-wrap">
                {exportView === 'prompt' ? generatePrompt(config) : generateCode(config)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== UI Components ====================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange, unit }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-white/30 w-14 flex-shrink-0">{label}</label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1" />
      <span className="text-[11px] text-white/40 font-mono w-14 text-right">
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
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    const cfg = configRef.current
    const cols = Math.ceil(w / cfg.spacing) + 1
    const rows = Math.ceil(h / cfg.spacing) + 1
    const now = performance.now() / 1000
    const dots: any[] = []

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isOn = Math.random() * 100 < cfg.percentLit
        dots.push({
          x: c * cfg.spacing,
          y: r * cfg.spacing,
          opacity: isOn ? cfg.litAlphaMin + Math.random() * (cfg.litAlphaMax - cfg.litAlphaMin) : cfg.baseAlpha,
          targetOpacity: isOn ? cfg.litAlphaMin + Math.random() * (cfg.litAlphaMax - cfg.litAlphaMin) : cfg.baseAlpha,
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
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initDots()
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      const t = performance.now() / 1000
      const cfg = configRef.current
      ctx.clearRect(0, 0, w, h)

      for (const dot of dotsRef.current) {
        if (t >= dot.nextToggle) {
          const turningOn = dot.targetOpacity <= cfg.baseAlpha + 0.005
          if (turningOn) {
            dot.targetOpacity = cfg.litAlphaMin + Math.random() * (cfg.litAlphaMax - cfg.litAlphaMin)
            dot.fadeSpeed = cfg.fadeInSpeed + Math.random() * cfg.fadeInSpeed
            dot.nextToggle = t + cfg.onDurationMin + Math.random() * (cfg.onDurationMax - cfg.onDurationMin)
          } else {
            dot.targetOpacity = cfg.baseAlpha
            dot.fadeSpeed = cfg.fadeOutSpeed + Math.random() * cfg.fadeOutSpeed
            dot.nextToggle = t + cfg.offDurationMin + Math.random() * (cfg.offDurationMax - cfg.offDurationMin)
          }
        }

        const diff = dot.targetOpacity - dot.opacity
        const step = dot.fadeSpeed * (1 / 60)
        dot.opacity = Math.abs(diff) < step ? dot.targetOpacity : dot.opacity + Math.sign(diff) * step

        ctx.fillStyle = `rgba(${cfg.dotColor}, ${dot.opacity})`
        ctx.fillRect(dot.x, dot.y, cfg.dotSize, cfg.dotSize)
      }

      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [initDots])

  useEffect(() => { initDots() }, [config.spacing, config.percentLit, initDots])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
