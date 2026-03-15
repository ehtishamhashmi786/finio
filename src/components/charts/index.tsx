import { fmt } from '@/utils'
import { CATEGORIES } from '@/lib/constants'

// ─── Bar Chart ────────────────────────────────────────────────────────────────
interface BarChartProps {
  data: { label: string; value: number; isHighlight?: boolean }[]
  height?: number
}
export function BarChart({ data, height = 110 }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const h = Math.max((d.value / max) * (height - 10), d.value > 0 ? 4 : 0)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
              {d.value > 0 && (
                <div
                  className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1
                             rounded-md text-[10px] whitespace-nowrap z-10 opacity-0
                             group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {fmt(d.value)}
                </div>
              )}
              <div
                className="w-full rounded-t-[4px] rounded-b-[2px] transition-all duration-700 cursor-pointer"
                style={{
                  height: h,
                  background: d.isHighlight ? '#6c63ff' : 'rgba(108,99,255,0.35)',
                  minHeight: d.value > 0 ? 4 : 0,
                  transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px]"
               style={{ color: 'var(--text-muted)' }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
interface DonutChartProps {
  data: Record<string, number>
  size?: number
}
export function DonutChart({ data, size = 120 }: DonutChartProps) {
  const entries = Object.entries(data).filter(([, v]) => v > 0)
  if (!entries.length) return null

  const total = entries.reduce((s, [, v]) => s + v, 0)
  const r = 40, cx = 60, cy = 60
  let angle = 0
  const paths: JSX.Element[] = []
  const legend: JSX.Element[] = []

  entries.forEach(([cat, amt], i) => {
    const slice = (amt / total) * 2 * Math.PI
    const x1 = cx + r * Math.sin(angle)
    const y1 = cy - r * Math.cos(angle)
    angle += slice
    const x2 = cx + r * Math.sin(angle)
    const y2 = cy - r * Math.cos(angle)
    const large = slice > Math.PI ? 1 : 0
    const c = CATEGORIES[cat as keyof typeof CATEGORIES] ?? CATEGORIES.Other

    paths.push(
      <path
        key={cat}
        d={`M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
        fill={c.color}
        opacity={0.85}
      />
    )

    if (i < 5) {
      legend.push(
        <div key={cat} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
          <span className="flex-1">{cat}</span>
          <span className="font-medium ml-auto" style={{ color: 'var(--text-primary)' }}>
            {fmt(amt)}
          </span>
        </div>
      )
    }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 120 120" className="flex-shrink-0">
        <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(128,128,128,0.1)" strokeWidth="20" />
        {paths}
        <circle cx="60" cy="60" r="28" fill="var(--bg-secondary)" />
        <text
          x="60" y="64"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="11"
          fontFamily="Syne,sans-serif"
          fontWeight="700"
        >
          {fmt(total)}
        </text>
      </svg>
      <div className="flex flex-col gap-2.5 flex-1">{legend}</div>
    </div>
  )
}

// ─── Category Bars ────────────────────────────────────────────────────────────
interface CategoryBarsProps {
  data: Record<string, number>
  showShare?: boolean
}
export function CategoryBars({ data, showShare = false }: CategoryBarsProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = entries.length ? entries[0][1] : 1
  const total = entries.reduce((s, [, v]) => s + v, 0)

  return (
    <div className="flex flex-col gap-3.5">
      {entries.map(([cat, amt]) => {
        const c = CATEGORIES[cat as keyof typeof CATEGORIES] ?? CATEGORIES.Other
        const pct = Math.round((amt / max) * 100)
        const share = total > 0 ? Math.round((amt / total) * 100) : 0

        return (
          <div key={cat}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[13px] flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                {c.icon} {cat}
              </span>
              <div className="flex items-center gap-3">
                {showShare && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{share}%</span>
                )}
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {fmt(amt)}
                </span>
              </div>
            </div>
            <div className="bar-track" style={{ height: 6 }}>
              <div
                className="bar-fill"
                style={{ width: `${pct}%`, background: c.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Forecast Chart ───────────────────────────────────────────────────────────
interface ForecastChartProps {
  actual: { day: number; value: number | null }[]
  forecastValue: number
  height?: number
}
export function ForecastChart({ actual, forecastValue, height = 140 }: ForecastChartProps) {
  const allVals = actual.map(d => d.value ?? 0).concat([forecastValue])
  const max = Math.max(...allVals, 1)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {actual.map((d, i) => {
          const val = d.value
          if (val !== null) {
            const h = Math.max((val / max) * (height - 10), val > 0 ? 3 : 0)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                {val > 0 && (
                  <div
                    className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1
                               rounded text-[10px] whitespace-nowrap z-10 opacity-0
                               group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {fmt(val)}
                  </div>
                )}
                <div
                  className="w-full rounded-t-[3px] rounded-b-[2px]"
                  style={{
                    height: h,
                    background: '#6c63ff',
                    minHeight: val > 0 ? 3 : 0,
                    transition: 'height 0.9s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
            )
          } else {
            const h = Math.max((forecastValue / max) * (height - 10), 3)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1
                             rounded text-[10px] whitespace-nowrap z-10 opacity-0
                             group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#00c9b1' }}
                >
                  ~{fmt(forecastValue)}
                </div>
                <div
                  className="w-full rounded-t-[3px] rounded-b-[2px]"
                  style={{
                    height: h,
                    background: 'rgba(0,201,177,0.25)',
                    border: '1px dashed rgba(0,201,177,0.5)',
                    transition: 'height 0.9s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
            )
          }
        })}
      </div>
      <div className="flex gap-[3px]">
        {actual.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[9px]"
               style={{ color: d.value === null ? '#00c9b1' : 'var(--text-muted)' }}>
            {i % 5 === 0 ? d.day : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
