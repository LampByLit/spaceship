import { useEffect, useRef, useState } from 'react'

interface RadialSliderProps {
  id: string
  label: string
}

export function RadialSlider({ id, label }: RadialSliderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const radius = 110
  const centerX = 150
  const centerY = 150

  const drawArc = (ctx: CanvasRenderingContext2D, angle: number) => {
    ctx.clearRect(0, 0, 300, 300)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(-Math.PI / 2) // Start from top
    ctx.strokeStyle = '#45bf68'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, (angle * Math.PI) / 180, false)
    ctx.stroke()
    ctx.restore()
  }

  const updateKnobPosition = (angle: number) => {
    if (!knobRef.current) return

    const knobRadius = 15
    const x = Math.round(radius * Math.cos((angle - 90) * Math.PI / 180)) + centerX - knobRadius
    const y = Math.round(radius * Math.sin((angle - 90) * Math.PI / 180)) + centerY - knobRadius

    knobRef.current.style.left = `${x}px`
    knobRef.current.style.top = `${y}px`
  }

  const getAngleFromMouse = (event: MouseEvent) => {
    if (!circleRef.current) return 0

    const rect = circleRef.current.getBoundingClientRect()
    const centerX_local = rect.left + rect.width / 2
    const centerY_local = rect.top + rect.height / 2

    const deltaX = event.clientX - centerX_local
    const deltaY = event.clientY - centerY_local

    let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
    angle = (angle + 360) % 360 // Ensure positive angle

    return angle
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true)
    const angle = getAngleFromMouse(event.nativeEvent)
    setValue(Math.round(angle))
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) return

    const angle = getAngleFromMouse(event)
    setValue(Math.round(angle))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        drawArc(ctx, value)
      }
    }
    updateKnobPosition(value)
  }, [value])

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => handleMouseMove(event)
    const handleGlobalMouseUp = () => handleMouseUp()

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  return (
    <figure className="radial-slider">
      <span className="value">{value}°</span>
      <div
        ref={circleRef}
        className="circle"
        onMouseDown={handleMouseDown}
      >
        <div
          ref={knobRef}
          className="knob"
          unselectable="on"
        ></div>
      </div>
      <canvas
        ref={canvasRef}
        className="progress"
        width="300"
        height="300"
      ></canvas>
      <div className="inner-circle"></div>
    </figure>
  )
}