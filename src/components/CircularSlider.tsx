import { useState, useEffect } from 'react'

interface CircularSliderProps {
  id: string
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  size?: number
}

export function CircularSlider({
  id,
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  size = 140
}: CircularSliderProps) {
  const [displayValue, setDisplayValue] = useState(value)

  // Update display value when prop changes
  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  // Handle slider input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    setDisplayValue(newValue)
    onChange(newValue)
  }

  // Calculate color based on value (cold to hot transition)
  const getColorFromValue = (val: number) => {
    const normalizedValue = (val - min) / (max - min)
    // Cold colors: blue/cyan (hsl(180, 100%, 50%)) to hot colors: red/orange (hsl(0, 100%, 50%))
    const hue = 180 - (normalizedValue * 180) // 180 (cyan) to 0 (red)
    const saturation = 100
    const lightness = 50
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // Update circular progress on value change
  useEffect(() => {
    const progressCircle = document.getElementById(`${id}-progress`) as SVGCircleElement
    if (progressCircle) {
      const normalizedValue = (displayValue - min) / (max - min)
      const circumference = 2 * Math.PI * 40 // radius = 40
      const dashOffset = (1 - normalizedValue) * circumference
      progressCircle.style.strokeDashoffset = dashOffset.toString()
      progressCircle.style.stroke = getColorFromValue(displayValue)
    }
  }, [displayValue, id, min, max])

  return (
    <div className="circular-slider-container" style={{ width: size, height: size }}>
      <div className="circular-progress">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          aria-labelledby={`title-${id}`}
          role="graphic"
        >
          <title id={`title-${id}`}>Circular progress bar for {label}</title>
          <circle cx="50" cy="50" r="40" className="progress-background"></circle>
          <circle
            cx="50"
            cy="50"
            r="40"
            id={`${id}-progress`}
            className="progress-indicator"
          ></circle>
        </svg>
        <div className="progress-percentage">{displayValue}%</div>
      </div>
      <div className="slider-controls">
        <label htmlFor={id} className="sr-only">{label} slider</label>
        <input
          type="range"
          className="custom-range"
          id={id}
          value={displayValue}
          min={min}
          max={max}
          onChange={handleInputChange}
          style={{
            background: `linear-gradient(to right, ${getColorFromValue(min)} 0%, ${getColorFromValue(displayValue)} 50%, ${getColorFromValue(max)} 100%)`
          }}
        />
        <div className="slider-label">{label}</div>
      </div>
    </div>
  )
}