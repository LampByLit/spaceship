import { useGameState } from '../contexts/GameStateContext'

export function KingConsole() {
  const { state, dispatch } = useGameState()

  // Check if footer toggles (SAFE, ARM, LOCK) are on (excluding KEY)
  const footerTogglesPrimed = state.controls['f0'] && state.controls['f1'] && state.controls['f2']

  const borderColor = state.spaceshipOnline ? '#45bf68' : (state.spaceshipStandby ? '#ffa500' : '#ef4444')

  // Use green for operator engaged state, golden otherwise
  const buttonColors = state.spaceshipOnline
    ? { border: '#45bf68', color: '#45bf68' }
    : { border: '#fbbf24', color: '#fbbf24' }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '12px',
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '8px',
      color: '#45bf68',
      border: `2px solid ${borderColor}`,
      borderRadius: '4px',
      padding: '8px 16px',
      background: 'rgba(69, 191, 104, 0.05)',
      boxShadow: '0 0 10px rgba(69, 191, 104, 0.3)',
      minHeight: '80px'
    }}>
      <div style={{
        background: state.spaceshipOnline ? '#45bf68' : (state.spaceshipStandby ? '#ffa500' : '#ef4444'),
        color: 'black',
        padding: '4px 6px',
        borderRadius: '2px',
        fontSize: '6px'
      }}>
        SPACESHIP: {state.spaceshipOnline ? 'ONLINE' : (state.spaceshipStandby ? 'STANDBY' : 'OFFLINE')}
      </div>
      <button onClick={() => {
        // Only toggle on footer toggles if they're off (prime them) - excluding KEY
        if (!state.controls['f0']) dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f0' })
        if (!state.controls['f1']) dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f1' })
        if (!state.controls['f2']) dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f2' })
      }} style={{
        fontSize: '6px',
        padding: '2px 4px',
        background: '#1a1f22',
        border: `1px solid ${buttonColors.border}`,
        color: buttonColors.color,
        borderRadius: '2px',
        cursor: 'pointer',
        fontFamily: '"Press Start 2P", cursive'
      }}>
        {state.spaceshipOnline ? 'OPERATOR ENGAGED' : (footerTogglesPrimed ? 'PRIMED' : 'PRIME SPACESHIP')}
      </button>
      <button onClick={() => {
        // Kill switch: disengage all subcritical footer toggles
        if (state.controls['f0']) dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f0' })
        if (state.controls['f1']) dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f1' })
        if (state.controls['f2']) dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f2' })
        if (state.controls['f3']) dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f3' })
      }} style={{
        fontSize: '6px',
        padding: '2px 4px',
        background: '#1a1f22',
        border: '1px solid #ef4444',
        color: '#ef4444',
        borderRadius: '2px',
        cursor: 'pointer',
        fontFamily: '"Press Start 2P", cursive'
      }}>
        KILL SWITCH
      </button>
    </div>
  )
}