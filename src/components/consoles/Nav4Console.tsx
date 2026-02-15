import { useGameState } from '../../contexts/GameStateContext'
import { useEffect } from 'react'
import { PowerButton } from '../PowerButton'
import { JellyfishToggle } from '../JellyfishToggle'
import { SpringToggle } from '../SpringToggle'

export function Nav4Console() {
  const { state, dispatch } = useGameState()

  // Communications Power Supply Logic
  const isCommsMasterOn = state.controls['comms-master']
  const isSpaceshipPowerOnline = state.systems.power

  // Communications online state - requires spaceship power + comms master + PWR.A + PWR.B
  const isCommsOnline = isSpaceshipPowerOnline &&
                       state.controls['comms-master'] &&
                       state.controls['comms-pwr-1'] &&
                       state.controls['comms-pwr-2']

  // Connection toggles list
  const connectionToggles = [
    'conn-radio', 'conn-satellite', 'conn-microwave', 'conn-infrared',
    'conn-laser', 'conn-plasma', 'conn-quantum', 'conn-neural',
    'conn-psionic', 'conn-gravitic', 'conn-temporal', 'conn-dimensional',
    'conn-subspace', 'conn-hyperwave', 'conn-tachyon', 'conn-darkmatter'
  ]

  // Automatically control connection toggles based on communications system state
  useEffect(() => {
    connectionToggles.forEach(toggleId => {
      const shouldBeOn = isCommsOnline
      if (state.controls[toggleId] !== shouldBeOn) {
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: toggleId, value: shouldBeOn })
      }
    })
  }, [isCommsOnline, state.controls, dispatch])

  // Signal strength is full when communications are online (all toggles active)
  const signalStrength = isCommsOnline ? 5 : 0

  return (
    <>
      {/* Panel 1: Power Supply */}
      <section className="control-cluster cluster-left">
        <div className="cluster-title">POWER SUPPLY</div>
        <div className="power-supply-panel">
          {/* Master Switch */}
          <div className="master-switch-section" style={{ marginBottom: '60px' }}>
            <div className="switch">
              <input
                type="checkbox"
                id="comms-master"
                checked={isCommsMasterOn}
                disabled={!isSpaceshipPowerOnline}
                onChange={() => {
                  if (isSpaceshipPowerOnline) {
                    dispatch({ type: 'TOGGLE_CONTROL', controlId: 'comms-master' })
                  }
                }}
              />
              <label htmlFor="comms-master">
                <i></i>
              </label>
            </div>
            <div className="switch-label">COMMS MASTER</div>
          </div>

          {/* Support Power Buttons */}
          <div className="support-power-section" style={{ marginBottom: '60px' }}>
            <div className="power-buttons-row">
              <PowerButton id="comms-pwr-1" label="PWR.A" dark size={0.9} />
              <PowerButton id="comms-pwr-2" label="PWR.B" dark size={0.9} />
            </div>
          </div>

          {/* Communications Status Indicator */}
          <div className="comms-indicator-section">
            <div className="comms-indicator">
              <div className="indicator-light-large">
                <div className={`light green ${isCommsOnline ? 'active blinking-green' : ''}`}></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Panel 2: Outernet Connection */}
      <section className="control-cluster cluster-center-left">
        <div className="cluster-title">OUTERNET CONNECTION</div>
        <div className="outernet-connection-panel">
          {/* Signal Strength Screen */}
          <div className="signal-strength-section">
            <div className={`signal-strength-screen ${isCommsOnline ? 'active' : ''}`}>
              <div className="signal-strength-bars">
                <div className="signal-bar-label">SIGNAL STRENGTH</div>
                <div className="signal-bars">
                  <div className={`signal-bar ${signalStrength >= 1 ? 'active' : ''} strength-1`}></div>
                  <div className={`signal-bar ${signalStrength >= 2 ? 'active' : ''} strength-2`}></div>
                  <div className={`signal-bar ${signalStrength >= 3 ? 'active' : ''} strength-3`}></div>
                  <div className={`signal-bar ${signalStrength >= 4 ? 'active' : ''} strength-4`}></div>
                  <div className={`signal-bar ${signalStrength >= 5 ? 'active' : ''} strength-5`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Type Toggles */}
          <div className="connection-types-section">
            <div className="connection-types-table">
              <div className="connection-row">
                <JellyfishToggle key="conn-radio" id="conn-radio" label="RADIO" />
                <JellyfishToggle key="conn-satellite" id="conn-satellite" label="SATELLITE" />
                <JellyfishToggle key="conn-microwave" id="conn-microwave" label="MICROWAVE" />
                <JellyfishToggle key="conn-infrared" id="conn-infrared" label="INFRARED" />
              </div>
              <div className="connection-row">
                <JellyfishToggle key="conn-laser" id="conn-laser" label="LASER" />
                <JellyfishToggle key="conn-plasma" id="conn-plasma" label="PLASMA" />
                <JellyfishToggle key="conn-quantum" id="conn-quantum" label="QUANTUM" />
                <JellyfishToggle key="conn-neural" id="conn-neural" label="NEURAL" />
              </div>
              <div className="connection-row">
                <JellyfishToggle key="conn-psionic" id="conn-psionic" label="PSIONIC" />
                <JellyfishToggle key="conn-gravitic" id="conn-gravitic" label="GRAVITIC" />
                <JellyfishToggle key="conn-temporal" id="conn-temporal" label="TEMPORAL" />
                <JellyfishToggle key="conn-dimensional" id="conn-dimensional" label="DIMENSIONAL" />
              </div>
              <div className="connection-row">
                <JellyfishToggle key="conn-subspace" id="conn-subspace" label="SUBSPACE" />
                <JellyfishToggle key="conn-hyperwave" id="conn-hyperwave" label="HYPERWAVE" />
                <JellyfishToggle key="conn-tachyon" id="conn-tachyon" label="TACHYON" />
                <JellyfishToggle key="conn-darkmatter" id="conn-darkmatter" label="DARK MATTER" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Panel 3: Signal Processing */}
      <section className="control-cluster cluster-center-right">
        <div className="cluster-title">SIGNAL PROCESSING</div>
        <div className="signal-processing-panel">
          <div className="signal-controls">
            <div className="control-row">
              <JellyfishToggle key="signal-amp" id="signal-amp" label="AMPLIFY" />
              <JellyfishToggle key="signal-filter" id="signal-filter" label="FILTER" />
            </div>
            <div className="control-row">
              <JellyfishToggle key="signal-mod" id="signal-mod" label="MODULATE" />
              <JellyfishToggle key="signal-enc" id="signal-enc" label="ENCRYPT" />
            </div>
          </div>
        </div>
      </section>

      {/* Panel 4: Transmission Control */}
      <section className="control-cluster cluster-right">
        <div className="cluster-title">TRANSMISSION CONTROL</div>
        <div className="transmission-control-panel">
          <div className="transmission-buttons">
            <SpringToggle
              id="transmit-start"
              label="TRANSMIT"
              color="blue"
              disabled={!isCommsOnline}
              onClick={() => {
                if (isCommsOnline) {
                  dispatch({
                    type: 'ADD_LOG',
                    log: {
                      timestamp: Date.now(),
                      level: 'info',
                      message: 'TRANSMISSION STARTED - Broadcasting on all active channels',
                      source: 'Nav4 Console'
                    }
                  })
                }
              }}
            />
            <SpringToggle
              id="receive-mode"
              label="RECEIVE"
              color="green"
              disabled={!isCommsOnline}
              onClick={() => {
                if (isCommsOnline) {
                  dispatch({
                    type: 'ADD_LOG',
                    log: {
                      timestamp: Date.now(),
                      level: 'info',
                      message: 'RECEIVE MODE ACTIVATED - Listening for incoming signals',
                      source: 'Nav4 Console'
                    }
                  })
                }
              }}
            />
          </div>
        </div>
      </section>
    </>
  )
}