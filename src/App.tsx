import './App.css'
import { CommandDisplay } from './components/CommandDisplay'
import { VolumeKnob } from './components/VolumeKnob'
import { PowerButton } from './components/PowerButton'
import { JellyfishToggle } from './components/JellyfishToggle'
import { GameStateProvider, useGameState } from './contexts/GameStateContext'
import { useEffect } from 'react'
import { KingConsole } from './components/KingConsole'
import { SystemsMonitoring } from './components/SystemsMonitoring'
import { NavigationConsole } from './components/consoles/NavigationConsole'
import { Nav8Console } from './components/consoles/Nav8Console'
import { Nav3Console } from './components/consoles/Nav3Console'
import { Nav4Console } from './components/consoles/Nav4Console'
import { useSoundEffects } from './hooks/useSoundEffects'

const TOGGLE_LABELS = [
  'AUX.PWR', 'PRIM.PWR', 'SEC.PWR', 'OVERRIDE', 'AUTO.CAL', 'MANUAL',
  'FEED.1', 'FEED.2', 'FEED.3', 'SYNC', 'LOCK', 'RELEASE',
  'SHIELD', 'ISOLATE', 'LATCH', 'EMERGENCY', 'RESET', 'STANDBY',
  'FORWARD', 'REVERSE', 'ACTIVE', 'RECORD', 'MONITOR', 'MUTE',
  'DISTRIBUTE', 'RESERVE', 'BOOST', 'MARGIN', 'CLEAR', 'EXECUTE',
  'DIGITAL.1', 'DIGITAL.2', 'ANALOG', 'CACHE', 'FLUSH', 'BUFFER',
  'LIMIT', 'THRESH', 'GATE', 'COMP', 'LOW.FREQ', 'MID.FREQ', 'HI.FREQ',
]

function AppContent() {
  const { state, dispatch } = useGameState()
  useSoundEffects()

  // Keyboard navigation for consoles
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'PageUp' || event.key === 'PageDown') {
        event.preventDefault()

        const consoles = ['nav1', 'nav2', 'nav3', 'nav4', 'nav5', 'nav6', 'nav7', 'nav8'] as const
        const currentIndex = consoles.indexOf(state.currentConsole)
        let newIndex: number

        if (event.key === 'PageUp') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : consoles.length - 1
        } else { // PageDown
          newIndex = currentIndex < consoles.length - 1 ? currentIndex + 1 : 0
        }

        const newConsole = consoles[newIndex]
        // Map console index to footer toggle control (nav1 = f4, nav2 = f5, etc.)
        const toggleControlId = `f${newIndex + 4}` as ControlId
        dispatch({ type: 'TOGGLE_CONTROL', controlId: toggleControlId })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.currentConsole, dispatch])

  // Fuel consumption system (global - runs regardless of active console)
  useEffect(() => {
    let fuelConsumptionInterval: NodeJS.Timeout | null = null;

    if (state.systems.engines) {
      // Engine is online - start fuel consumption
      fuelConsumptionInterval = setInterval(() => {
        dispatch({ type: 'CONSUME_FUEL', amount: 0.1 });
      }, 1000); // Consume 0.1% per second
    }

    return () => {
      if (fuelConsumptionInterval) {
        clearInterval(fuelConsumptionInterval);
      }
    };
  }, [state.systems.engines, dispatch]);

  // Update spaceship systems based on control states
  useEffect(() => {
    // Power systems activate when all critical power controls are on
    const powerOnline = state.criticalControlsMet
    if (state.systems.power !== powerOnline) {
      const powerStatus = powerOnline ? 'FULLY OPERATIONAL' : 'CRITICAL FAILURE';
      const powerLevel = powerOnline ? '100%' : '0%';
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: powerOnline ? 'system' : 'critical',
          message: `SHIP POWER STATUS: ${powerStatus} - Power level: ${powerLevel} - All systems ${powerOnline ? 'nominal' : 'offline'}`,
          source: 'Ship Power Core'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'power', status: powerOnline })
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'powerSystems', status: powerOnline })

    // Life support activates with power + specific controls
    const lifeSupportOnline = powerOnline && state.controls['aux-pwr'] && state.controls['prim-pwr']
    if (state.systems.lifeSupport !== lifeSupportOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: lifeSupportOnline ? 'info' : 'critical',
          message: `Life support systems ${lifeSupportOnline ? 'ACTIVE' : 'OFFLINE'}`,
          source: 'Environmental Systems'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'lifeSupport', status: lifeSupportOnline })

    // Engine readiness is tracked separately via power supply panel controls
    const engineReady = state.controls['engine-master'] &&
                       state.controls['engine-pwr-1'] &&
                       state.controls['engine-pwr-2'] &&
                       state.controls['engine-ready-1'] &&
                       state.controls['engine-ready-2']

    // Check if engine power supply controls are still active
    const enginePowerSupplyActive = state.controls['engine-master'] &&
                                   state.controls['engine-pwr-1'] &&
                                   state.controls['engine-pwr-2']

    // If engines are online but power supply is lost, shut down engines
    if (state.systems.engines && !enginePowerSupplyActive) {
      dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engines', status: false })
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: 'critical',
          message: 'ENGINES SHUTDOWN - Power supply disrupted, engines automatically disengaged',
          source: 'Engine Power Supply'
        }
      })
    }

    // If spaceship power goes offline, automatically turn off engine master switch
    if (!state.systems.power && state.controls['engine-master']) {
      dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'engine-master', value: 0 })
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: 'warning',
          message: 'ENGINE MASTER - Automatically disengaged due to power loss',
          source: 'Engine Power Supply'
        }
      })
    }

    if (state.systems.engineReady !== engineReady) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: engineReady ? 'info' : 'warning',
          message: `Engine power supply ${engineReady ? 'PRIMED' : 'STANDBY'} - Engine ${engineReady ? 'ready for engagement' : 'requires power supply setup'}`,
          source: 'Engine Power Supply'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engineReady', status: engineReady })

    // Engines are separate from spaceship power - only activated via nav2 engage command
    // Engine online status is only changed through nav2 navigation console

    // Navigation activates with power + navigation command activation
    const navigationOnline = powerOnline && state.navigationCommandActivated
    if (state.systems.navigation !== navigationOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: navigationOnline ? 'info' : 'warning',
          message: `Navigation systems ${navigationOnline ? 'LOCKED' : 'OFFLINE'}`,
          source: 'Navigation Systems'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'navigation', status: navigationOnline })

    // Shields activate with power + shield controls
    const shieldsOnline = powerOnline && state.controls['shield']
    if (state.systems.shields !== shieldsOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: shieldsOnline ? 'info' : 'warning',
          message: `Shield systems ${shieldsOnline ? 'ACTIVE' : 'OFFLINE'}`,
          source: 'Defensive Systems'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'shields', status: shieldsOnline })

    // Weapons activate with power + weapon controls + safety override (using emergency override)
    const weaponsOnline = powerOnline && state.controls['emergency'] && state.controls['override']
    if (state.systems.weapons !== weaponsOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: weaponsOnline ? 'warning' : 'info',
          message: `Weapon systems ${weaponsOnline ? 'READY' : 'SAFE'}`,
          source: 'Weapons Systems'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'weapons', status: weaponsOnline })

    // Core systems are always online when spaceship has power (online or standby)
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'coreSystems', status: state.spaceshipOnline || state.spaceshipStandby })

    // Communications activate with power + comms master + PWR.A + PWR.B
    const commsPowerSupplyActive = state.controls['comms-master'] &&
                                   state.controls['comms-pwr-1'] &&
                                   state.controls['comms-pwr-2']
    const commsOnline = powerOnline && commsPowerSupplyActive
    if (state.systems.communications !== commsOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: commsOnline ? 'info' : 'warning',
          message: `Communication systems ${commsOnline ? 'ACTIVE' : 'OFFLINE'}`,
          source: 'Communications'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'communications', status: commsOnline })

    // Communications power supply logic - automatically turn off master switch if spaceship power goes offline
    if (!powerOnline && state.controls['comms-master']) {
      dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'comms-master', value: 0 })
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: 'warning',
          message: 'COMMUNICATIONS MASTER - Automatically disengaged due to power loss',
          source: 'Communications Power Supply'
        }
      })
    }

    // Sensors activate with power + sensor controls (using monitor as sensors)
    const sensorsOnline = powerOnline && state.controls['monitor']
    if (state.systems.sensors !== sensorsOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: sensorsOnline ? 'info' : 'warning',
          message: `Sensor array ${sensorsOnline ? 'NOMINAL' : 'OFFLINE'}`,
          source: 'Sensor Systems'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'sensors', status: sensorsOnline })

    // Defensive array activates with shields + defensive controls (using isolate as defensive)
    const defensiveOnline = shieldsOnline && state.controls['isolate']
    if (state.systems.defensiveArray !== defensiveOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: defensiveOnline ? 'info' : 'warning',
          message: `Defensive array ${defensiveOnline ? 'READY' : 'OFFLINE'}`,
          source: 'Defensive Systems'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'defensiveArray', status: defensiveOnline })

    // Propulsion activates with engines + propulsion controls (using forward/reverse)
    const propulsionOnline = state.systems.engines && state.controls['forward']
    if (state.systems.propulsion !== propulsionOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: propulsionOnline ? 'info' : 'warning',
          message: `Propulsion systems ${propulsionOnline ? 'ENGAGED' : 'OFFLINE'}`,
          source: 'Propulsion Systems'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'propulsion', status: propulsionOnline })

    // Cargo systems activate with power + cargo controls (using reserve as cargo)
    const cargoOnline = powerOnline && state.controls['reserve']
    if (state.systems.cargoSystems !== cargoOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: cargoOnline ? 'info' : 'warning',
          message: `Cargo systems ${cargoOnline ? 'ACTIVE' : 'STANDBY'}`,
          source: 'Cargo Management'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'cargoSystems', status: cargoOnline })

    // Maintenance activates with power + maintenance controls (using reset as maintenance)
    const maintenanceOnline = powerOnline && state.controls['reset']
    if (state.systems.maintenance !== maintenanceOnline) {
      dispatch({
        type: 'ADD_LOG',
        log: {
          timestamp: Date.now(),
          level: maintenanceOnline ? 'info' : 'warning',
          message: `Maintenance systems ${maintenanceOnline ? 'ACTIVE' : 'STANDBY'}`,
          source: 'Maintenance'
        }
      })
    }
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'maintenance', status: maintenanceOnline })

    // Emergency protocols are always ready when power is on
    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'emergencyProtocols', status: powerOnline })

  }, [state.controls, state.criticalControlsMet, state.spaceshipOnline])
  return (
    <div className="mark1-panel">
      <header className="panel-header">
        <KingConsole />
        <CommandDisplay />
      </header>

      <main className="panel-main">
        {state.currentConsole === 'nav2' ? (
          <NavigationConsole />
        ) : state.currentConsole === 'nav3' ? (
          <Nav3Console />
        ) : state.currentConsole === 'nav4' ? (
          <Nav4Console />
        ) : state.currentConsole === 'nav8' ? (
          <Nav8Console />
        ) : (
          <>
            {/* Left cluster */}
            <section className="control-cluster cluster-left">
              <div className="cluster-title">MAIN POWER SUPPLY</div>
              <div className="power-buttons-grid">
                <div className="primary-power-buttons">
                  <div style={{ transform: 'scale(1.6)', transformOrigin: 'center', marginBottom: '40px' }}>
                    <PowerButton id="pwr-1" label="PRIMARY" dark size={1.0} />
                  </div>
                  <div style={{ transform: 'scale(1.6)', transformOrigin: 'center', marginBottom: '40px' }}>
                    <PowerButton id="pwr-2" label="SECONDARY" dark size={1.0} />
                  </div>
                </div>
                <div className="secondary-power-buttons">
                  <PowerButton id="pwr-5" label="BACKUP" dark size={0.9} />
                  <PowerButton id="pwr-6" label="AUXILIARY" dark size={0.9} />
                  <PowerButton id="pwr-7" label="EMERGENCY" dark size={0.9} />
                  <PowerButton id="pwr-8" label="SHUTDOWN" dark size={0.85} />
                  <PowerButton id="pwr-9" label="REACTOR" dark size={0.95} />
                  <PowerButton id="pwr-10" label="COOLING" dark size={0.95} />
                </div>
                <div className="master-toggle-section">
                  <div className="switch">
                    <input
                      type="checkbox"
                      id="master-toggle"
                      checked={state.controls['master-toggle'] as boolean}
                      onChange={() => dispatch({ type: 'TOGGLE_CONTROL', controlId: 'master-toggle' })}
                    />
                    <label htmlFor="master-toggle">
                      <i></i>
                    </label>
                  </div>
                  <div className="master-toggle-label">MASTER POWER</div>
                </div>
              </div>
            </section>

            {/* Center-left */}
            <section className="control-cluster cluster-center-left">
              <div className="cluster-title">SYSTEMS STATUS</div>
              <div className="console-readout">
                <div className="readout-line">
                  STATUS: <span className={state.spaceshipOnline ? "status-online" : (state.spaceshipStandby ? "status-caution" : "status-offline")}>
                    {state.spaceshipOnline ? "ONLINE" : (state.spaceshipStandby ? "STANDBY" : "OFFLINE")}
                  </span>
                </div>
                <div className="readout-line">BATTERY POWER: <span className="status-good">{(state.systems.batteryPower || 0).toFixed(1)}%</span></div>
                <div className="readout-line">
                  CORE SYSTEMS: <span className={state.systems.coreSystems ? (state.spaceshipStandby ? "status-caution" : "status-good") : "status-offline"}>
                    {state.systems.coreSystems ? (state.spaceshipStandby ? "STANDBY" : "ONLINE") : "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  POWER SYSTEMS: <span className={state.systems.powerSystems ? (state.spaceshipStandby ? "status-caution" : "status-good") : "status-offline"}>
                    {state.systems.powerSystems ? (state.spaceshipStandby ? "STANDBY" : "NOMINAL") : "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  LIFE SUPPORT: <span className={state.systems.lifeSupport ? "status-good" : "status-offline"}>
                    {state.systems.lifeSupport ? "ACTIVE" : "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  ENGINES: <span className={
                    state.systems.engines ? "status-good" :
                    state.systems.engineReady ? "status-caution" :
                    "status-offline"
                  }>
                    {state.systems.engines ? "ONLINE" :
                     state.systems.engineReady ? "STANDBY" :
                     "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  PROPULSION: <span className={
                    state.systems.propulsion ? "status-good" :
                    !state.systems.engines ? "status-offline" :
                    "status-caution"
                  }>
                    {state.systems.propulsion ? "ENGAGED" :
                     !state.systems.engines ? "OFFLINE" :
                     "STANDBY"}
                  </span>
                </div>
                <div className="readout-line">
                  NAVIGATION: <span className={state.systems.navigation ? "status-good" : "status-offline"}>
                    {state.systems.navigation ? "LOCKED" : "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  COMMUNICATIONS: <span className={state.systems.communications ? "status-good" : "status-offline"}>
                    {state.systems.communications ? "ACTIVE" : "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  SENSORS: <span className={state.systems.sensors ? "status-good" : "status-offline"}>
                    {state.systems.sensors ? "NOMINAL" : "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  SHIELDS: <span className={state.systems.shields ? "status-good" : "status-caution"}>
                    {state.systems.shields ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
                <div className="readout-line">
                  DEFENSIVE ARRAY: <span className={state.systems.defensiveArray ? "status-good" : "status-offline"}>
                    {state.systems.defensiveArray ? "READY" : "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  WEAPONS: <span className={state.systems.weapons ? "status-good" : "status-offline"}>
                    {state.systems.weapons ? "READY" : "OFFLINE"}
                  </span>
                </div>
                <div className="readout-line">
                  CARGO SYSTEMS: <span className={state.systems.cargoSystems ? "status-good" : "status-caution"}>
                    {state.systems.cargoSystems ? "ACTIVE" : "PARTIAL"}
                  </span>
                </div>
                <div className="readout-line">
                  MAINTENANCE: <span className={state.systems.maintenance ? "status-good" : "status-caution"}>
                    {state.systems.maintenance ? "ACTIVE" : "SCHEDULED"}
                  </span>
                </div>
                <div className="readout-line">
                  EMERGENCY PROTOCOLS: <span className={state.systems.emergencyProtocols ? "status-good" : "status-good"}>
                    {state.systems.emergencyProtocols ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
              </div>
            </section>

            {/* Center-right */}
            <section className="control-cluster cluster-center-right">
              <div className="cluster-title">FUEL CELL MONITOR</div>
              <SystemsMonitoring />
            </section>

            {/* Right cluster */}
            <section className="control-cluster cluster-right">
              <div className="cluster-title">BATTERY CONTROL</div>
              <div className="cluster-controls">
                <VolumeKnob id="out-1" label="PORT" size={110} />
                <VolumeKnob id="out-2" label="STARBOARD" size={110} />
                <VolumeKnob id="mon-1" label="PORT.MON" size={100} />
                <VolumeKnob id="mon-2" label="STARBOARD.MON" size={100} />
                <VolumeKnob id="cue-1" label="ALERT" size={90} />
              </div>
              <div className="charge-config-section">
                <div className="config-toggles">
                  <JellyfishToggle key="config-1" id="config-1" label="AUTO" />
                  <JellyfishToggle key="config-2" id="config-2" label="BOOST" />
                  <JellyfishToggle key="config-3" id="config-3" label="REGEN" />
                  <JellyfishToggle key="config-4" id="config-4" label="STANDBY" />
                </div>
                <div className="charge-mode-switch">
                  <div className="switch">
                    <input
                      type="checkbox"
                      id="charge-mode"
                      checked={state.controls['charge-mode'] as boolean}
                      onChange={() => dispatch({ type: 'TOGGLE_CONTROL', controlId: 'charge-mode' })}
                    />
                    <label htmlFor="charge-mode">
                      <i></i>
                    </label>
                  </div>
                  <div className="charge-mode-label">CHARGE MODE</div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Bottom strip - more toggles */}
      <footer className="panel-footer">
        <div className="footer-toggle-strip">
          <span className="keyboard-hint">PgUp</span>
          {['SAFE', 'ARM', 'LOCK', 'KEY', 'NAV.1', 'NAV.2', 'NAV.3', 'NAV.4', 'NAV.5', 'NAV.6', 'NAV.7', 'NAV.8', 'EMERGENCY', 'ABORT'].map((l, i) => (
            <JellyfishToggle key={`f${i}`} id={`f${i}`} label={l} />
          ))}
          <span className="keyboard-hint">PgDn</span>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  )
}
