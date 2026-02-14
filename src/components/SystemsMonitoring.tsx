import { useState, useEffect } from 'react'
import { useGameState } from '../contexts/GameStateContext'

type MonitoringMode = 'standby' | 'scan' | 'repair' | 'diagnostic'
type TargetSystem = 'none' | 'power' | 'engines' | 'shields' | 'weapons' | 'sensors'

export function SystemsMonitoring() {
  const { state, dispatch } = useGameState()
  const [monitoringMode, setMonitoringMode] = useState<MonitoringMode>('standby')
  const [targetSystem, setTargetSystem] = useState<TargetSystem>('none')
  const [gridCells, setGridCells] = useState<boolean[]>(Array(9).fill(false))
  const [puzzleComplete, setPuzzleComplete] = useState(false)

  // Update monitoring mode based on spaceship status
  useEffect(() => {
    if (state.spaceshipOnline || state.spaceshipStandby) {
      setMonitoringMode('diagnostic')
    } else {
      setMonitoringMode('standby')
      setTargetSystem('none')
    }
  }, [state.spaceshipOnline, state.spaceshipStandby])

  // Calculate grid cell activation based on battery control knobs
  useEffect(() => {
    // Always calculate cells, but only show when spaceship is online
    const newGridCells = Array(9).fill(false)

    // Get knob values (0-100)
    const port = state.controls['out-1'] as number || 0
    const starboard = state.controls['out-2'] as number || 0
    const portMon = state.controls['mon-1'] as number || 0
    const starboardMon = state.controls['mon-2'] as number || 0
    const alert = state.controls['cue-1'] as number || 0

    // Check if all knobs are at exactly 50%
    const allAt50 = Math.abs(port - 50) < 1 &&
                    Math.abs(starboard - 50) < 1 &&
                    Math.abs(portMon - 50) < 1 &&
                    Math.abs(starboardMon - 50) < 1 &&
                    Math.abs(alert - 50) < 1

    if (allAt50) {
      // Only center cell is activated when all knobs are at 50%
      newGridCells[4] = true
      setPuzzleComplete(true)
    } else {
      // Activate cells based on knob deviations from 50%
      setPuzzleComplete(false)

      // PORT knob (out-1) - affects top row when not at 50%
      if (Math.abs(port - 50) >= 5) {
        newGridCells[0] = true
        newGridCells[1] = true
        newGridCells[2] = true
      }

      // STARBOARD knob (out-2) - affects bottom row when not at 50%
      if (Math.abs(starboard - 50) >= 5) {
        newGridCells[6] = true
        newGridCells[7] = true
        newGridCells[8] = true
      }

      // PORT.MON knob (mon-1) - affects left column when not at 50%
      if (Math.abs(portMon - 50) >= 5) {
        newGridCells[0] = true
        newGridCells[3] = true
        newGridCells[6] = true
      }

      // STARBOARD.MON knob (mon-2) - affects right column when not at 50%
      if (Math.abs(starboardMon - 50) >= 5) {
        newGridCells[2] = true
        newGridCells[5] = true
        newGridCells[8] = true
      }

      // ALERT knob (cue-1) - affects corners when not at 50%
      if (Math.abs(alert - 50) >= 5) {
        newGridCells[0] = true
        newGridCells[2] = true
        newGridCells[6] = true
        newGridCells[8] = true
      }
    }

    // Update grid based on knob values (always show for testing)
    setGridCells(newGridCells)

    // Puzzle is complete when spaceship has power (online or standby) AND all knobs are at 50%
    setPuzzleComplete((state.spaceshipOnline || state.spaceshipStandby) && allAt50)
  }, [
    state.controls['out-1'],
    state.controls['out-2'],
    state.controls['mon-1'],
    state.controls['mon-2'],
    state.controls['cue-1'],
    state.spaceshipOnline,
    state.spaceshipStandby
  ])


  const getModeStatus = (mode: MonitoringMode) => {
    return monitoringMode === mode ? 'status-good' : 'status-offline'
  }

  const getModeText = (mode: MonitoringMode) => {
    return monitoringMode === mode ? 'ACTIVE' : 'INACTIVE'
  }

  const getDiagnosticStatus = () => {
    return puzzleComplete ? 'status-good' : 'status-caution'
  }

  const getDiagnosticText = () => {
    return puzzleComplete ? 'COMPLETE' : 'IN PROGRESS'
  }

  return (
    <div className="systems-monitoring">
      <div className="monitoring-header">
        <div className="readout-line">
          MONITORING MODE: <span className={getModeStatus(monitoringMode)}>{monitoringMode.toUpperCase()}</span>
        </div>
        <div className="readout-line">
          DIAGNOSTIC: <span className={getDiagnosticStatus()}>{getDiagnosticText()}</span>
        </div>
      </div>

      <div className="monitoring-display">
        <div className="monitoring-grid">
          {gridCells.map((active, index) => (
            <div
              key={index}
              className={`grid-cell ${active ? 'active' : ''} ${index === 4 ? 'center-cell' : ''}`}
            >
              {active ? '■' : '□'}
            </div>
          ))}
        </div>
      </div>

      <div className="monitoring-controls">
        <div className="readout-line">
          PORT: <span className="status-good">{Math.round(state.controls['out-1'] as number || 0)}%</span>
        </div>
        <div className="readout-line">
          STBD: <span className="status-good">{Math.round(state.controls['out-2'] as number || 0)}%</span>
        </div>
        <div className="readout-line">
          STATUS: <span className={puzzleComplete ? 'status-good' : 'status-caution'}>
            {puzzleComplete ? 'BALANCED ✓' : 'UNBALANCED'}
          </span>
        </div>
        {/* Debug buttons - remove after testing */}
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => {
            // Set all knobs to perfect calibration (50%)
            dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'out-1', value: 50 })
            dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'out-2', value: 50 })
            dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'mon-1', value: 50 })
            dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'mon-2', value: 50 })
            dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'cue-1', value: 50 })
          }} style={{ fontSize: '8px', padding: '2px 4px', margin: '2px' }}>
            CALIBRATE ALL
          </button>
          <button onClick={() => {
            // Set one knob off-balance to show the effect
            dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'out-1', value: 0 })
          }} style={{ fontSize: '8px', padding: '2px 4px', margin: '2px' }}>
            SHOW IMBALANCE
          </button>
        </div>
      </div>
    </div>
  )
}