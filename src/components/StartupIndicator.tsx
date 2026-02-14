import { useGameState } from '../contexts/GameStateContext'

export function StartupIndicator() {
  const { state, dispatch } = useGameState()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '8px',
      color: '#45bf68'
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
        // Turn on all critical controls
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'pwr-1' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'pwr-2' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'pwr-5' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'pwr-6' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'pwr-7' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'pwr-8' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'pwr-9' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'pwr-10' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'master-toggle' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f0' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f1' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f2' })
        dispatch({ type: 'TOGGLE_CONTROL', controlId: 'f3' })
      }} style={{
        fontSize: '6px',
        padding: '2px 4px',
        background: '#1a1f22',
        border: '1px solid #45bf68',
        color: '#45bf68',
        borderRadius: '2px',
        cursor: 'pointer',
        fontFamily: '"Press Start 2P", cursive'
      }}>
        TURN ON SHIP
      </button>
    </div>
  )
}