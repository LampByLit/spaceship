import { useGameState } from '../contexts/GameStateContext'
import { useState, useEffect } from 'react'

interface SpringToggleProps {
  id: string
  label: string
  color: 'green' | 'red'
  onClick: () => void
  disabled?: boolean
  resetDelay?: number
}

export function SpringToggle({ id, label, color, onClick, disabled = false, resetDelay = 500 }: SpringToggleProps) {
  const [pressed, setPressed] = useState(false)
  const { state } = useGameState()

  const handleClick = () => {
    if (disabled) return

    setPressed(true)
    onClick()

    // Auto-reset after delay
    setTimeout(() => {
      setPressed(false)
    }, resetDelay)
  }

  return (
    <div className={`spring-toggle-station spring-toggle-${color} ${disabled ? 'disabled' : ''}`}>
      <button
        className={`spring-toggle ${pressed ? 'pressed' : ''}`}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={label}
      >
        <span className="spring-toggle__lever"></span>
      </button>
    </div>
  )
}