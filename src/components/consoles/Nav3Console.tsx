import { useGameState } from '../../contexts/GameStateContext'
import { useState, useEffect } from 'react'
import { CircularSlider } from '../CircularSlider'
import { PowerButton } from '../PowerButton'
import { JellyfishToggle } from '../JellyfishToggle'
import { SpringToggle } from '../SpringToggle'
import { useSoundEffects } from '../../hooks/useSoundEffects'

export function Nav3Console() {
  const { state, dispatch } = useGameState()
  const { playEngineStartupSound } = useSoundEffects()

  // Engine performance states
  const [thrustLevel, setThrustLevel] = useState(0)
  const [powerOutput, setPowerOutput] = useState(0)

  // Command interface state
  const [commandInput, setCommandInput] = useState('')

  // Update circular progress indicators
  useEffect(() => {
    const updateCircularProgress = (sliderId: string, value: number, min: number, max: number) => {
      const progressCircle = document.getElementById(`${sliderId}-progress`) as SVGCircleElement;
      if (progressCircle) {
        const normalizedValue = (value - min) / (max - min);
        const circumference = 2 * Math.PI * 40;
        const dashOffset = (1 - normalizedValue) * circumference;
        progressCircle.style.strokeDashoffset = dashOffset.toString();
      }
    };

    updateCircularProgress('engine-thrust', thrustLevel, 0, 100);
    updateCircularProgress('power-out', powerOutput, 0, 100);
  }, [thrustLevel, powerOutput]);

  // Add JS class to body for styled range inputs
  useEffect(() => {
    document.documentElement.classList.add('js');
    return () => {
      document.documentElement.classList.remove('js');
    };
  }, []);

  // Engine startup process
  useEffect(() => {
    if (state.systems.engineStarting) {
      const startTime = state.systems.engineStartupStartTime;
      const duration = 5000; // 5 seconds
      const endTime = startTime + duration;

      const updateProgress = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);

        dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engineStartupProgress', status: progress });

        if (now >= endTime) {
          // Startup complete - check for failure
          const failureChance = state.systems.starterDamage / 100;
          const failed = Math.random() < failureChance;

          if (failed) {
            // Engine startup failed - reset ready toggles
            dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engineStarting', status: false });
            dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engineStartupProgress', status: 0 });
            dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'engine-ready-1', value: 0 }); // Turn off ready 1
            dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'engine-ready-2', value: 0 }); // Turn off ready 2
            dispatch({
              type: 'ADD_LOG',
              log: {
                timestamp: Date.now(),
                level: 'critical',
                message: 'ENGINE STARTUP FAILED - Starter damage caused ignition failure. Ready toggles reset.',
                source: 'Nav3 Console'
              }
            });
          } else {
            // Engine startup successful
            dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engines', status: true });
            dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engineStarting', status: false });
            dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engineStartupProgress', status: 0 });
            dispatch({
              type: 'ADD_LOG',
              log: {
                timestamp: Date.now(),
                level: 'system',
                message: 'ENGINE STARTUP COMPLETE - Propulsion systems online and ready for thrust commands',
                source: 'Nav3 Console'
              }
            });
          }
        } else {
          // Continue updating progress
          setTimeout(updateProgress, 100);
        }
      };

      updateProgress();
    }
  }, [state.systems.engineStarting, state.systems.engineStartupStartTime, state.systems.starterDamage, dispatch]);

  const isEnginesOnline = state.systems.engines
  const isPropulsionOnline = state.systems.propulsion

  // Power Supply Panel Logic
  const isEngineMasterOn = state.controls['engine-master']
  const isEngineReady = state.systems.engineReady


  // Temperature control system
  useEffect(() => {
    let temperatureInterval: NodeJS.Timeout | null = null;
    let targetTemperature = 150; // Default offline temperature
    let changeRate = 5; // Degrees per second

    // Determine target temperature based on engine state
    if (!state.systems.power) {
      // Spaceship power offline - go to 0°C
      targetTemperature = 0;
      changeRate = 2; // Slow change when cooling to 0
    } else if (state.systems.engineStarting) {
      // Engine starting - quickly go to 2000°C
      targetTemperature = 2000;
      changeRate = 20; // Fast change during startup
    } else if (state.systems.engines) {
      // Engine online - slowly go to 2200°C
      targetTemperature = 2200;
      changeRate = 5; // Moderate change to operating temp
    } else if (state.systems.engineReady) {
      // Engine ready - slowly go to 1000°C
      targetTemperature = 1000;
      changeRate = 5; // Moderate change to ready temp
    } else {
      // Default offline state with power on
      targetTemperature = 150;
      changeRate = 5;
    }

    // Start temperature adjustment
    temperatureInterval = setInterval(() => {
      const currentTemp = state.systems.reactorTemperature;
      const difference = targetTemperature - currentTemp;

      if (Math.abs(difference) < 1) {
        // Close enough to target, stop adjusting
        if (temperatureInterval) {
          clearInterval(temperatureInterval);
        }
        return;
      }

      // Calculate new temperature (approach target gradually)
      const adjustment = Math.sign(difference) * Math.min(changeRate, Math.abs(difference));
      const newTemperature = Math.max(0, currentTemp + adjustment);

      dispatch({ type: 'SET_SYSTEM_STATUS', system: 'reactorTemperature', status: Math.round(newTemperature) });
    }, 1000); // Update every second

    return () => {
      if (temperatureInterval) {
        clearInterval(temperatureInterval);
      }
    };
  }, [state.systems.power, state.systems.engineReady, state.systems.engineStarting, state.systems.engines, state.systems.reactorTemperature, dispatch]);

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
            source: 'Nav3 Console'
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
            source: 'Nav3 Console'
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
            source: 'Nav3 Console'
          }
        })
      }

      setCommandInput('')
    }
  }

  // Engine indicator logic
  const getEngineIndicatorState = () => {
    if (isEnginesOnline) return 'green' // Engine is online
    if (state.systems.engineStarting) return 'flashing-amber' // Engine starting up
    if (isEngineReady) return 'amber' // Engine primed/ready
    return 'red' // Engine off
  }

  const engineIndicatorState = getEngineIndicatorState()

  return (
    <>
      {/* Panel 1: Power Supply */}
      <section className="control-cluster cluster-left">
        <div className="cluster-title">POWER SUPPLY</div>
        <div className="power-supply-panel">
          {/* Master Switch */}
          <div className="master-switch-section">
            <div className="switch">
              <input
                type="checkbox"
                id="engine-master"
                checked={isEngineMasterOn}
                onChange={() => dispatch({ type: 'TOGGLE_CONTROL', controlId: 'engine-master' })}
              />
              <label htmlFor="engine-master">
                <i></i>
              </label>
            </div>
            <div className="switch-label">ENGINE MASTER</div>
          </div>

          {/* Support Power Buttons */}
          <div className="support-power-section">
            <div className="power-buttons-row">
              <PowerButton id="engine-pwr-1" label="PWR.A" dark size={0.9} />
              <PowerButton id="engine-pwr-2" label="PWR.B" dark size={0.9} />
            </div>
          </div>

          {/* Engine Ready Toggles */}
          <div className="engine-ready-section">
            <div className="ready-toggles">
              <JellyfishToggle key="engine-ready-1" id="engine-ready-1" label="READY.1" />
              <JellyfishToggle key="engine-ready-2" id="engine-ready-2" label="READY.2" />
              <JellyfishToggle key="engine-ready-3" id="engine-ready-3" label="READY.3" />
              <JellyfishToggle key="engine-ready-4" id="engine-ready-4" label="READY.4" />
              <JellyfishToggle key="engine-ready-5" id="engine-ready-5" label="READY.5" />
              <JellyfishToggle key="engine-ready-6" id="engine-ready-6" label="READY.6" />
            </div>
          </div>

          {/* Engine Status Indicator */}
          <div className="engine-indicator-section">
            <div className="engine-indicator">
              <div className="indicator-light-large">
                <div className={`light red ${!isEngineReady && !isEnginesOnline && !state.systems.engineStarting ? 'active' : ''}`}></div>
                <div className={`light ${engineIndicatorState === 'flashing-amber' ? 'flashing-amber active' : engineIndicatorState === 'amber' ? 'amber active' : 'amber'}`}></div>
                <div className={`light green ${isEnginesOnline ? 'active' : ''}`}></div>
              </div>
            </div>
          </div>

          {/* Engine Control Toggles */}
          <div className="engine-control-section">
            <div className="engine-toggles">
              <SpringToggle
                id="engine-start"
                label="START"
                color="green"
                disabled={state.systems.engineStarting || state.systems.engines}
                onClick={() => {
                  if (isEngineReady && !state.systems.engineStarting && !state.systems.engines) {
                    // Start the 5-second startup process
                    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engineStarting', status: true });
                    dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engineStartupStartTime', status: Date.now() });
                    dispatch({
                      type: 'ADD_LOG',
                      log: {
                        timestamp: Date.now(),
                        level: 'info',
                        message: 'ENGINE STARTUP INITIATED - 5-second ignition sequence beginning',
                        source: 'Nav3 Console'
                      }
                    });
                  } else if (state.systems.engineStarting) {
                    dispatch({
                      type: 'ADD_LOG',
                      log: {
                        timestamp: Date.now(),
                        level: 'warning',
                        message: 'START ATTEMPTED - Engine startup already in progress',
                        source: 'Nav3 Console'
                      }
                    });
                  } else if (state.systems.engines) {
                    dispatch({
                      type: 'ADD_LOG',
                      log: {
                        timestamp: Date.now(),
                        level: 'warning',
                        message: 'START ATTEMPTED - Engine already running',
                        source: 'Nav3 Console'
                      }
                    });
                  } else {
                    dispatch({
                      type: 'ADD_LOG',
                      log: {
                        timestamp: Date.now(),
                        level: 'warning',
                        message: 'START ATTEMPTED - Engine power supply not primed. Check power supply status.',
                        source: 'Nav3 Console'
                      }
                    });
                  }
                }}
              />
              <SpringToggle
                id="engine-stop"
                label="STOP"
                color="red"
                disabled={false}
                onClick={() => {
                  dispatch({ type: 'SET_SYSTEM_STATUS', system: 'engines', status: false })
                  dispatch({
                    type: 'ADD_LOG',
                    log: {
                      timestamp: Date.now(),
                      level: 'warning',
                      message: 'ENGINES STOPPED - Propulsion systems offline',
                      source: 'Nav3 Console'
                    }
                  })
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Panel 2: Fuel Systems */}
      <section className="control-cluster cluster-center-left">
        <div className="cluster-title">FUEL SYSTEMS</div>
        <div className="fuel-systems-panel">
          <div className="fuel-metrics">
            <div className="fuel-gauge">
              <div className="gauge-label">MAIN FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill"
                  style={{ width: `${state.systems.mainFuel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.mainFuel.toFixed(1)}%</div>
              <div className="fuel-type">U-235 ENRICHED</div>
              <div className="usage-arrow usage-consumption">{!state.systems.engines ? '/' : '↓'}</div>
            </div>

            <div className="fuel-gauge">
              <div className="gauge-label">RESERVE FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill reserve"
                  style={{ width: `${state.systems.reserveFuel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.reserveFuel.toFixed(1)}%</div>
              <div className="fuel-type">PU-239 CORE</div>
              <div className="usage-arrow usage-consumption">{!state.systems.engines ? '/' : '↓'}</div>
            </div>

            <div className="fuel-gauge">
              <div className="gauge-label">BOOST FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill boost"
                  style={{ width: `${state.systems.boostFuel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.boostFuel.toFixed(1)}%</div>
              <div className="fuel-type">U-233 ALLOY</div>
              <div className="usage-arrow usage-consumption">{!state.systems.engines ? '/' : '↓'}</div>
            </div>

            <div className="fuel-gauge">
              <div className="gauge-label">EMERGENCY FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill emergency"
                  style={{ width: `${state.systems.emergencyFuel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.emergencyFuel.toFixed(1)}%</div>
              <div className="fuel-type">TH-232 PELLET</div>
              <div className="usage-arrow usage-consumption">{!state.systems.engines ? '/' : '↓'}</div>
            </div>

            <div className="fuel-gauge">
              <div className="gauge-label">COOLANT FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill coolant"
                  style={{ width: `${state.systems.coolantFuel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.coolantFuel.toFixed(1)}%</div>
              <div className="fuel-type">LI-6 MODERATOR</div>
              <div className="usage-arrow">{!state.systems.engines ? '/' : '←→'}</div>
            </div>

            <div className="fuel-gauge">
              <div className="gauge-label">AUXILIARY FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill auxiliary"
                  style={{ width: `${state.systems.auxiliaryFuel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.auxiliaryFuel.toFixed(1)}%</div>
              <div className="fuel-type">AM-241 SOURCE</div>
              <div className="usage-arrow">/</div>
            </div>

            <div className="fuel-gauge">
              <div className="gauge-label">MANEUVER FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill maneuver"
                  style={{ width: `${state.systems.maneuverFuel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.maneuverFuel.toFixed(1)}%</div>
              <div className="fuel-type">NP-237 MATRIX</div>
              <div className="usage-arrow">{!state.systems.engines ? '/' : '←→'}</div>
            </div>

            <div className="fuel-gauge">
              <div className="gauge-label">SCRAM FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill scram"
                  style={{ width: `${state.systems.scramFuel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.scramFuel.toFixed(1)}%</div>
              <div className="fuel-type">CF-252 NEUTRON</div>
              <div className="usage-arrow usage-consumption">{!state.systems.engines ? '/' : '↓'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Panel 3: Reactor Observation */}
      <section className="control-cluster cluster-center-right">
        <div className="cluster-title">REACTOR OBSERVATION</div>
        <div className="reactor-observation-panel">
          <div className="reactor-grid">
            <div className="grid-row">
              <div className="grid-cell">CORE TEMP</div>
              <div className="grid-cell">{state.systems.reactorTemperature}°C</div>
              <div className={`grid-cell ${state.systems.reactorTemperature > 2800 ? 'status-critical' : state.systems.reactorTemperature > 2500 ? 'status-warning' : 'status-normal'}`}>
                {state.systems.reactorTemperature > 2800 ? 'CRITICAL' : state.systems.reactorTemperature > 2500 ? 'WARNING' : 'NORMAL'}
              </div>
            </div>
            <div className="grid-row">
              <div className="grid-cell">NEUTRON FLUX</div>
              <div className="grid-cell">{state.systems.engines ? (Math.random() * 100 + 900).toFixed(0) : '0'}</div>
              <div className="grid-cell">n/cm²</div>
            </div>
            <div className="grid-row">
              <div className="grid-cell">REACTOR STATE</div>
              <div className={`grid-cell ${state.systems.engines ? 'status-active' : 'status-standby'}`}>
                {state.systems.engines ? 'CRITICAL' : 'SUBCRITICAL'}
              </div>
              <div className="grid-cell">{state.systems.engines ? 'ACTIVE' : 'STANDBY'}</div>
            </div>
          </div>

          <div className="reactor-core-grid">
            <div className="core-row">
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>1</div>
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>2</div>
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>3</div>
            </div>
            <div className="core-row">
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>4</div>
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>5</div>
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>6</div>
            </div>
            <div className="core-row">
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>7</div>
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>8</div>
              <div className={`core-cell ${state.systems.engines ? (state.systems.reactorTemperature > 2800 ? 'core-critical' : state.systems.reactorTemperature > 2500 ? 'core-warning' : 'core-active') : 'core-inactive'}`}>9</div>
            </div>
          </div>
        </div>
      </section>

      {/* Panel 4: Command Interface */}
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