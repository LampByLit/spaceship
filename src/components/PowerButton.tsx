import { useGameState } from '../contexts/GameStateContext'

interface PowerButtonProps {
  id: string
  label: string
  dark?: boolean
  size?: number
}

export function PowerButton({ id, label, dark = true, size = 1 }: PowerButtonProps) {
  const { state, dispatch } = useGameState()
  const pressed = state.controls[id as keyof typeof state.controls] as boolean

  return (
    <div className={`power-btn-station ${dark ? 'col--dark' : ''}`} style={{ fontSize: `${size * 0.7}rem` }}>
      <span className="control-label">{label}</span>
      <button
        className="power-btn"
        type="button"
        aria-pressed={pressed}
        onClick={() => dispatch({ type: 'TOGGLE_CONTROL', controlId: id as any })}
      >
        <svg className="power-btn__icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="12,1 12,10" />
            <circle fill="none" cx="12" cy="13" r="9" strokeDasharray="49.48 7.07" strokeDashoffset="10.6" />
          </g>
        </svg>
        <span className="power-btn__sr">{label}</span>
      </button>
    </div>
  )
}
