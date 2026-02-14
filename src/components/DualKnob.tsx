import { useState, useRef, useCallback, useEffect } from 'react'

interface DualKnobProps {
  id: string
  labelA: string
  labelB: string
  size?: number
}

export function DualKnob({ id, labelA, labelB, size = 0.9 }: DualKnobProps) {
  const [knobValue, setKnobValue] = useState(45)
  const [contrast, setContrast] = useState(40)
  const [brightness, setBrightness] = useState(70)
  const contrastProgressRef = useRef<SVGPathElement>(null)
  const brightnessProgressRef = useRef<SVGPathElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const deg2rad = (angle: number) => (angle * Math.PI) / 180
  const rad2deg = (angle: number) => (angle * 180) / Math.PI

  const getPointAtAngleFrom = useCallback((origin: { x: number; y: number }, angle: number, distance: number) => {
    const a = deg2rad(angle)
    return {
      x: origin.x + Math.cos(a) * distance,
      y: origin.y + Math.sin(a) * distance,
    }
  }, [])

  const angleBetween = useCallback((origin: { x: number; y: number }, target: { x: number; y: number }) => {
    const dy = target.y - origin.y
    const dx = target.x - origin.x
    return rad2deg(Math.atan2(dy, dx))
  }, [])

  const setContrastState = useCallback(
    (value: number) => {
      const v = Math.max(0, Math.min(100, value))
      setContrast(v)
      const path = contrastProgressRef.current
      if (path) {
        const totalLength = path.getTotalLength()
        path.style.strokeDashoffset = String(totalLength - (totalLength * v) / 100)
      }
    },
    []
  )

  const setBrightnessState = useCallback(
    (value: number) => {
      const v = Math.max(0, Math.min(100, value))
      setBrightness(v)
      const path = brightnessProgressRef.current
      if (path) {
        const totalLength = path.getTotalLength()
        path.style.strokeDashoffset = String(totalLength - (totalLength * v) / 100)
      }
    },
    []
  )

  const handleInteract = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const target = { x: e.clientX, y: e.clientY }
      let angle = (angleBetween(origin, target) + 90) % 360
      if (angle < 0) angle += 360
      if (angle > 3 && angle < 177) {
        const c = ((angle - 3) / 174) * 100
        setContrastState(c)
      } else if (angle > 183 && angle < 357) {
        const b = 100 - ((angle - 183) / 174) * 100
        setBrightnessState(b)
      }
    },
    [angleBetween, setContrastState, setBrightnessState]
  )

  const handleKnobMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const onMove = (ev: MouseEvent) => handleInteract(ev)
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    handleInteract(e)
  }, [handleInteract])

  useEffect(() => {
    setContrastState(40)
    setBrightnessState(70)
  }, [id, setContrastState, setBrightnessState])

  return (
    <div ref={containerRef} className="dual-knob-station">
      <span className="control-label dual-label">{labelA} / {labelB}</span>
      <div className="knob" onMouseDown={handleKnobMouseDown}>
        <div className="knob-outer">
          <div className="knob-inner">
            <div className="knob-arrow up" onClick={(e) => { e.stopPropagation(); setKnobValue((v) => Math.min(100, v + 1)) }} />
            <div className="knob-value">{knobValue}</div>
            <div className="knob-arrow down" onClick={(e) => { e.stopPropagation(); setKnobValue((v) => Math.max(0, v - 1)) }} />
            <div className="knob-value-progress" style={{ height: `${knobValue}%` }} />
            <div
              className="knob-indicator contrast"
              style={{
                transform: `translate(${getPointAtAngleFrom({ x: 0, y: 0 }, (174 * contrast) / 100 + 93, 142).x}px, ${getPointAtAngleFrom({ x: 0, y: 0 }, (174 * contrast) / 100 + 93, 142).y}px)`,
              }}
            />
            <div
              className="knob-indicator brightness"
              style={{
                transform: `translate(${getPointAtAngleFrom({ x: 0, y: 0 }, 174 - ((174 * brightness) / 100 + 87), 142).x}px, ${getPointAtAngleFrom({ x: 0, y: 0 }, 174 - ((174 * brightness) / 100 + 87), 142).y}px)`,
              }}
            />
            <span className="progress-label contrast">{labelA}</span>
            <span className="progress-label brightness">{labelB}</span>
          </div>
        </div>
        <svg className="progress-bars" width="500" height="500">
          <path d="M 240 445 A 190 195 0 1 1 240 55" fill="transparent" stroke="#2a2d30" strokeWidth="16" strokeLinecap="round" />
          <path
            ref={contrastProgressRef}
            d="M 240 445 A 190 195 0 1 1 240 55"
            fill="transparent"
            stroke="#45bf68"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="605 605"
          />
          <path d="M 260 445 A 190 195 0 1 0 260 55" fill="transparent" stroke="#2a2d30" strokeWidth="16" strokeLinecap="round" />
          <path
            ref={brightnessProgressRef}
            d="M 260 445 A 190 195 0 1 0 260 55"
            fill="transparent"
            stroke="#45bf68"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="605 605"
          />
        </svg>
      </div>
    </div>
  )
}
