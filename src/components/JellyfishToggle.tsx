import { useGameState } from '../contexts/GameStateContext'

interface JellyfishToggleProps {
  id: string
  label: string
  disabled?: boolean
}

export function JellyfishToggle({ id, label, disabled = false }: JellyfishToggleProps) {
  const { state, dispatch } = useGameState()
  const on = state.controls[id as keyof typeof state.controls] as boolean

  return (
    <div className={`jellyfish-toggle-station ${disabled ? 'disabled' : ''}`}>
      <label className="jellyfish-toggle">
        <input
          type="checkbox"
          checked={on}
          disabled={disabled}
          onChange={() => dispatch({ type: 'TOGGLE_CONTROL', controlId: id as any })}
          aria-label={label}
        />
        <span className="jellyfish-slider" />
      </label>
      <span className="control-label">{label}</span>
    </div>
  )
}
