import { useGameState } from '../../contexts/GameStateContext'
import { JellyfishToggle } from '../JellyfishToggle'
import { CircularSlider } from '../CircularSlider'
import { useState, useEffect } from 'react'

const TOGGLE_LABELS = [
  'AUX.PWR', 'PRIM.PWR', 'SEC.PWR', 'OVERRIDE', 'AUTO.CAL', 'MANUAL',
  'FEED.1', 'FEED.2', 'FEED.3', 'SYNC', 'LOCK', 'RELEASE',
  'SHIELD', 'ISOLATE', 'LATCH', 'EMERGENCY', 'RESET', 'STANDBY',
  'FORWARD', 'REVERSE', 'ACTIVE', 'RECORD', 'MONITOR', 'MUTE',
  'DISTRIBUTE', 'RESERVE', 'BOOST', 'MARGIN', 'CLEAR', 'EXECUTE',
  'DIGITAL.1', 'DIGITAL.2', 'ANALOG', 'CACHE', 'FLUSH', 'BUFFER',
  'LIMIT', 'THRESH', 'GATE', 'COMP', 'LOW.FREQ', 'MID.FREQ', 'HI.FREQ',
]

export function NavigationConsole() {
  const { state, dispatch } = useGameState()
  const [commandInput, setCommandInput] = useState('')

  // Check if navigation should be online based on power and command activation
  const isNavigationOnline = state.systems.power && state.navigationCommandActivated
  const [thrustValue, setThrustValue] = useState(25)
  const [fineValue, setFineValue] = useState(0)
  const [velocityValue, setVelocityValue] = useState(0)
  const [headingValue, setHeadingValue] = useState(0)

  // Use global state for navigation sliders to persist across console switches
  const slider1Value = state.controls['nav-thrust'] as number
  const slider2Value = state.controls['nav-vector'] as number

  const setSlider1Value = (value: number) => {
    dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'nav-thrust', value })
  }
  const setSlider2Value = (value: number) => {
    dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'nav-vector', value })
  }

  // Handle circular progress updates
  useEffect(() => {
    const updateCircularProgress = (sliderId: string, value: number, min: number, max: number) => {
      const progressCircle = document.getElementById(`${sliderId}-progress`) as SVGCircleElement;
      if (progressCircle) {
        // Normalize value to 0-1 range
        const normalizedValue = (value - min) / (max - min);
        // Calculate dash offset (reversed so 0 = full circle, 1 = empty circle)
        const circumference = 2 * Math.PI * 40; // radius = 40
        const dashOffset = (1 - normalizedValue) * circumference;
        progressCircle.style.strokeDashoffset = dashOffset.toString();
      }
    };

    // Initialize all circular progress indicators
    updateCircularProgress('thrust', thrustValue, 0, 100);
    updateCircularProgress('fine', fineValue, -50, 50);
    updateCircularProgress('velocity', velocityValue, 0, 100);
    updateCircularProgress('heading', headingValue, 0, 360);
  }, [thrustValue, fineValue, velocityValue, headingValue]);

  // Add JS class to body for styled range inputs
  useEffect(() => {
    document.documentElement.classList.add('js');

    return () => {
      document.documentElement.classList.remove('js');
    };
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (commandInput.trim()) {
      const command = commandInput.trim().toLowerCase()
      dispatch({ type: 'ADD_NAVIGATION_COMMAND', command: `> ${commandInput}` })

      // Handle navigation commands
      if (command === 'start') {
        dispatch({ type: 'SET_NAVIGATION_COMMAND', activated: true })
        dispatch({
          type: 'ADD_LOG',
          log: {
            timestamp: Date.now(),
            level: 'info',
            message: 'Navigation command interface activated - Navigation systems coming online',
            source: 'Navigation Console'
          }
        })
      } else if (command === 'quit') {
        dispatch({ type: 'SET_NAVIGATION_COMMAND', activated: false })
        dispatch({
          type: 'ADD_LOG',
          log: {
            timestamp: Date.now(),
            level: 'warning',
            message: 'Navigation command interface deactivated - Navigation systems going offline',
            source: 'Navigation Console'
          }
        })
      } else {
        // Unknown command feedback
        dispatch({
          type: 'ADD_LOG',
          log: {
            timestamp: Date.now(),
            level: 'warning',
            message: `Unknown command: ${commandInput}`,
            source: 'Navigation Console'
          }
        })
      }

      setCommandInput('')
    }
  }

  return (
    <>
      {/* Left cluster - Navigation Controls */}
      <section className="control-cluster cluster-left">
        <div className="cluster-title">NAVIGATION CONTROLS</div>
        <div className="navigation-sliders">
          <CircularSlider
            id="nav-slider-1"
            label="THRUST CONTROL"
            value={slider1Value}
            min={0}
            max={100}
            onChange={setSlider1Value}
            size={180}
          />
          <CircularSlider
            id="nav-slider-2"
            label="VECTOR CONTROL"
            value={slider2Value}
            min={0}
            max={100}
            onChange={setSlider2Value}
            size={180}
          />
        </div>
      </section>

      {/* Combined Center - Main Navigation Screen */}
      <section className="control-cluster cluster-center-wide">
        <div className="cluster-title">NAVIGATION SCREEN</div>
        <div className="navigation-screen">
          <div className="screen-placeholder">
            {isNavigationOnline ? (
              <div className="screen-online">
                {/* Blank screen when navigation is online */}
              </div>
            ) : (
              <div className="screen-offline">
                NAVIGATION SYSTEM OFFLINE
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Right cluster - Command Interface */}
      <section className="control-cluster cluster-right">
        <div className="cluster-title">COMMAND INTERFACE</div>
        <div className="command-interface">
          <div className="command-history">
            {state.navigationCommandHistory.map((cmd, index) => (
              <div key={index} className="command-line">{cmd}</div>
            ))}
          </div>
          <form onSubmit={handleCommandSubmit} className="command-input-form">
            <div className="command-prompt">
              <span className="prompt-symbol">&gt;</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="command-input"
                autoFocus
              />
            </div>
          </form>
        </div>
      </section>
    </>
  )
}