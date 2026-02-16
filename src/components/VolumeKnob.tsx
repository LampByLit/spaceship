import { useRef, useEffect, useCallback } from 'react'
import { useGameState } from '../contexts/GameStateContext'

const DEG_RANGE = 135
const STEP = 32

interface VolumeKnobProps {
  id: string
  label: string
  size?: number
}

export function VolumeKnob({ id, label, size = 120 }: VolumeKnobProps) {
  const { state, dispatch } = useGameState()
  const containerRef = useRef<HTMLDivElement>(null)
  const value = state.controls[id as keyof typeof state.controls] as number
  const gradateRef = useRef<SVGGElement>(null)
  const sliderRef = useRef<SVGCircleElement>(null)
  const sliderShadowRef = useRef<SVGCircleElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const withoutAnimateRef = useRef(false)

  const setValueState = useCallback((v: number) => {
    // Update visual elements based on the angle value
    if (sliderRef.current) sliderRef.current.style.setProperty('--deg', `${v}deg`)
    if (sliderShadowRef.current) sliderShadowRef.current.style.setProperty('--deg', `${v}deg`)
    if (sliderRef.current) sliderRef.current.style.setProperty('--h', `${v * 1 + DEG_RANGE * 2}`)
    if (gradateRef.current) {
      gradateRef.current.querySelectorAll('line').forEach((l) => {
        l.classList.toggle('active', parseFloat(l.dataset.deg ?? '0') <= v)
      })
    }
  }, [])

  const setByCoords = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const CX = rect.width / 2
    const CY = rect.height / 2
    const x = clientX - rect.left
    const y = clientY - rect.top
    const dx = x - CX
    const dy = y - CY
    const r = Math.atan2(dy, dx)  // atan2(deltaY, deltaX) for correct angle
    let res = Math.round((r * 180) / Math.PI) + 90
    let val = res <= 180 ? res : res - 360
    val = Math.max(-DEG_RANGE, Math.min(DEG_RANGE, val))

    // Store the angle directly in the global state (not percentage)
    // This keeps the visual rotation and stored value in sync
    dispatch({ type: 'SET_CONTROL_VALUE', controlId: id as any, value: val })
  }, [dispatch, id])

  useEffect(() => {
    const gradateGroup = gradateRef.current
    if (!gradateGroup) return
    const Q = DEG_RANGE / STEP
    let html = ''
    for (let i = -DEG_RANGE; i <= DEG_RANGE; i += Q) {
      html += `<line data-deg="${i}" style="--deg: ${i}deg; --h: ${i + DEG_RANGE * 2}" x1="300" y1="30" x2="300" y2="70" />`
    }
    gradateGroup.innerHTML = html
  }, [])

  // Sync visual state with stored value whenever it changes
  useEffect(() => {
    setValueState(value)
  }, [value, setValueState])

  // Set up slider event handlers
  useEffect(() => {
    const sliderShadow = sliderShadowRef.current
    if (!sliderShadow) return

    const handleSliderMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      withoutAnimateRef.current = true
      containerRef.current?.classList.add('without-animate')
      const onMove = (ev: MouseEvent) => setByCoords(ev.clientX, ev.clientY)
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        containerRef.current?.classList.remove('without-animate')
        withoutAnimateRef.current = false
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      withoutAnimateRef.current = true
      containerRef.current?.classList.add('without-animate')
      const onTouchMove = (ev: TouchEvent) => {
        const touch = ev.touches[0]
        setByCoords(touch.pageX, touch.pageY)
      }
      const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove as any)
        document.removeEventListener('touchend', onTouchEnd)
        containerRef.current?.classList.remove('without-animate')
        withoutAnimateRef.current = false
      }
      document.addEventListener('touchmove', onTouchMove as any)
      document.addEventListener('touchend', onTouchEnd)
    }

    sliderShadow.addEventListener('mousedown', handleSliderMouseDown)
    sliderShadow.addEventListener('touchstart', handleTouchStart)

    return () => {
      sliderShadow.removeEventListener('mousedown', handleSliderMouseDown)
      sliderShadow.removeEventListener('touchstart', handleTouchStart)
    }
  }, [setByCoords])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    withoutAnimateRef.current = true
    containerRef.current?.classList.add('without-animate')
    const onMove = (ev: MouseEvent) => setByCoords(ev.clientX, ev.clientY)
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      containerRef.current?.classList.remove('without-animate')
      withoutAnimateRef.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    setByCoords(e.clientX, e.clientY) // Set initial position
  }

  // Handle both knob clicks and slider drags
  const handleKnobClick = (e: React.MouseEvent) => {
    setByCoords(e.clientX, e.clientY)
  }


  return (
    <div className="volume-knob-station" style={{ width: size, height: size }}>
      <span className="control-label">{label}</span>
      <div
        ref={containerRef}
        className="volume-button-knob"
        onClick={handleKnobClick}
        style={{ width: size, height: size, ['--shadow-filter' as string]: `url(#shadow-${id})`, ['--inset-filter' as string]: `url(#inset-shadow-${id})` }}
      >
        <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={`radial-${id}`} cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#202528" />
              <stop offset="0.849" stopColor="#272c2f" />
              <stop offset="0.866" stopColor="#6a6d6f" />
              <stop offset="0.87" stopColor="#202528" />
              <stop offset="0.879" stopColor="#6a6d6f" />
              <stop offset="0.908" stopColor="#202528" />
              <stop offset="1" stopColor="#6a6d6f" />
            </radialGradient>
            <filter id={`shadow-${id}`} filterUnits="userSpaceOnUse">
              <feOffset in="SourceAlpha" />
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feFlood result="color" />
              <feComposite operator="in" in="blur" />
              <feComposite in="SourceGraphic" />
            </filter>
            <filter id={`inset-shadow-${id}`}>
              <feOffset in="SourceAlpha" />
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood result="color" />
              <feComposite operator="out" in="SourceGraphic" in2="blur" />
              <feComposite operator="in" in="color" />
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>
          </defs>
          <circle className="circle" cx="300" cy="300" r="200" />
          <g ref={gradateRef} className="gradate" />
          <circle ref={sliderRef} id={`slider-${id}`} className="slider" cx="300" cy="130" r="10" />
          <g className="slider-wrap">
            <circle ref={sliderShadowRef} id={`slider-shadow-${id}`} className="slider" cx="300" cy="130" r="10" />
          </g>
        </svg>
      </div>
    </div>
  )
}
